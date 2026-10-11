import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";

// Free Medication List sign-ups — a backup of the email tool's list.
export const subscribers = pgTable(
  "subscribers",
  {
    id: id(),
    email: text().notNull().unique(), // stored lowercase
    source: text().notNull(), // e.g. "free-medication-list"
    country: text(), // from the request's country header
    // EU/UK visitors tick a box for the newsletter; elsewhere the notice under the button.
    marketingConsent: boolean().notNull(),
    consentText: text().notNull(), // exact wording shown at sign-up
    consentAt: timestamp({ withTimezone: true }).notNull(),
    testVariant: text(), // headline test: "fairness" | "one_place"
    emailToolSyncedAt: timestamp({ withTimezone: true }), // passed to the email tool
    unsubscribedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [index().on(t.createdAt), index().on(t.source), index().on(t.testVariant)],
);
