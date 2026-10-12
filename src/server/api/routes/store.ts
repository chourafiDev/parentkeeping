import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { PRODUCT_PATHS, VARIANT_COOKIE } from "@/lib/catalog";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { getStripe } from "@/server/lib/stripe";
import { issueDownloadLink } from "@/server/services/download-tokens";
import { CheckoutError, createCheckoutSession } from "@/server/services/checkout";
import { handleStripeEvent } from "@/server/services/stripe-webhook";

// Public store endpoints (no admin session).
export const storeRoutes = new Hono()
  /**
   * Buy button → hosted Stripe Checkout. Works as a plain HTML form POST
   * (303 redirect, no JavaScript needed) or as JSON ({ url }).
   */
  .post("/checkout", async (c) => {
    const isForm = (c.req.header("content-type") ?? "").includes("form");
    const slug = isForm
      ? String((await c.req.parseBody()).slug ?? "")
      : String(((await c.req.json().catch(() => ({}))) as { slug?: string }).slug ?? "");

    try {
      const session = await createCheckoutSession({
        slug,
        country: c.req.header("x-vercel-ip-country") ?? null,
        variant: getCookie(c, VARIANT_COOKIE) ?? null,
      });
      return isForm ? c.redirect(session.url!, 303) : c.json({ url: session.url });
    } catch (err) {
      if (!(err instanceof CheckoutError)) {
        console.error("Checkout failed", err);
        err = new CheckoutError("Checkout isn't available right now. Please try again in a minute.", 503);
      }
      const { message, status } = err as CheckoutError;
      if (isForm) return c.redirect(`${PRODUCT_PATHS[slug] ?? "/"}?checkout_error=${encodeURIComponent(message)}`, 303);
      return c.json({ error: message }, status);
    }
  })
  /**
   * "Go to my downloads" on the thank-you page: a download link is issued on
   * click (not on every page view). The checkout session id only works for
   * 48 hours after payment; after that, the order email's link is the way in.
   */
  .get("/thank-you/downloads", async (c) => {
    const sessionId = c.req.query("session_id") ?? "";
    const [order] = sessionId.startsWith("cs_")
      ? await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId))
      : [];
    if (!order || order.status !== "paid" || Date.now() - order.paidAt.getTime() > 48 * 60 * 60 * 1000) {
      return c.redirect("/thank-you", 303);
    }
    const url = await issueDownloadLink(order.id);
    return c.redirect(new URL(url).pathname, 303);
  })
  /** Stripe webhook: verified signature, then idempotent handling. */
  .post("/stripe/webhook", async (c) => {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = c.req.header("stripe-signature");
    if (!stripe || !secret || !signature) return c.json({ error: "Webhook not configured" }, 400);

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(await c.req.text(), signature, secret);
    } catch {
      return c.json({ error: "Invalid signature" }, 400);
    }

    try {
      return c.json({ received: true, result: await handleStripeEvent(event) });
    } catch (err) {
      console.error(`Stripe webhook ${event.type} ${event.id} failed`, err);
      return c.json({ error: "Handler failed" }, 500); // Stripe retries
    }
  });
