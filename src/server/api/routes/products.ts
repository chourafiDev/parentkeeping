import { Hono } from "hono";
import { z } from "zod";
import { addAssetsSchema } from "@/lib/validations/asset";
import { productInputSchema } from "@/lib/validations/product";
import { addAssets, AssetError } from "@/server/services/assets";
import { createProduct, ProductError, updateProduct } from "@/server/services/products";
import { IMAGE_TYPES, type ImageType, isStorageConfigured, MAX_IMAGE_BYTES, presignImageUpload } from "@/server/lib/storage";
import { validate } from "../lib/validate";
import { type AuthEnv, requirePermission } from "../middleware/auth";

const idParam = validate("param", z.object({ id: z.uuid() }));
const imageTypes = Object.keys(IMAGE_TYPES) as [ImageType, ...ImageType[]];

function fail(err: unknown) {
  if (err instanceof ProductError || err instanceof AssetError) return { error: err.message, status: err.status };
  throw err;
}

export const productRoutes = new Hono<AuthEnv>()
  .post("/", requirePermission({ product: ["create"] }), validate("json", productInputSchema), async (c) => {
    try {
      return c.json(await createProduct(c.req.valid("json")), 201);
    } catch (err) {
      const { error, status } = fail(err);
      return c.json({ error }, status);
    }
  })
  .patch("/:id", requirePermission({ product: ["update"] }), idParam, validate("json", productInputSchema), async (c) => {
    try {
      return c.json(await updateProduct(c.req.valid("param").id, c.req.valid("json")));
    } catch (err) {
      const { error, status } = fail(err);
      return c.json({ error }, status);
    }
  })
  .post(
    "/images/presign",
    requirePermission({ product: ["update"] }),
    validate(
      "json",
      z.object({
        contentType: z.enum(imageTypes, { error: "Use a JPG, PNG, WEBP or AVIF image" }),
        size: z.number().int().positive().max(MAX_IMAGE_BYTES, "Image is too large (10 MB max)"),
        fileName: z.string().max(255).optional(),
      }),
    ),
    async (c) => {
      if (!isStorageConfigured()) return c.json({ error: "File storage (R2) is not configured" }, 503);
      const { contentType, size, fileName } = c.req.valid("json");
      return c.json(await presignImageUpload(contentType, size, fileName));
    },
  )
  // "Add files": attach uploaded files to this product (Shopify Digital Products).
  .post(
    "/:id/assets",
    requirePermission({ product: ["update"] }),
    idParam,
    validate("json", addAssetsSchema),
    async (c) => {
      try {
        return c.json(await addAssets(c.req.valid("param").id, c.req.valid("json").files), 201);
      } catch (err) {
        const { error, status } = fail(err);
        return c.json({ error }, status);
      }
    },
  );
