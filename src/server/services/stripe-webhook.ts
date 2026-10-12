import "server-only";
import { and, eq, inArray, isNull, or } from "drizzle-orm";
import type Stripe from "stripe";
import { BUMP_SLUG, BUNDLE_SLUG } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { downloadTokens, orderEvents, orderItems, orders, products, stripeEvents } from "@/server/db/schema";
import { nonUsRefundEmail } from "@/server/emails/buyer";
import { buyerFooter } from "@/server/emails/buyer-footer";
import { sendEmail } from "@/server/lib/email";
import { getStripe } from "@/server/lib/stripe";
import { sendOrderEmail } from "./orders";

// Stripe is the source of truth for money: orders are only written here,
// from verified webhook events. Every step is safe to run twice (Stripe
// retries and can send the same event more than once).

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

/** Send the order email, logging (not throwing) on failure so the order stays recorded. */
async function confirm(orderId: string) {
  try {
    await sendOrderEmail(orderId, "confirmation", null);
  } catch (err) {
    console.error("Order email failed", err);
    await db.insert(orderEvents).values({
      orderId,
      type: "note",
      message: "Couldn't send the order email. Use “Resend order email”.",
    });
  }
}

/** checkout.session.completed / async_payment_succeeded → paid order. */
async function recordPaidSession(sessionId: string) {
  const stripe = getStripe()!;
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items.data.price.product"] });
  if (session.payment_status !== "paid") return; // async methods: wait for async_payment_succeeded

  const lines = session.line_items?.data ?? [];
  const slugs = lines.map((l) => {
    const product = l.price?.product as Stripe.Product | string | undefined;
    return typeof product === "object" && !product.deleted ? product.metadata.slug : undefined;
  });
  const stripeProductIds = lines.map((l) => idOf(l.price?.product as string | Stripe.Product | undefined)).filter(Boolean) as string[];
  const ours = await db
    .select({ id: products.id, slug: products.slug, title: products.title, stripeProductId: products.stripeProductId })
    .from(products)
    .where(or(inArray(products.slug, slugs.filter(Boolean) as string[]), inArray(products.stripeProductId, stripeProductIds)));

  const mainSlug = session.metadata?.slug;
  const country = session.customer_details?.address?.country ?? null;
  const flagged = country !== "US";
  const paymentIntentId = idOf(session.payment_intent);

  // Map Stripe line items to our products before writing anything.
  const items = lines.map((l, i) => {
    const productId = idOf(l.price?.product as string | Stripe.Product | undefined);
    const product = ours.find((p) => p.slug === slugs[i]) ?? ours.find((p) => p.stripeProductId === productId);
    if (!product) throw new Error(`Unknown Stripe product on ${session.id}: ${productId}`);
    return {
      productId: product.id,
      title: product.title,
      stripePriceId: l.price?.id ?? "",
      amount: l.amount_subtotal,
      isBump: product.slug === BUMP_SLUG && mainSlug === BUNDLE_SLUG,
    };
  });

  // Order + items + "paid" in one transaction, upserted by session id: a
  // duplicate event finds the order already there and writes nothing.
  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(orders)
      .values({
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId: idOf(session.customer),
        email: (session.customer_details?.email ?? "").toLowerCase(),
        name: session.customer_details?.name ?? null,
        billingCountry: country,
        currency: session.currency ?? "usd",
        amountSubtotal: session.amount_subtotal ?? 0,
        amountTax: session.total_details?.amount_tax ?? 0,
        amountTotal: session.amount_total ?? 0,
        founding: session.metadata?.founding === "true",
        tosConsent: session.consent?.terms_of_service ?? null,
        consentAt: session.consent?.terms_of_service ? new Date() : null,
        testVariant: session.metadata?.test_variant || null,
        status: flagged ? "flagged_non_us" : "paid",
        paidAt: new Date(session.created * 1000),
      })
      .onConflictDoNothing({ target: orders.stripeSessionId })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });
    if (!row) return null;
    await tx.insert(orderItems).values(items.map((item) => ({ ...item, orderId: row.id })));
    await tx.insert(orderEvents).values({
      orderId: row.id,
      type: "paid",
      message: `Paid ${formatPrice(session.amount_total ?? 0)} through Stripe Checkout`,
    });
    return row;
  });

  if (!created) {
    // Already recorded (retry or duplicate): finish whatever a failed attempt left undone.
    const [existing] = await db.select().from(orders).where(eq(orders.stripeSessionId, session.id));
    if (existing?.status === "paid" && !existing.confirmationSentAt) await confirm(existing.id);
    if (existing?.status === "flagged_non_us" && !existing.refundedAt) await refundNonUs(existing.id);
    return;
  }

  if (!flagged) {
    await confirm(created.id);
    return;
  }

  await refundNonUs(created.id);
}

/**
 * Non-US billing country: refund in full with a polite email. Runs again on
 * Stripe's retry if it failed (the order exists by then, without refundedAt).
 */
async function refundNonUs(orderId: string) {
  const stripe = getStripe()!;
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order || order.status !== "flagged_non_us" || order.refundedAt) return;

  const [flaggedBefore] = await db
    .select({ id: orderEvents.id })
    .from(orderEvents)
    .where(and(eq(orderEvents.orderId, orderId), eq(orderEvents.type, "flagged_non_us")));
  if (!flaggedBefore) {
    await db.insert(orderEvents).values({
      orderId,
      type: "flagged_non_us",
      message: `Billing country ${order.billingCountry ?? "unknown"}: paid products are US-only`,
    });
  }
  if (!order.stripePaymentIntentId) return;

  // Throws if Stripe refuses: the webhook answers 500 and Stripe retries later.
  await stripe.refunds.create(
    { payment_intent: order.stripePaymentIntentId, reason: "requested_by_customer", metadata: { orderId, cause: "non_us" } },
    { idempotencyKey: `refund-${orderId}` },
  );
  const amount = formatPrice(order.amountTotal);
  await db.update(orders).set({ amountRefunded: order.amountTotal, refundedAt: new Date() }).where(eq(orders.id, orderId));
  await db.insert(orderEvents).values({ orderId, type: "refunded", message: `Refunded ${amount} automatically (non-US)` });
  try {
    await sendEmail({
      to: { email: order.email, name: order.name ?? undefined },
      ...nonUsRefundEmail({
        orderNumber: order.orderNumber,
        amount,
        freeListUrl: `${siteUrl()}/pages/free-medication-list`,
        footer: await buyerFooter(),
      }),
    });
  } catch (err) {
    console.error("Non-US refund email failed", err);
  }
}

/** charge.refunded → mark the order (refunds from the Stripe dashboard too). */
async function recordRefund(charge: Stripe.Charge) {
  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return;
  const [order] = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId));
  if (!order) return;

  const full = charge.refunded; // true once the whole amount is refunded
  const amountRefunded = charge.amount_refunded;
  const newlyRefunded = amountRefunded > order.amountRefunded;

  await db
    .update(orders)
    .set({
      amountRefunded,
      ...(full && order.status === "paid" && { status: "refunded" as const }),
      ...(full && !order.refundedAt && { refundedAt: new Date() }),
    })
    .where(eq(orders.id, order.id));

  if (full) {
    await db
      .update(downloadTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(downloadTokens.orderId, order.id), isNull(downloadTokens.revokedAt)));
  }
  if (newlyRefunded) {
    await db.insert(orderEvents).values({
      orderId: order.id,
      type: "refunded",
      message: full
        ? `Refunded ${formatPrice(amountRefunded)} in Stripe; download links revoked`
        : `Partial refund in Stripe: ${formatPrice(amountRefunded)} so far`,
    });
  }
}

/** Entry point for a verified event. Already-handled event ids are skipped. */
export async function handleStripeEvent(event: Stripe.Event) {
  const [seen] = await db.select({ id: stripeEvents.id }).from(stripeEvents).where(eq(stripeEvents.id, event.id));
  if (seen) return "duplicate";

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await recordPaidSession(event.data.object.id);
      break;
    case "charge.refunded":
      await recordRefund(event.data.object);
      break;
    default:
      return "ignored";
  }

  // Marked handled only after success, so a failed attempt is retried by Stripe.
  await db.insert(stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing();
  return "handled";
}
