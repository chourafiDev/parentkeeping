import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { users } from "./auth";
import { files, products } from "./catalog";

// paid           = checkout.session.completed received and verified
// refunded       = charge.refunded (full refund); the download token is expired
// flagged_non_us = billing country isn't US: refunded with a polite email
export const orderStatus = pgEnum("order_status", ["paid", "refunded", "flagged_non_us"]);

// Copied from Stripe webhooks only — never written from the browser.
export const orders = pgTable(
  "orders",
  {
    id: id(),
    orderNumber: integer()
      .generatedAlwaysAsIdentity({ startWith: 1001 })
      .notNull()
      .unique(), // shown to buyers and support as #1001
    stripeSessionId: text().notNull().unique(), // upsert key: Stripe can send an event twice
    stripePaymentIntentId: text().unique(), // for refunds
    stripeCustomerId: text(),
    email: text().notNull(),
    name: text(),
    billingCountry: text(), // ISO 3166-1 alpha-2, e.g. "US"
    // Amounts in cents, as Stripe reports them.
    currency: text().default("usd").notNull(),
    amountSubtotal: integer().notNull(),
    amountTax: integer().default(0).notNull(),
    amountTotal: integer().notNull(),
    amountRefunded: integer().default(0).notNull(),
    founding: boolean().default(false).notNull(), // bought at the founding price
    // Download consent from Stripe's terms_of_service checkbox.
    tosConsent: text(), // session.consent.terms_of_service, e.g. "accepted"
    consentAt: timestamp({ withTimezone: true }),
    testVariant: text(), // headline test: "fairness" | "one_place"
    status: orderStatus().default("paid").notNull(),
    confirmationSentAt: timestamp({ withTimezone: true }), // order email sent
    reviewRequestedAt: timestamp({ withTimezone: true }), // the one "how is it going?" email
    refundedAt: timestamp({ withTimezone: true }),
    // Support reset the download limits: only downloads after this count toward the cap.
    downloadsResetAt: timestamp({ withTimezone: true }),
    paidAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [
    index().on(t.email),
    index().on(t.status),
    index().on(t.paidAt),
    check(
      "orders_amounts_positive",
      sql`${t.amountSubtotal} >= 0 AND ${t.amountTax} >= 0 AND ${t.amountTotal} >= 0 AND ${t.amountRefunded} >= 0`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    title: text().notNull(), // snapshot at purchase
    stripePriceId: text().notNull(),
    amount: integer().notNull(), // cents, before tax
    isBump: boolean().default(false).notNull(), // Emergency Binder ticked on the System checkout
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index().on(t.orderId), index().on(t.productId), check("order_items_amount_positive", sql`${t.amount} >= 0`)],
);

// Order timeline in the admin: paid, emails, links reissued, refunds…
export const orderEventType = pgEnum("order_event_type", [
  "paid",
  "confirmation_sent",
  "file_ready_sent",
  "link_reissued",
  "email_resent",
  "downloads_reset",
  "flagged_non_us",
  "refunded",
  "note",
]);

export const orderEvents = pgTable(
  "order_events",
  {
    id: id(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: orderEventType().notNull(),
    message: text(),
    data: jsonb(), // e.g. { fileId } or { amountRefunded }
    actorId: text().references(() => users.id, { onDelete: "set null" }), // null = system/webhook
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index().on(t.orderId, t.createdAt)],
);

// One active token per order (the link in the order email: /downloads/[token]).
// Only the SHA-256 hash is stored. Valid 1 year; support can issue a fresh one,
// which revokes the previous one.
export const downloadTokens = pgTable(
  "download_tokens",
  {
    id: id(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    tokenHash: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    revokedAt: timestamp({ withTimezone: true }), // reissued or order refunded
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index().on(t.orderId)],
);

// One row per download, for the 20-downloads-per-file cap and the metrics.
export const downloads = pgTable(
  "downloads",
  {
    id: id(),
    tokenId: uuid()
      .notNull()
      .references(() => downloadTokens.id, { onDelete: "cascade" }),
    fileId: uuid()
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index().on(t.tokenId, t.fileId)],
);

// Every Stripe webhook event id we've handled, so a retried event is a no-op.
export const stripeEvents = pgTable("stripe_events", {
  id: text().primaryKey(), // evt_…
  type: text().notNull(),
  processedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
