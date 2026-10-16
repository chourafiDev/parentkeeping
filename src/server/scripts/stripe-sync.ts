// Creates the Stripe catalog from our products and saves the ids back.
// Run with: pnpm stripe:sync   (uses STRIPE_SECRET_KEY — test key first, then live)
//
// Safe to re-run: products/prices that already have an id are left alone.
// When a price changes, create a new Stripe price by clearing the id in the
// admin (Products → Pricing) and running this again; Stripe prices are immutable.
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { DIGITAL_GOODS_TAX_CODE, getStripe } from "@/server/lib/stripe";

async function main() {
  const stripe = getStripe();
  if (!stripe) throw new Error("Set STRIPE_SECRET_KEY in .env.local first.");
  const mode = process.env.STRIPE_SECRET_KEY!.startsWith("sk_live_") ? "LIVE" : "test";
  console.log(`Stripe ${mode} mode\n`);

  const rows = await db.select().from(products).orderBy(asc(products.sortOrder));
  for (const p of rows) {
    const updates: Partial<typeof products.$inferInsert> = {};

    let productId = p.stripeProductId;
    if (!productId) {
      const created = await stripe.products.create({
        name: p.title,
        tax_code: DIGITAL_GOODS_TAX_CODE,
        metadata: { slug: p.slug }, // the webhook maps payments back with this
      });
      productId = updates.stripeProductId = created.id;
      console.log(`+ product ${p.slug} → ${created.id}`);
    }

    const price = (amount: number, nickname: string) =>
      stripe.prices.create({
        product: productId!,
        currency: "usd",
        unit_amount: amount,
        // Worldwide, tax-inclusive pricing: the buyer always pays exactly this
    // amount, and tax comes out of it instead of being added on top (EU/UK/AU
    // consumer rules expect the displayed price to include tax).
    tax_behavior: "inclusive",
        nickname,
        metadata: { slug: p.slug },
      });

    if (!p.stripePriceId) {
      const created = await price(p.price, "Regular");
      updates.stripePriceId = created.id;
      console.log(`+ price ${p.slug} $${p.price / 100} → ${created.id}`);
    }
    if (p.foundingPrice !== null && !p.foundingPriceId) {
      const created = await price(p.foundingPrice, "Founding");
      updates.foundingPriceId = created.id;
      console.log(`+ founding price ${p.slug} $${p.foundingPrice / 100} → ${created.id}`);
    }

    if (Object.keys(updates).length) await db.update(products).set(updates).where(eq(products.id, p.id));
    else console.log(`= ${p.slug} already synced`);
  }
  console.log("\nDone.");
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
