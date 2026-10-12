import { z } from "zod";

// Product form ↔ API (Shopify-style product page). Prices are entered in
// dollars (29.00) and stored in cents.

const dollars = z
  .number({ error: "Enter a price" })
  .min(0, "Price can't be negative")
  .max(10_000, "Price looks too high");

const stripeId = (prefix: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || v.startsWith(prefix), `Should start with “${prefix}”`);

export const PRODUCT_KINDS = ["bundle", "single", "bump"] as const;
export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;

export const productImageSchema = z.object({
  key: z.string().min(1).max(500).startsWith("products/"),
  url: z.string().min(1),
  alt: z.string().trim().max(255),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export type ProductImage = z.infer<typeof productImageSchema>;

export const productInputSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200),
  description: z.string().max(50_000, "Description is too long"),
  images: z.array(productImageSchema).max(20, "20 images maximum"),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a URL handle")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  kind: z.enum(PRODUCT_KINDS),
  status: z.enum(PRODUCT_STATUSES),
  price: dollars,
  foundingPrice: dollars.nullable(),
  stripeProductId: stripeId("prod_"),
  stripePriceId: stripeId("price_"),
  foundingPriceId: stripeId("price_"),
  seoTitle: z.string().trim().max(70, "70 characters maximum"),
  seoDescription: z.string().trim().max(320, "320 characters maximum"),
  // Downloads per file per order. null = unlimited (Shopify "Access limit").
  downloadLimit: z.number().int().min(1, "At least 1 download").max(1000).nullable(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const PRODUCT_KIND_LABELS: Record<ProductInput["kind"], string> = {
  bundle: "Bundle",
  single: "Single product",
  bump: "Order bump only",
};

export const PRODUCT_STATUS_LABELS: Record<ProductInput["status"], string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};
