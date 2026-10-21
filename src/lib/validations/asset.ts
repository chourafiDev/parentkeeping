import { z } from "zod";

// Assets work like Shopify Digital Products: files uploaded to a product
// (each product's final files come as one ZIP; PDFs are accepted too).

export const ASSET_CONTENT_TYPES = ["application/zip", "application/x-zip-compressed", "application/pdf"] as const;
export type AssetContentType = (typeof ASSET_CONTENT_TYPES)[number];
export const MAX_ASSET_MB = 500;

export const uploadedFileSchema = z.object({
  storageKey: z.string().min(1).startsWith("assets/"),
  fileName: z.string().trim().min(1).max(200),
  contentType: z.enum(ASSET_CONTENT_TYPES),
  sizeBytes: z.number().int().positive(),
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

/** "Add files" → attach these uploads to a product. */
export const addAssetsSchema = z.object({
  files: z.array(uploadedFileSchema).min(1, "Add at least one file").max(20),
});

/** Edit one asset: replace its file and/or set its pre-sale "arrives by" date. */
export const updateAssetSchema = z.object({
  file: uploadedFileSchema.optional(),
  // null = released (no date). Undefined = unchanged.
  availableAt: z.iso.date().nullable().optional(),
  /** Name buyers see on their downloads page and in emails. */
  label: z.string().trim().min(1, "Give the file a name").max(120, "120 characters maximum").optional(),
});
