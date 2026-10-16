import "server-only";
import { and, eq, gte, inArray, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { REVIEW_REQUEST_AFTER_DAYS, REVIEW_REQUEST_MAX_DAYS } from "@/lib/social-proof";
import type { ReviewSubmit } from "@/lib/validations/review";
import { db } from "@/server/db";
import { orderItems, orders, products, reviews } from "@/server/db/schema";
import { reviewRequestEmail } from "@/server/emails/buyer";
import { buyerFooter } from "@/server/emails/buyer-footer";
import { sendEmail } from "@/server/lib/email";
import { rateLimit } from "@/server/lib/rate-limit";
import { reviewUrl, verifyReviewLink } from "@/server/lib/review-links";

export class ReviewError extends Error {
  constructor(
    message: string,
    public status: 400 | 403 | 404 | 429 = 400,
  ) {
    super(message);
  }
}

/** "Jane Smith" → "Jane S." (what the form suggests; the buyer can change it). */
export function suggestedName(name: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)!.charAt(0).toUpperCase()}.` : parts[0];
}

/**
 * The order behind a review link, with the products it can review. Refunded
 * buyers can still review (their experience counts too); non-US orders,
 * refunded at once, can't.
 */
export async function getReviewableOrder(orderId: string, sig: string) {
  if (!verifyReviewLink(orderId, sig)) return null;
  const [order] = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber, name: orders.name, status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId));
  if (!order || order.status === "flagged_non_us") return null;

  const items = await db
    .selectDistinct({ productId: products.id, slug: products.slug, title: products.title })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orderItems.orderId, orderId));
  const existing = await db
    .select({ productId: reviews.productId, status: reviews.status })
    .from(reviews)
    .where(eq(reviews.orderId, orderId));

  return {
    orderNumber: order.orderNumber,
    suggestedName: suggestedName(order.name),
    products: items.map((p) => ({ ...p, reviewed: existing.some((r) => r.productId === p.productId) })),
  };
}

/** Saves the buyer's reviews as pending. A product already reviewed on this order is skipped. */
export async function submitReviews(input: ReviewSubmit, ip: string | null) {
  if (ip && !(await rateLimit(`review:${ip}`, 10, 60 * 60))) throw new ReviewError("Too many tries. Please wait a little.", 429);
  const order = await getReviewableOrder(input.orderId, input.sig);
  if (!order) throw new ReviewError("This review link isn't valid.", 403);

  const allowed = new Set(order.products.filter((p) => !p.reviewed).map((p) => p.productId));
  const rows = input.reviews
    .filter((r) => allowed.has(r.productId))
    .map((r) => ({ orderId: input.orderId, productId: r.productId, rating: r.rating, headline: r.headline, body: r.body, displayName: input.displayName }));
  if (rows.length === 0) throw new ReviewError("You've already reviewed everything on this order. Thank you!");

  await db.insert(reviews).values(rows).onConflictDoNothing();
  return { saved: rows.length };
}

/**
 * Daily job: the one review request per order, sent once the 14-day
 * guarantee window has passed and only to orders still paid.
 */
export async function sendReviewRequests({ limit = 50 } = {}) {
  const day = 86_400_000;
  const now = Date.now();
  const due = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber, email: orders.email, name: orders.name })
    .from(orders)
    .where(
      and(
        eq(orders.status, "paid"),
        isNull(orders.reviewRequestedAt),
        isNotNull(orders.confirmationSentAt),
        lte(orders.paidAt, new Date(now - REVIEW_REQUEST_AFTER_DAYS * day)),
        gte(orders.paidAt, new Date(now - REVIEW_REQUEST_MAX_DAYS * day)),
      ),
    )
    .orderBy(orders.paidAt)
    .limit(limit);
  if (due.length === 0) return { sent: 0, failed: 0 };

  const titles = await db
    .selectDistinct({ orderId: orderItems.orderId, title: orderItems.title })
    .from(orderItems)
    .where(inArray(orderItems.orderId, due.map((o) => o.id)));
  const footer = await buyerFooter();
  let sent = 0;
  let failed = 0;
  for (const order of due) {
    try {
      // Claim first, so a retry or an overlapping run can't email twice.
      const [claimed] = await db
        .update(orders)
        .set({ reviewRequestedAt: new Date() })
        .where(and(eq(orders.id, order.id), isNull(orders.reviewRequestedAt)))
        .returning({ id: orders.id });
      if (!claimed) continue;
      await sendEmail({
        to: { email: order.email, name: order.name ?? undefined },
        ...reviewRequestEmail({
          orderNumber: order.orderNumber,
          productTitles: titles.filter((t) => t.orderId === order.id).map((t) => t.title),
          reviewUrl: reviewUrl(order.id),
          footer,
        }),
      });
      sent++;
    } catch (err) {
      console.error(`Review request failed for order #${order.orderNumber}`, err);
      failed++;
    }
  }
  return { sent, failed };
}

export async function moderateReview(
  id: string,
  change: { status: "published" | "pending" } | { status: "hidden"; hiddenReason: string },
) {
  const [row] = await db
    .update(reviews)
    .set({
      status: change.status,
      hiddenReason: change.status === "hidden" ? change.hiddenReason : null,
      // Keep the first publish date if it's re-published.
      publishedAt: change.status === "published" ? sql`coalesce(${reviews.publishedAt}, now())` : undefined,
    })
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id });
  return !!row;
}
