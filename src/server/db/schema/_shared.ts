import { timestamp, uuid } from "drizzle-orm/pg-core";

// All money columns are integers in cents, as Stripe sends them.
// e.g. $29.00 is stored as 2900 — never use floats for money.

export const id = () => uuid().primaryKey().defaultRandom();

export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};
