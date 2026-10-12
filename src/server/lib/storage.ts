import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// File storage on Cloudflare R2 (S3-compatible). The browser uploads straight
// to R2 with a short-lived presigned URL, so files never pass through our server.
//   private bucket → product files (PDFs); only reachable through signed links
//   public bucket  → product cover images, served from R2_PUBLIC_URL
// Without R2 credentials in development, objects are stored in ./.storage and
// served by /api/dev-storage with the same kind of signed, expiring URLs.

export const ASSET_TYPES = {
  "application/zip": "zip",
  "application/x-zip-compressed": "zip", // Windows browsers
  "application/pdf": "pdf",
} as const;
export type AssetType = keyof typeof ASSET_TYPES;
export const MAX_ASSET_BYTES = 500 * 1024 * 1024; // 500 MB

export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;
export type ImageType = keyof typeof IMAGE_TYPES;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export type Bucket = "private" | "public";

function r2Config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PRIVATE_BUCKET, R2_PUBLIC_BUCKET, R2_PUBLIC_URL } =
    process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PRIVATE_BUCKET || !R2_PUBLIC_BUCKET || !R2_PUBLIC_URL) {
    return null;
  }
  return {
    buckets: { private: R2_PRIVATE_BUCKET, public: R2_PUBLIC_BUCKET },
    publicUrl: R2_PUBLIC_URL.replace(/\/+$/, ""),
    client: new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    }),
  };
}

let cached: ReturnType<typeof r2Config> | undefined;
const r2 = () => (cached ??= r2Config());

/** Local-disk fallback: development only, never in production. */
const devStorageEnabled = () => !r2() && process.env.NODE_ENV !== "production";

/** Storage is usable (R2, or the dev fallback). */
export const isStorageConfigured = () => !!r2() || devStorageEnabled();

const keyFor = (folder: string, ext: string) => `${folder}/${new Date().getUTCFullYear()}/${randomUUID()}.${ext}`;

// ── Dev fallback: HMAC-signed URLs to /api/dev-storage ─────────────────────

export type DevOp = "put" | "get";

function devSignature(op: DevOp, bucket: Bucket, key: string, exp: number, extra = "") {
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "dev")
    .update(`${op}\n${bucket}\n${key}\n${exp}\n${extra}`)
    .digest("hex");
}

function devUrl(op: DevOp, bucket: Bucket, key: string, expiresIn: number, extra?: { fileName?: string }) {
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const params = new URLSearchParams({ op, bucket, key, exp: String(exp) });
  if (extra?.fileName) params.set("name", extra.fileName);
  params.set("sig", devSignature(op, bucket, key, exp, extra?.fileName ?? ""));
  return `/api/dev-storage?${params}`;
}

/** Checks a dev-storage URL's signature and expiry. */
export function verifyDevUrl(p: { op: DevOp; bucket: Bucket; key: string; exp: number; name?: string; sig: string }) {
  if (!devStorageEnabled() || p.exp < Date.now() / 1000) return false;
  const expected = Buffer.from(devSignature(p.op, p.bucket, p.key, p.exp, p.name ?? ""));
  const given = Buffer.from(p.sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Presigned PUT for a product file (private bucket). Type and size are signed. */
export async function presignAssetUpload(contentType: AssetType, size: number) {
  const key = keyFor("assets", ASSET_TYPES[contentType]);
  const c = r2();
  if (!c) {
    if (!devStorageEnabled()) throw new Error("File storage (R2) is not configured");
    return { key, uploadUrl: devUrl("put", "private", key, 600) };
  }
  const uploadUrl = await getSignedUrl(
    c.client,
    new PutObjectCommand({ Bucket: c.buckets.private, Key: key, ContentType: contentType, ContentLength: size }),
    { expiresIn: 600 },
  );
  return { key, uploadUrl };
}

/** Presigned PUT for a product image (public bucket). */
export async function presignImageUpload(contentType: ImageType, size: number) {
  const key = keyFor("products", IMAGE_TYPES[contentType]);
  const c = r2();
  if (!c) {
    if (!devStorageEnabled()) throw new Error("File storage (R2) is not configured");
    // Dev "public" URLs are long-lived signed GETs.
    return { key, uploadUrl: devUrl("put", "public", key, 600), publicUrl: devUrl("get", "public", key, 60 * 60 * 24 * 365) };
  }
  const uploadUrl = await getSignedUrl(
    c.client,
    new PutObjectCommand({
      Bucket: c.buckets.public,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn: 300 },
  );
  return { key, uploadUrl, publicUrl: `${c.publicUrl}/${key}` };
}

/**
 * Short-lived download link for a private file (default 10 minutes), saved
 * under `fileName` by the browser.
 */
export async function signedDownloadUrl(key: string, fileName: string, expiresIn = 600) {
  const c = r2();
  if (!c) {
    if (!devStorageEnabled()) throw new Error("File storage (R2) is not configured");
    return devUrl("get", "private", key, expiresIn, { fileName });
  }
  const safeName = fileName.replace(/["\\\r\n]/g, "");
  return getSignedUrl(
    c.client,
    new GetObjectCommand({
      Bucket: c.buckets.private,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeName}"`,
    }),
    { expiresIn },
  );
}

/** Best-effort delete (replaced files, removed images). Never throws. */
export async function deleteObjects(bucket: Bucket, keys: string[]) {
  if (keys.length === 0) return;
  const c = r2();
  try {
    if (!c) {
      if (!devStorageEnabled()) return;
      const { rm } = await import("node:fs/promises");
      const { devPath } = await import("./dev-storage");
      await Promise.all(keys.map((k) => rm(devPath(bucket, k), { force: true })));
      return;
    }
    await c.client.send(
      new DeleteObjectsCommand({ Bucket: c.buckets[bucket], Delete: { Objects: keys.map((Key) => ({ Key })) } }),
    );
  } catch (err) {
    console.error("Storage delete failed", err);
  }
}
