// Seeds the catalog from the build spec (4 products, default settings) and,
// in development only, a dev owner account so a fresh clone can sign in
// right away. Run with: pnpm db:seed — safe to re-run (skips what's already there).
// Stripe ids stay empty until the Stripe catalog is created.
// Production admin accounts are never seeded: use `pnpm auth:create-owner` instead.
import { eq, sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { products, settings, users } from "@/server/db/schema";

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

// Overridable so a teammate can pick their own dev login; same fixed
// defaults otherwise so the printed credentials below stay accurate.
const SEED_OWNER = {
  name: process.env.SEED_OWNER_NAME ?? "Dev Owner",
  email: process.env.SEED_OWNER_EMAIL ?? "owner@parentkeeping.test",
  password: process.env.SEED_OWNER_PASSWORD ?? "dev-password-123",
};

async function seedCatalog() {
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

/**
 * Dev-only admin login, so a fresh clone can sign in without the interactive
 * `auth:create-owner` prompt. Never runs in production, and never overwrites
 * a real owner account that already exists.
 */
async function seedOwner() {
  if (process.env.NODE_ENV === "production") return;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.role, "owner")).limit(1);
  if (existing) {
    console.log("An owner account already exists — nothing to do.");
    return;
  }

  await auth.api.createUser({ body: { ...SEED_OWNER, role: "owner" } });
  console.log(`\nDev owner created. Sign in at /admin/login with:\n  ${SEED_OWNER.email}\n  ${SEED_OWNER.password}`);
}

async function main() {
  await seedCatalog();
  await seedOwner();
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
