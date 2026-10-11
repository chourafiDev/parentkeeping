import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Key/value store settings, e.g. "pricing" → { foundingEndsAt },
// "contact" → { supportEmail, postalAddress }, "checkout" → { bumpEnabled }.
export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
