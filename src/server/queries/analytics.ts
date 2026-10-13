import "server-only";
import { and, count, desc, eq, gte, inArray, isNotNull, lt, ne, sql } from "drizzle-orm";
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
