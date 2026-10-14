import "server-only";
import { and, count, desc, eq, gte, inArray, isNotNull, lt, ne, sql } from "drizzle-orm";
import { type RangeId, rangeById } from "@/lib/analytics-ranges";
import { STORE_TIME_ZONE, startOfStoreDay, storeDate } from "@/lib/store-time";
import { db } from "@/server/db";
import { analyticsSessions, orderItems, orders } from "@/server/db/schema";

/** A visit counts as "right now" when it was active in the last 5 minutes (Shopify uses the same). */
const ACTIVE_MS = 5 * 60_000;
/** Customer behavior looks at the last 10 minutes. */
const BEHAVIOR_MS = 10 * 60_000;

export type LiveMarker = { lat: number; lng: number; kind: "visitor" | "order" };

/** Live View: the Overview numbers for a range, plus what Live View adds. */
export type LiveView = OverviewStats & {
	/** Last 10 minutes, whatever the range. */
	behavior: { viewingProducts: number; checkingOut: number; purchased: number };
	locations: { label: string; sessions: number }[];
	customers: { new: number; returning: number };
	topProducts: { title: string; orders: number }[];
};

/** Orders that count: paid (or later refunded), not the non-US ones refunded at once. */
const countedOrder = ne(orders.status, "flagged_non_us");

export async function getLiveView({ range, withSales }: { range: RangeId; withSales: boolean }): Promise<LiveView> {
	const now = new Date();
	const { start, end } = rangeBounds(range, now);
	const activeSince = new Date(now.getTime() - ACTIVE_MS);
	const behaviorSince = new Date(now.getTime() - BEHAVIOR_MS);
	const s = analyticsSessions;
	const inRange = (col: typeof s.startedAt | typeof orders.paidAt) => and(gte(col, start), lt(col, end));

	const [overview, [behavior], locations, rangeOrders, topProducts] = await Promise.all([
		getOverview({ range, withSales }),
		db
			.select({
				viewingProducts: sql<number>`count(*) filter (where ${s.lastSeenAt} >= ${activeSince} and ${s.lastPath} like '/products/%')::int`,
				checkingOut: sql<number>`count(*) filter (where ${s.checkoutAt} >= ${behaviorSince} and (${s.purchasedAt} is null or ${s.purchasedAt} < ${s.checkoutAt}))::int`,
				purchased: sql<number>`count(*) filter (where ${s.purchasedAt} >= ${behaviorSince})::int`,
			})
			.from(s)
			.where(gte(s.lastSeenAt, behaviorSince)),
		db
			.select({ country: s.country, region: s.region, city: s.city, sessions: count() })
			.from(s)
			.where(inRange(s.startedAt))
			.groupBy(s.country, s.region, s.city)
			.orderBy(desc(count()))
			.limit(6),
		db
			.select({ id: orders.id, email: orders.email })
			.from(orders)
			.where(and(inRange(orders.paidAt), countedOrder)),
		db
			.select({ title: orderItems.title, orders: count() })
			.from(orderItems)
			.innerJoin(orders, eq(orders.id, orderItems.orderId))
			.where(and(inRange(orders.paidAt), countedOrder))
			.groupBy(orderItems.title)
			.orderBy(desc(count()))
			.limit(5),
	]);

	// New vs returning: did this email pay before the range started?
	const emails = [...new Set(rangeOrders.map((o) => o.email))];
	const earlier = emails.length
		? await db
				.selectDistinct({ email: orders.email })
				.from(orders)
				.where(and(inArray(orders.email, emails), lt(orders.paidAt, start), countedOrder))
		: [];
	const returningEmails = new Set(earlier.map((r) => r.email));
	const returning = rangeOrders.filter((o) => returningEmails.has(o.email)).length;
	const label = (l: { country: string | null; region: string | null; city: string | null }) =>
		[l.country, l.region, l.city].filter(Boolean).join(" · ") || "Unknown location";

	return {
		...overview,
		behavior: behavior ?? { viewingProducts: 0, checkingOut: 0, purchased: 0 },
		locations: locations.map((l) => ({ label: label(l), sessions: l.sessions })),
		customers: { new: rangeOrders.length - returning, returning },
		topProducts,
	};
}

// ── Overview strip: sessions, sales, orders and conversion for a date range ──

export type OverviewStats = {
	at: string;
	range: RangeId;
	sessions: number;
	orders: number;
	/** Cents, minus refunds. null when the viewer can't see revenue. */
	sales: number | null;
	/** One bucket per hour (single-day ranges) or per day (longer ranges), oldest first, up to now. */
	series: { sessions: number[]; orders: number[]; sales: number[] | null };
	/** Right now, whatever the range. */
	visitorsNow: number;
	/** Visitors right now, and orders within the range. */
	markers: LiveMarker[];
};

/** [start, end) of a range, in store time. */
function rangeBounds(range: RangeId, now: Date) {
	const { days, offset } = rangeById(range);
	const today = storeDate(now);
	const shift = (dateStr: string, by: number) => {
		const [y, m, d] = dateStr.split("-").map(Number);
		const t = new Date(Date.UTC(y, m - 1, d + by));
		return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
	};
	const firstDay = shift(today, -(offset + days - 1));
	const start = startOfStoreDay(firstDay);
	const end = offset === 0 ? now : startOfStoreDay(shift(today, -(offset - 1)));
	return { start, end, firstDay, hourly: days === 1, live: offset === 0 };
}

export async function getOverview({ range, withSales }: { range: RangeId; withSales: boolean }): Promise<OverviewStats> {
	const now = new Date();
	const { start, end, firstDay, hourly, live } = rangeBounds(range, now);
	const s = analyticsSessions;
	const { days } = rangeById(range);

	// Bucket index: hour of day, or days since the range's first day (store time).
	const bucket = (col: unknown) =>
		hourly
			? sql<number>`extract(hour from (${col} at time zone ${STORE_TIME_ZONE}))::int`
			: sql<number>`((${col} at time zone ${STORE_TIME_ZONE})::date - ${firstDay}::date)::int`;

	const [sessionRows, orderRows, [{ visitorsNow }], visitorMarkers, orderMarkers] = await Promise.all([
		db
			.select({ b: bucket(s.startedAt), n: count() })
			.from(s)
			.where(and(gte(s.startedAt, start), lt(s.startedAt, end)))
			.groupBy(sql`1`),
		db
			.select({
				b: bucket(orders.paidAt),
				n: count(),
				sales: sql<number>`coalesce(sum(${orders.amountTotal} - ${orders.amountRefunded}), 0)::int`,
			})
			.from(orders)
			.where(and(gte(orders.paidAt, start), lt(orders.paidAt, end), countedOrder))
			.groupBy(sql`1`),
		db.select({ visitorsNow: count() }).from(s).where(gte(s.lastSeenAt, new Date(now.getTime() - ACTIVE_MS))),
		db
			.select({ lat: s.latitude, lng: s.longitude })
			.from(s)
			.where(and(gte(s.lastSeenAt, new Date(now.getTime() - ACTIVE_MS)), isNotNull(s.latitude), isNotNull(s.longitude))),
		db
			.select({ lat: s.latitude, lng: s.longitude })
			.from(s)
			.where(and(gte(s.purchasedAt, start), lt(s.purchasedAt, end), isNotNull(s.latitude), isNotNull(s.longitude))),
	]);

	// Today's hourly series stops at the current hour; past days are complete.
	const length = hourly
		? live
			? Number(new Intl.DateTimeFormat("en-US", { timeZone: STORE_TIME_ZONE, hour: "numeric", hourCycle: "h23" }).format(now)) + 1
			: 24
		: days;
	const fill = (rows: { b: number; v: number }[]) => {
		const out = Array.from({ length }, () => 0);
		for (const r of rows) if (r.b >= 0 && r.b < length) out[r.b] = Number(r.v);
		return out;
	};
	const sessions = fill(sessionRows.map((r) => ({ b: r.b, v: r.n })));
	const ordersSeries = fill(orderRows.map((r) => ({ b: r.b, v: r.n })));
	const sales = fill(orderRows.map((r) => ({ b: r.b, v: r.sales })));
	const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

	return {
		at: now.toISOString(),
		range,
		sessions: sum(sessions),
		orders: sum(ordersSeries),
		sales: withSales ? sum(sales) : null,
		series: { sessions, orders: ordersSeries, sales: withSales ? sales : null },
		visitorsNow,
		markers: [
			...visitorMarkers.map((m) => ({ lat: m.lat!, lng: m.lng!, kind: "visitor" as const })),
			...orderMarkers.map((m) => ({ lat: m.lat!, lng: m.lng!, kind: "order" as const })),
		],
	};
}
