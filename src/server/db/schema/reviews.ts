import { sql } from "drizzle-orm";
import { check, index, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { products } from "./catalog";
import { orders } from "./orders";

// pending   = written by a buyer, waiting for the owner
// published = on the product page
// hidden    = not shown, with a reason (spam, offensive, private info, off topic).
//             Never hidden for being negative: the FTC's 2024 reviews rule bans it.
export const reviewStatus = pgEnum("review_status", ["pending", "published", "hidden"]);

// Only buyers can write one (signed link from their review-request email),
// so every review is a verified purchase. One per product per order.
export const reviews = pgTable(
  "reviews",
  {
    id: id(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    rating: integer().notNull(),
    headline: text().notNull(),
    body: text().notNull(),
    /** First name + last initial, as the buyer agreed to show it. */
    displayName: text().notNull(),
    status: reviewStatus().default("pending").notNull(),
    hiddenReason: text(),
    publishedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    unique().on(t.orderId, t.productId),
    index().on(t.productId, t.status),
    check("reviews_rating_range", sql`${t.rating} BETWEEN 1 AND 5`),
  ],
);
