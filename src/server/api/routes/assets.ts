import { Hono } from "hono";
import { z } from "zod";
import { updateAssetSchema } from "@/lib/validations/asset";
import {
  AssetError,
  assetOwnerCount,
  assetPreviewUrl,
  deleteAsset,
  releaseAsset,
  updateAsset,
} from "@/server/services/assets";
import { ASSET_TYPES, type AssetType, isStorageConfigured, MAX_ASSET_BYTES, presignAssetUpload } from "@/server/lib/storage";
import { validate } from "../lib/validate";
import { type AuthEnv, requirePermission } from "../middleware/auth";

const idParam = validate("param", z.object({ id: z.uuid() }));
const assetTypes = Object.keys(ASSET_TYPES) as [AssetType, ...AssetType[]];

function fail(err: unknown) {
  if (err instanceof AssetError) return { error: err.message, status: err.status };
  throw err;
}

export const assetRoutes = new Hono<AuthEnv>()
  .post(
    "/presign",
    requirePermission({ product: ["update"] }),
    validate(
      "json",
      z.object({
        contentType: z.enum(assetTypes, { error: "Upload a ZIP or PDF file" }),
        size: z.number().int().positive().max(MAX_ASSET_BYTES, "File is too large (500 MB max)"),
      }),
    ),
    async (c) => {
      if (!isStorageConfigured()) return c.json({ error: "File storage (R2) is not configured" }, 503);
      const { contentType, size } = c.req.valid("json");
      return c.json(await presignAssetUpload(contentType, size));
    },
  )
  // Replace the file and/or set or clear the pre-sale "arrives by" date.
  .patch("/:id", requirePermission({ product: ["update"] }), idParam, validate("json", updateAssetSchema), async (c) => {
    try {
      return c.json(await updateAsset(c.req.valid("param").id, c.req.valid("json")));
    } catch (err) {
      const { error, status } = fail(err);
      return c.json({ error }, status);
    }
  })
  .delete("/:id", requirePermission({ product: ["delete"] }), idParam, async (c) => {
    try {
      await deleteAsset(c.req.valid("param").id);
      return c.json({ ok: true });
    } catch (err) {
      const { error, status } = fail(err);
      return c.json({ error }, status);
    }
  })
  // Pre-sale → ready: clears "Arrives by" and emails every buyer who owns it.
  .post("/:id/release", requirePermission({ product: ["update"] }), idParam, async (c) => {
    try {
      return c.json(await releaseAsset(c.req.valid("param").id, c.get("user").id));
    } catch (err) {
      const { error, status } = fail(err);
      return c.json({ error }, status);
    }
  })
  .get("/:id/owners", requirePermission({ product: ["read"] }), idParam, async (c) => {
    return c.json({ count: await assetOwnerCount(c.req.valid("param").id) });
  })
  // Open/download the asset from the admin (short-lived signed link).
  .get("/:id/preview", requirePermission({ product: ["read"] }), idParam, async (c) => {
    try {
      return c.redirect(await assetPreviewUrl(c.req.valid("param").id));
    } catch (err) {
      const { error, status } = fail(err);
      return c.json({ error }, status);
    }
  });
