// Seeds the catalog from the build spec: 4 products and default settings. Run with: pnpm db:seed — safe to re-run (skips if seeded).
// Stripe ids stay empty until the Stripe catalog is created.
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { products, settings } from "@/server/db/schema";

const PRODUCTS = [
  { slug: "family-care-system", title: "Parentkeeping Family Care System", kind: "bundle", status: "active", price: 3900, foundingPrice: 2900, sortOrder: 0 },
  { slug: "medical-binder", title: "Parentkeeping Medical Binder for an Elderly Parent", kind: "single", status: "active", price: 1900, foundingPrice: null, sortOrder: 1 },
  { slug: "caregiver-agreement", title: "Parentkeeping Family Caregiver Agreement Template", kind: "single", status: "active", price: 1900, foundingPrice: null, sortOrder: 2 },
  { slug: "emergency-binder", title: "Emergency Binder for an Aging Parent", kind: "bump", status: "active", price: 1500, foundingPrice: null, sortOrder: 3 },
] as const;

const SETTINGS = {
  pricing: { foundingEndsAt: null }, // ISO date; the System switches to $39 after it
  checkout: { bumpEnabled: false }, // Emergency Binder order bump
  contact: { supportEmail: null, privacyEmail: null, postalAddress: null, phone: null },
};

async function main() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  if (count > 0) {
    console.log("Catalog already seeded — nothing to do.");
    return;
  }

  await db.transaction(async (tx) => {
    // Files aren't seeded: each product's ZIP is uploaded from the admin.
    await tx.insert(products).values([...PRODUCTS]);

    await tx
      .insert(settings)
      .values(Object.entries(SETTINGS).map(([key, value]) => ({ key, value })))
      .onConflictDoNothing();
  });

  console.log(`Seeded ${PRODUCTS.length} products and default settings.`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
