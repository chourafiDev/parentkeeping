import { doublePrecision, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { id } from "./_shared";

// First-party store analytics (Live View, later Reports). No cookies, no IP
// addresses, no cross-visit identifier: a visit is one browser tab session
// (a random id kept in sessionStorage), located to the city from the edge's
// geo headers.

export const analyticsSessions = pgTable(
  "analytics_sessions",
  {
    id: uuid().primaryKey(), // generated in the browser, per tab
    startedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    landingPath: text().notNull(),
    lastPath: text().notNull(),
    referrerHost: text(), // e.g. "google.com"; null for direct visits
    device: text(), // "mobile" | "tablet" | "desktop"
    country: text(), // ISO 3166-1 alpha-2
    region: text(),
    city: text(),
    latitude: doublePrecision(),
    longitude: doublePrecision(),
    pageViews: integer().default(0).notNull(),
    checkoutAt: timestamp({ withTimezone: true }), // last click on a Buy button
    purchasedAt: timestamp({ withTimezone: true }), // reached the thank-you page
  },
  (t) => [index().on(t.startedAt), index().on(t.lastSeenAt), index().on(t.purchasedAt)],
);

export const analyticsEventType = pgEnum("analytics_event_type", ["page_view", "checkout", "purchase"]);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: id(),
    sessionId: uuid()
      .notNull()
      .references(() => analyticsSessions.id, { onDelete: "cascade" }),
    type: analyticsEventType().notNull(),
    path: text().notNull(),
    productSlug: text(), // checkout: which product's Buy button
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index().on(t.createdAt), index().on(t.sessionId), index().on(t.type, t.createdAt)],
);
