import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Hono } from "hono";
import { devPath } from "@/server/lib/dev-storage";
import { type Bucket, type DevOp, verifyDevUrl } from "@/server/lib/storage";

// Development stand-in for R2 presigned URLs (see server/lib/storage.ts).
// Every request needs a valid, unexpired signature; disabled in production.

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  zip: "application/zip",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

function readParams(url: string) {
  const q = new URL(url).searchParams;
  return {
    op: q.get("op") as DevOp,
    bucket: (q.get("bucket") === "public" ? "public" : "private") as Bucket,
    key: q.get("key") ?? "",
    exp: Number(q.get("exp")),
    name: q.get("name") ?? undefined,
    sig: q.get("sig") ?? "",
  };
}

export const devStorageRoutes = new Hono()
  .put("/", async (c) => {
    const p = readParams(c.req.url);
    if (p.op !== "put" || !verifyDevUrl(p)) return c.json({ error: "Forbidden" }, 403);
    const file = devPath(p.bucket, p.key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(await c.req.arrayBuffer()));
    return c.body(null, 200);
  })
  .get("/", async (c) => {
    const p = readParams(c.req.url);
    if (p.op !== "get" || !verifyDevUrl(p)) return c.json({ error: "Forbidden" }, 403);
    const data = await readFile(devPath(p.bucket, p.key)).catch(() => null);
    if (!data) return c.json({ error: "Not found" }, 404);
    const ext = p.key.split(".").pop() ?? "";
    const headers: Record<string, string> = { "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream" };
    if (p.name) headers["Content-Disposition"] = `attachment; filename="${p.name.replace(/["\\\r\n]/g, "")}"`;
    return c.body(new Uint8Array(data), 200, headers);
  });
