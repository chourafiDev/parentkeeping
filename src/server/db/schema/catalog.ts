import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";

// bundle = Family Care System (lists its parts' files)
// single = Medical Binder, Caregiver Agreement (own product page)
// bump   = Emergency Binder (no page at launch, only the order bump on the System)
export const productKind = pgEnum("product_kind", ["bundle", "single", "bump"]);

// active = for sale · draft = hidden until ready · archived = retired, kept for past orders
export const productStatus = pgEnum("product_status", ["active", "draft", "archived"]);

export const products = pgTable(
  "products",
  {
    id: id(),
    slug: text().notNull().unique(), // family-care-system, medical-binder, caregiver-agreement, emergency-binder
    title: text().notNull(),
    kind: productKind().notNull(),
    // Stripe is the source of truth for money. Ids are filled once the Stripe
    // catalog exists (test mode first, then live); null = can't be bought yet.
    stripeProductId: text().unique(),
    stripePriceId: text(),
    foundingPriceId: text(), // System only: $29 until the founding end date
    // Display copies of the Stripe prices, in cents (pages and admin). Checkout
    // always uses the Stripe price ids, never these numbers.
    price: integer().notNull(),
    foundingPrice: integer(),
    status: productStatus().default("draft").notNull(),
    // Cover image (public bucket), shown in the admin list and on the store.
    imageKey: text(),
    imageUrl: text(),
    sortOrder: integer().default(0).notNull(),
    ...timestamps,
  },
  (t) => [
    check("products_price_positive", sql`${t.price} >= 0`),
    check("products_founding_price_positive", sql`${t.foundingPrice} IS NULL OR ${t.foundingPrice} >= 0`),
  ],
);

// pdf        = file in private storage (R2/S3/Blob), served through a short-lived signed URL
// sheet_link = Google Sheets "Make a copy" link, shown only on the downloads page
export const fileKind = pgEnum("file_kind", ["pdf", "sheet_link"]);

// One deliverable (e.g. the Medical Binder PDF). A file can belong to several
// products — the Binder PDF is in both the Medical Binder and the System — so
// marking it ready notifies every buyer who owns it, whichever product they bought.
export const files = pgTable("files", {
  id: id(),
  label: text().notNull(), // shown to buyers, e.g. "Medical Binder (fillable PDF)"
  kind: fileKind().notNull(),
  storageKey: text(), // pdf: object key in private storage
  fileName: text(), // pdf: download name, e.g. Parentkeeping-Medical-Binder.pdf
  contentType: text(), // pdf: e.g. application/pdf
  sizeBytes: integer(),
  uploadedAt: timestamp({ withTimezone: true }), // last upload / replacement
  url: text(), // sheet_link: the .../copy URL
  // Pre-sale: "Arrives by [date]" until the file is uploaded and this is cleared.
  availableAt: timestamp({ withTimezone: true }),
  // When the "Your [part] is ready" email went out (sent once).
  readyNotifiedAt: timestamp({ withTimezone: true }),
  ...timestamps,
});

export const productFiles = pgTable(
  "product_files",
  {
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    fileId: uuid()
      .notNull()
      .references(() => files.id, { onDelete: "restrict" }), // never orphan a buyer's download
    sortOrder: integer().default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.fileId] }), index().on(t.fileId)],
);
