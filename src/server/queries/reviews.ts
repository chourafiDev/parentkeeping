import "server-only";
import { and, avg, count, countDistinct, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { orders, products, reviews } from "@/server/db/schema";

export type PublishedReview = {
	id: string;
	rating: number;
	headline: string;
	body: string;
	name: string;
	date: string;
};

/** Published reviews for a product, newest first, plus the rating summary. */
export async function getProductReviews(slug: string, limit = 30) {
	const where = and(eq(products.slug, slug), eq(reviews.status, "published"));
	const [rows, [summary]] = await Promise.all([
		db
			.select({
				id: reviews.id,
				rating: reviews.rating,
				headline: reviews.headline,
				body: reviews.body,
				name: reviews.displayName,
				publishedAt: reviews.publishedAt,
			})
			.from(reviews)
			.innerJoin(products, eq(products.id, reviews.productId))
			.where(where)
			.orderBy(desc(reviews.publishedAt))
			.limit(limit),
		db
			.select({ count: count(), average: avg(reviews.rating) })
			.from(reviews)
			.innerJoin(products, eq(products.id, reviews.productId))
			.where(where),
	]);
	return {
		reviews: rows.map(({ publishedAt, ...r }) => ({ ...r, date: (publishedAt ?? new Date()).toISOString() })) as PublishedReview[],
		count: summary?.count ?? 0,
		average: summary?.average ? Number(summary.average) : null,
	};
}

export type ProductReviewData = Awaited<ReturnType<typeof getProductReviews>>;

/**
 * Real numbers behind "Bought by N+ families" and the refund rate. The rate
 * only counts orders whose 14-day window has closed, so recent orders that
 * could still be refunded don't make it look lower than it is.
 */
export async function getProofStats() {
	const windowClosed = new Date(Date.now() - 14 * 86_400_000);
	const [[families], [settled]] = await Promise.all([
		db.select({ n: countDistinct(sql`lower(${orders.email})`) }).from(orders).where(eq(orders.status, "paid")),
		db
			.select({
				total: count(),
				refunded: sql<number>`count(*) filter (where ${orders.status} = 'refunded')::int`,
			})
			.from(orders)
			.where(and(inArray(orders.status, ["paid", "refunded"]), lte(orders.paidAt, windowClosed))),
	]);
	return {
		families: families?.n ?? 0,
		settledOrders: settled?.total ?? 0,
		refundRate: settled && settled.total > 0 ? settled.refunded / settled.total : null,
	};
}

export type AdminReviewTab = "pending" | "published" | "hidden";

/** Admin → Reviews: one tab at a time, newest first, with the order and product. */
export async function getAdminReviews(tab: AdminReviewTab) {
	const [rows, counts] = await Promise.all([
		db
			.select({
				id: reviews.id,
				rating: reviews.rating,
				headline: reviews.headline,
				body: reviews.body,
				displayName: reviews.displayName,
				status: reviews.status,
				hiddenReason: reviews.hiddenReason,
				createdAt: reviews.createdAt,
				publishedAt: reviews.publishedAt,
				productTitle: products.title,
				orderId: orders.id,
				orderNumber: orders.orderNumber,
				orderStatus: orders.status,
			})
			.from(reviews)
			.innerJoin(products, eq(products.id, reviews.productId))
			.innerJoin(orders, eq(orders.id, reviews.orderId))
			.where(eq(reviews.status, tab))
			.orderBy(desc(reviews.createdAt))
			.limit(200),
		db.select({ status: reviews.status, n: count() }).from(reviews).groupBy(reviews.status),
	]);
	const n = (s: AdminReviewTab) => counts.find((c) => c.status === s)?.n ?? 0;
	return { rows, counts: { pending: n("pending"), published: n("published"), hidden: n("hidden") } };
}
