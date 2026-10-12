import "server-only";
import { and, asc, desc, eq, gte, ilike, isNotNull, isNull, lt, type SQL, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { subscribers } from "@/server/db/schema";

export type SubscriberTab = "all" | "newsletter" | "file_only" | "unsubscribed";
export const SUBSCRIBERS_PER_PAGE = 50;

export type SubscriberFilters = { tab: SubscriberTab; q: string; source: string; country: string };

const TAB_WHERE: Record<SubscriberTab, SQL | undefined> = {
  all: undefined,
  // Agreed to the weekly emails and still subscribed.
  newsletter: and(eq(subscribers.marketingConsent, true), isNull(subscribers.unsubscribedAt)),
  // Got the free file only (EU/UK visitors who left the box unticked).
  file_only: and(eq(subscribers.marketingConsent, false), isNull(subscribers.unsubscribedAt)),
  unsubscribed: isNotNull(subscribers.unsubscribedAt),
};

function whereFor({ tab, q, source, country }: SubscriberFilters) {
  const term = q.trim().toLowerCase();
  return and(
    TAB_WHERE[tab],
    term ? ilike(subscribers.email, `%${term.replace(/[%_\\]/g, "\\$&")}%`) : undefined,
    source ? eq(subscribers.source, source) : undefined,
    country ? eq(subscribers.country, country) : undefined,
  );
}

const columns = {
  id: subscribers.id,
  email: subscribers.email,
  source: subscribers.source,
  country: subscribers.country,
  marketingConsent: subscribers.marketingConsent,
  consentText: subscribers.consentText,
  consentAt: subscribers.consentAt,
  testVariant: subscribers.testVariant,
  emailToolSyncedAt: subscribers.emailToolSyncedAt,
  unsubscribedAt: subscribers.unsubscribedAt,
  createdAt: subscribers.createdAt,
};

/** Subscribers list: tab, search, source/country filters, newest first, paged. */
export async function getSubscribersList(filters: SubscriberFilters, page: number) {
  const where = whereFor(filters);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select(columns)
      .from(subscribers)
      .where(where)
      .orderBy(desc(subscribers.createdAt))
      .limit(SUBSCRIBERS_PER_PAGE)
      .offset((page - 1) * SUBSCRIBERS_PER_PAGE),
    db.select({ total: sql<number>`count(*)::int` }).from(subscribers).where(where),
  ]);
  return { rows, total, pageCount: Math.max(1, Math.ceil(total / SUBSCRIBERS_PER_PAGE)) };
}

export type SubscriberRow = Awaited<ReturnType<typeof getSubscribersList>>["rows"][number];

/** Every subscriber matching the filters (CSV export). */
export function getSubscribersForExport(filters: SubscriberFilters) {
  return db.select(columns).from(subscribers).where(whereFor(filters)).orderBy(desc(subscribers.createdAt));
}

/** Count per tab, ignoring the tab itself (search and filters still apply). */
export async function getSubscriberTabCounts(filters: Omit<SubscriberFilters, "tab">) {
  const [row] = await db
    .select({
      all: sql<number>`count(*)::int`,
      newsletter: sql<number>`count(*) filter (where ${subscribers.marketingConsent} and ${subscribers.unsubscribedAt} is null)::int`,
      file_only: sql<number>`count(*) filter (where not ${subscribers.marketingConsent} and ${subscribers.unsubscribedAt} is null)::int`,
      unsubscribed: sql<number>`count(*) filter (where ${subscribers.unsubscribedAt} is not null)::int`,
    })
    .from(subscribers)
    .where(whereFor({ ...filters, tab: "all" }));
  return row as Record<SubscriberTab, number>;
}

/** Values for the source and country filters. */
export async function getSubscriberFacets() {
  const [sources, countries] = await Promise.all([
    db.selectDistinct({ v: subscribers.source }).from(subscribers).orderBy(asc(subscribers.source)),
    db
      .select({ v: subscribers.country, n: sql<number>`count(*)::int` })
      .from(subscribers)
      .where(isNotNull(subscribers.country))
      .groupBy(subscribers.country)
      .orderBy(desc(sql`count(*)`)),
  ]);
  return { sources: sources.map((s) => s.v), countries: countries.map((c) => ({ code: c.v!, count: c.n })) };
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Headline figures: totals, last 30 days vs the 30 before, newsletter opt-in
 * rate, and sign-ups per headline variant (the fairness vs "one place" test).
 */
export async function getSubscriberStats() {
  const now = Date.now();
  const since = new Date(now - 30 * DAY);
  const before = new Date(now - 60 * DAY);

  const [[totals], [last30], [prev30], variants] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        consented: sql<number>`count(*) filter (where ${subscribers.marketingConsent})::int`,
        unsubscribed: sql<number>`count(*) filter (where ${subscribers.unsubscribedAt} is not null)::int`,
      })
      .from(subscribers),
    db.select({ n: sql<number>`count(*)::int` }).from(subscribers).where(gte(subscribers.createdAt, since)),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(subscribers)
      .where(and(gte(subscribers.createdAt, before), lt(subscribers.createdAt, since))),
    db
      .select({
        variant: sql<string>`coalesce(${subscribers.testVariant}, 'none')`,
        total: sql<number>`count(*)::int`,
        last30: sql<number>`count(*) filter (where ${subscribers.createdAt} >= ${since.toISOString()}::timestamptz)::int`,
      })
      .from(subscribers)
      .groupBy(sql`coalesce(${subscribers.testVariant}, 'none')`),
  ]);

  return {
    total: totals.total,
    last30: last30.n,
    // % change vs the previous 30 days; null when there's nothing to compare with.
    change: prev30.n > 0 ? Math.round(((last30.n - prev30.n) / prev30.n) * 100) : null,
    optInRate: totals.total > 0 ? Math.round((totals.consented / totals.total) * 100) : null,
    unsubscribed: totals.unsubscribed,
    variants,
  };
}

export type SubscriberStats = Awaited<ReturnType<typeof getSubscriberStats>>;
