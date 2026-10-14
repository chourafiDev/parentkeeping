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

export type LiveView = {
	at: string;
	visitorsNow: number;
	sessionsToday: number;
	sessionsByHour: number[];
	ordersToday: number;
	ordersByHour: number[];
	/** Cents: paid orders today, minus refunds. null when the viewer can't see revenue. */
	salesToday: number | null;
	salesByHour: number[] | null;
	behavior: { viewingProducts: number; checkingOut: number; purchased: number };
	locations: { label: string; sessions: number }[];
	customers: { new: number; returning: number };
	topProducts: { title: string; orders: number }[];
	markers: LiveMarker[];
	/** Hour (0–23, store time) of "now", so charts stop at the current hour. */
	currentHour: number;
};

const hourOf = (col: unknown) => sql<number>`extract(hour from (${col} at time zone ${STORE_TIME_ZONE}))::int`;

function byHour(rows: { hour: number; value: number }[]) {
	const out = Array.from({ length: 24 }, () => 0);
	for (const r of rows) out[r.hour] = Number(r.value);
	return out;
}

/** Orders that count: paid (or later refunded), not the non-US ones refunded at once. */
const countedOrder = ne(orders.status, "flagged_non_us");

export async function getLiveView({ withSales }: { withSales: boolean }): Promise<LiveView> {
	const now = new Date();
	const dayStart = startOfStoreDay(storeDate(now));
	const activeSince = new Date(now.getTime() - ACTIVE_MS);
	const behaviorSince = new Date(now.getTime() - BEHAVIOR_MS);
	const s = analyticsSessions;

	const [
		[{ visitorsNow }],
		sessionHours,
		orderHours,
		[behavior],
		locations,
		todaysOrders,
		topProducts,
		activeMarkers,
		orderMarkers,
	] = await Promise.all([
		db.select({ visitorsNow: count() }).from(s).where(gte(s.lastSeenAt, activeSince)),
		db
			.select({ hour: hourOf(s.startedAt), value: count() })
			.from(s)
			.where(gte(s.startedAt, dayStart))
			.groupBy(sql`1`),
		db
			.select({
				hour: hourOf(orders.paidAt),
				value: count(),
				sales: sql<number>`coalesce(sum(${orders.amountTotal} - ${orders.amountRefunded}), 0)::int`,
			})
			.from(orders)
			.where(and(gte(orders.paidAt, dayStart), countedOrder))
			.groupBy(sql`1`),
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
			.where(gte(s.startedAt, dayStart))
			.groupBy(s.country, s.region, s.city)
			.orderBy(desc(count()))
			.limit(6),
		db
			.select({ id: orders.id, email: orders.email })
			.from(orders)
			.where(and(gte(orders.paidAt, dayStart), countedOrder)),
		db
			.select({ title: orderItems.title, orders: count() })
			.from(orderItems)
			.innerJoin(orders, eq(orders.id, orderItems.orderId))
			.where(and(gte(orders.paidAt, dayStart), countedOrder))
			.groupBy(orderItems.title)
			.orderBy(desc(count()))
			.limit(5),
		db
			.select({ lat: s.latitude, lng: s.longitude })
			.from(s)
			.where(and(gte(s.lastSeenAt, activeSince), isNotNull(s.latitude), isNotNull(s.longitude))),
		db
			.select({ lat: s.latitude, lng: s.longitude })
			.from(s)
			.where(and(gte(s.purchasedAt, dayStart), isNotNull(s.latitude), isNotNull(s.longitude))),
	]);

	// New vs returning: did this email pay before today?
	const emails = [...new Set(todaysOrders.map((o) => o.email))];
	const earlier = emails.length
		? await db
				.selectDistinct({ email: orders.email })
				.from(orders)
				.where(and(inArray(orders.email, emails), lt(orders.paidAt, dayStart), countedOrder))
		: [];
	const returningEmails = new Set(earlier.map((r) => r.email));
	const returning = todaysOrders.filter((o) => returningEmails.has(o.email)).length;

	const sessionsByHour = byHour(sessionHours);
	const ordersByHour = byHour(orderHours);
	const salesByHour = byHour(orderHours.map((r) => ({ hour: r.hour, value: r.sales })));
	const label = (l: { country: string | null; region: string | null; city: string | null }) =>
		[l.country, l.region, l.city].filter(Boolean).join(" · ") || "Unknown location";

	return {
		at: now.toISOString(),
		visitorsNow,
		sessionsToday: sessionsByHour.reduce((a, b) => a + b, 0),
		sessionsByHour,
		ordersToday: todaysOrders.length,
		ordersByHour,
		salesToday: withSales ? salesByHour.reduce((a, b) => a + b, 0) : null,
		salesByHour: withSales ? salesByHour : null,
		behavior: behavior ?? { viewingProducts: 0, checkingOut: 0, purchased: 0 },
		locations: locations.map((l) => ({ label: label(l), sessions: l.sessions })),
		customers: { new: todaysOrders.length - returning, returning },
		topProducts,
		markers: [
			...activeMarkers.map((m) => ({ lat: m.lat!, lng: m.lng!, kind: "visitor" as const })),
			...orderMarkers.map((m) => ({ lat: m.lat!, lng: m.lng!, kind: "order" as const })),
		],
		currentHour: Number(new Intl.DateTimeFormat("en-US", { timeZone: STORE_TIME_ZONE, hour: "numeric", hourCycle: "h23" }).format(now)),
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
