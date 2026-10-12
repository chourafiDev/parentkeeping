import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import type { ProductInput } from "@/lib/validations/product";
import { db } from "@/server/db";
import { productImages, products } from "@/server/db/schema";
import { sanitizeDescription } from "@/server/lib/sanitize";
import { deleteObjects } from "@/server/lib/storage";

export class ProductError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 409 = 400,
  ) {
    super(message);
  }
}

const cents = (dollars: number) => Math.round(dollars * 100);

function toColumns(input: ProductInput) {
  return {
    title: input.title,
    description: sanitizeDescription(input.description),
    slug: input.slug,
    kind: input.kind,
    status: input.status,
    price: cents(input.price),
    foundingPrice: input.foundingPrice === null ? null : cents(input.foundingPrice),
    stripeProductId: input.stripeProductId || null,
    stripePriceId: input.stripePriceId || null,
    foundingPriceId: input.foundingPriceId || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    downloadLimit: input.downloadLimit,
  };
}

const isUniqueViolation = (err: unknown, constraint: string) => {
  const e = err as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } };
  const pg = e?.cause ?? e;
  return pg?.code === "23505" && pg.constraint === constraint;
};

function rethrow(err: unknown): never {
  if (isUniqueViolation(err, "products_slug_unique")) throw new ProductError("Another product already uses this URL handle", 409);
  if (isUniqueViolation(err, "products_stripe_product_id_unique"))
    throw new ProductError("Another product is already linked to this Stripe product", 409);
  throw err;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The gallery becomes exactly `images`, in order (first = main image). */
async function saveImages(tx: Tx, productId: string, images: ProductInput["images"]) {
  await tx.delete(productImages).where(eq(productImages.productId, productId));
  if (images.length === 0) return;
  await tx.insert(productImages).values(
    images.map((img, i) => ({ productId, key: img.key, url: img.url, alt: img.alt, width: img.width, height: img.height, sortOrder: i })),
  );
}

export async function createProduct(input: ProductInput) {
  try {
    return await db.transaction(async (tx) => {
      const [{ maxSort }] = await tx
        .select({ maxSort: sql<number>`coalesce(max(${products.sortOrder}), -1)::int` })
        .from(products);
      const [row] = await tx
        .insert(products)
        .values({ ...toColumns(input), sortOrder: maxSort + 1 })
        .returning({ id: products.id, slug: products.slug });
      await saveImages(tx, row.id, input.images);
      return row;
    });
  } catch (err) {
    rethrow(err);
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  const [before] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
  if (!before) throw new ProductError("Product not found", 404);
  const oldImages = await db
    .select({ key: productImages.key })
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder));
  try {
    const row = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set(toColumns(input))
        .where(eq(products.id, id))
        .returning({ id: products.id, slug: products.slug });
      await saveImages(tx, id, input.images);
      return updated;
    });
    // Images removed from the gallery: drop the objects from storage.
    const kept = new Set(input.images.map((i) => i.key));
    await deleteObjects("public", oldImages.map((i) => i.key).filter((k) => !kept.has(k)));
    return row;
  } catch (err) {
    rethrow(err);
  }
}
