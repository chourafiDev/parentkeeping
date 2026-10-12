import "server-only";
import { eq, sql } from "drizzle-orm";
import type { ProductInput } from "@/lib/validations/product";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
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
    slug: input.slug,
    kind: input.kind,
    status: input.status,
    price: cents(input.price),
    foundingPrice: input.foundingPrice === null ? null : cents(input.foundingPrice),
    stripeProductId: input.stripeProductId || null,
    stripePriceId: input.stripePriceId || null,
    foundingPriceId: input.foundingPriceId || null,
    imageKey: input.image?.key ?? null,
    imageUrl: input.image?.url ?? null,
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

export async function createProduct(input: ProductInput) {
  try {
    const [{ maxSort }] = await db
      .select({ maxSort: sql<number>`coalesce(max(${products.sortOrder}), -1)::int` })
      .from(products);
    const [row] = await db
      .insert(products)
      .values({ ...toColumns(input), sortOrder: maxSort + 1 })
      .returning({ id: products.id, slug: products.slug });
    return row;
  } catch (err) {
    rethrow(err);
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  const [before] = await db.select({ imageKey: products.imageKey }).from(products).where(eq(products.id, id));
  if (!before) throw new ProductError("Product not found", 404);
  try {
    const [row] = await db
      .update(products)
      .set(toColumns(input))
      .where(eq(products.id, id))
      .returning({ id: products.id, slug: products.slug });
    // Replaced or removed cover image: drop the old object.
    if (before.imageKey && before.imageKey !== input.image?.key) await deleteObjects("public", [before.imageKey]);
    return row;
  } catch (err) {
    rethrow(err);
  }
}
