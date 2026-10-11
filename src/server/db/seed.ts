// Seeds the catalog from the build spec: 4 products, the files they deliver,
// and default settings. Run with: pnpm db:seed — safe to re-run (skips if seeded).
// Stripe ids stay empty until the Stripe catalog is created.
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { files, productFiles, products, settings } from "@/server/db/schema";

const PRODUCTS = [
  { slug: "family-care-system", title: "Parentkeeping Family Care System", kind: "bundle", price: 3900, foundingPrice: 2900, sortOrder: 0 },
  { slug: "medical-binder", title: "Parentkeeping Medical Binder for an Elderly Parent", kind: "single", price: 1900, foundingPrice: null, sortOrder: 1 },
  { slug: "caregiver-agreement", title: "Parentkeeping Family Caregiver Agreement Template", kind: "single", price: 1900, foundingPrice: null, sortOrder: 2 },
  { slug: "emergency-binder", title: "Emergency Binder for an Aging Parent", kind: "bump", price: 1500, foundingPrice: null, sortOrder: 3 },
] as const;

// None are built yet: no upload, no "arrives by" date until the dates are decided.
const FILES = {
  binder: { label: "Medical Binder (fillable PDF + printable)", kind: "pdf" },
  sheet: { label: "Shared Family Care Sheet (Google Sheets)", kind: "sheet_link" },
  agreement: { label: "Family Caregiver Agreement Template (PDF)", kind: "pdf" },
  meetingKit: { label: "Family Meeting Kit (PDF)", kind: "pdf" },
  emergency: { label: "Emergency Binder (PDF)", kind: "pdf" },
} as const;

const PRODUCT_FILES: Record<(typeof PRODUCTS)[number]["slug"], (keyof typeof FILES)[]> = {
  "family-care-system": ["binder", "sheet", "agreement", "meetingKit"],
  "medical-binder": ["binder"],
  "caregiver-agreement": ["agreement"],
  "emergency-binder": ["emergency"],
};

const SETTINGS = {
  pricing: { foundingEndsAt: null }, // ISO date; the System switches to $39 after it
  checkout: { bumpEnabled: false }, // Emergency Binder order bump
  contact: { legalName: null, supportEmail: null, privacyEmail: null, postalAddress: null },
};

async function main() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  if (count > 0) {
    console.log("Catalog already seeded — nothing to do.");
    return;
  }

  await db.transaction(async (tx) => {
    const insertedProducts = await tx.insert(products).values([...PRODUCTS]).returning({ id: products.id, slug: products.slug });
    const insertedFiles = await tx
      .insert(files)
      .values(Object.values(FILES))
      .returning({ id: files.id, label: files.label });

    const fileId = (key: keyof typeof FILES) => insertedFiles.find((f) => f.label === FILES[key].label)!.id;
    await tx.insert(productFiles).values(
      insertedProducts.flatMap((p) =>
        PRODUCT_FILES[p.slug as keyof typeof PRODUCT_FILES].map((key, i) => ({ productId: p.id, fileId: fileId(key), sortOrder: i })),
      ),
    );

    await tx
      .insert(settings)
      .values(Object.entries(SETTINGS).map(([key, value]) => ({ key, value })))
      .onConflictDoNothing();
  });

  console.log(`Seeded ${PRODUCTS.length} products, ${Object.keys(FILES).length} files and default settings.`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
