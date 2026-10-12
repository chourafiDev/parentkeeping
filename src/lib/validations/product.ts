import { z } from "zod";

// Product form ↔ API. Prices are entered in dollars (29.00) and stored in cents.

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

export const productInputSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200),
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
  image: z.object({ key: z.string().min(1), url: z.string().min(1) }).nullable(),
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
