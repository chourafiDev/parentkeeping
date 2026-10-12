import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { PRODUCT_PATHS, VARIANT_COOKIE } from "@/lib/catalog";
import { getStripe } from "@/server/lib/stripe";
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
