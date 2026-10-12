import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { formatPrice } from "@/lib/money";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { downloadTokens, orderEvents, orders } from "@/server/db/schema";
import { orderConfirmationEmail } from "@/server/emails/buyer";
import { buyerFooter } from "@/server/emails/buyer-footer";
import { sendEmail } from "@/server/lib/email";
import { getStripe } from "@/server/lib/stripe";
import { getOrderFiles } from "@/server/queries/orders";
import { issueDownloadLink } from "./download-tokens";

export class OrderError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 409 | 502 | 503 = 400,
  ) {
    super(message);
  }
}

async function loadOrder(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) throw new OrderError("Order not found", 404);
  return order;
}

/** Revoke every link still active for the order (refund, leaked link). */
async function revokeLinks(orderId: string) {
  await db
    .update(downloadTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(downloadTokens.orderId, orderId), isNull(downloadTokens.revokedAt)));
}

/**
 * Email the buyer their downloads link.
 *   confirmation → first order email (Stripe webhook)
 *   resend       → same email with a new link; earlier links keep working
 *   reset        → earlier links stop working first (e.g. a link was shared)
 * Returns the new link so support can also paste it in a reply.
 */
export async function sendOrderEmail(orderId: string, mode: "confirmation" | "resend" | "reset", actorId: string | null) {
  const order = await loadOrder(orderId);
  if (order.status !== "paid") throw new OrderError("Only paid orders have downloads", 409);

  if (mode === "reset") await revokeLinks(orderId);
  const downloadsUrl = await issueDownloadLink(orderId);
  const files = await getOrderFiles(orderId);
  await sendEmail({
    to: { email: order.email, name: order.name ?? undefined },
    ...orderConfirmationEmail({
      orderNumber: order.orderNumber,
      downloadsUrl,
      parts: files.map((f) => ({ label: f.label, availableAt: f.availableAt })),
      refundPolicyUrl: `${siteUrl()}/policies/refund-policy`,
      footer: await buyerFooter(),
      resent: mode !== "confirmation",
    }),
  });

  if (mode === "confirmation") {
    await db.update(orders).set({ confirmationSentAt: new Date() }).where(eq(orders.id, orderId));
  }
  await db.insert(orderEvents).values({
    orderId,
    type: mode === "confirmation" ? "confirmation_sent" : mode === "resend" ? "email_resent" : "link_reissued",
    message:
      mode === "confirmation"
        ? `Order email sent to ${order.email}`
        : mode === "resend"
          ? `Order email resent to ${order.email} with a new link`
          : `Download link reset (old links revoked) and sent to ${order.email}`,
    actorId,
  });
  return { downloadsUrl };
}

/** Downloads made before now no longer count toward the per-file limit. */
export async function resetDownloadLimits(orderId: string, actorId: string) {
  await loadOrder(orderId);
  await db.update(orders).set({ downloadsResetAt: new Date() }).where(eq(orders.id, orderId));
  await db.insert(orderEvents).values({ orderId, type: "downloads_reset", message: "Download limits reset", actorId });
}

/**
 * Full refund through Stripe. The order is marked refunded right away and its
 * links revoked; Stripe's charge.refunded webhook then finds it already done.
 */
export async function refundOrder(orderId: string, actorId: string) {
  const order = await loadOrder(orderId);
  if (order.status === "refunded") throw new OrderError("This order is already refunded", 409);
  if (!order.stripePaymentIntentId) throw new OrderError("No Stripe payment on this order", 409);
  const stripe = getStripe();
  if (!stripe) throw new OrderError("Stripe isn't configured (STRIPE_SECRET_KEY)", 503);

  const remaining = order.amountTotal - order.amountRefunded;
  try {
    await stripe.refunds.create(
      {
        payment_intent: order.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: { orderId, orderNumber: String(order.orderNumber) },
      },
      { idempotencyKey: `refund-${orderId}` }, // a double click can't refund twice
    );
  } catch (err) {
    console.error(`Stripe refund failed for order #${order.orderNumber}`, err);
    throw new OrderError(`Stripe refused the refund: ${(err as Error).message}`, 502);
  }

  await db
    .update(orders)
    .set({ status: "refunded", amountRefunded: order.amountTotal, refundedAt: new Date() })
    .where(eq(orders.id, orderId));
  await revokeLinks(orderId);
  await db.insert(orderEvents).values({
    orderId,
    type: "refunded",
    message: `Refunded ${formatPrice(remaining)} through Stripe; download links revoked`,
    data: { amountRefunded: remaining },
    actorId,
  });
}

/** Internal note on the order's history. */
export async function addOrderNote(orderId: string, text: string, actorId: string) {
  await loadOrder(orderId);
  await db.insert(orderEvents).values({ orderId, type: "note", message: text, actorId });
}
