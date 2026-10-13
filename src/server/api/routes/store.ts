import { getSessionCookie } from "better-auth/cookies";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { PRODUCT_PATHS, VARIANT_COOKIE } from "@/lib/catalog";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { getStripe } from "@/server/lib/stripe";
import { issueDownloadLink } from "@/server/services/download-tokens";
import { requestNewLinks, startDownload } from "@/server/services/downloads";
import { recordVisit } from "@/server/services/analytics";
import { ContactError, submitContactQuestion } from "@/server/services/contact";
import { SignupError, subscribeToLeadMagnet, subscribeToQuizPlans, unsubscribe } from "@/server/services/subscribers";
import { QUIZ_SOURCE } from "@/lib/burnout-quiz";
import { verifyUnsubscribe } from "@/server/lib/unsubscribe";
import { FREE_LIST, LEAD_MAGNETS } from "@/lib/lead-magnets";
import { z } from "zod";
import { CheckoutError, createCheckoutSession } from "@/server/services/checkout";
import { handleStripeEvent } from "@/server/services/stripe-webhook";

const trackSchema = z.object({
  sessionId: z.uuid(),
  type: z.enum(["page_view", "checkout", "ping"]),
  path: z.string().startsWith("/").max(300),
  referrer: z.string().max(500).nullable().default(null),
  productSlug: z.string().max(80).nullable().default(null),
});

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
  /**
   * GET /api/download/[fileId]?t=[link]: checks the link, counts the download,
   * then redirects to a short-lived signed file URL (or the Sheet copy link).
   */
  .get("/download/:fileId", async (c) => {
    const token = c.req.query("t") ?? "";
    const fileId = c.req.param("fileId");
    if (!z.uuid().safeParse(fileId).success) return c.redirect(`/downloads/${encodeURIComponent(token)}?error=not_in_order`, 303);
    const result = await startDownload(token, fileId);
    c.header("Cache-Control", "no-store");
    c.header("Referrer-Policy", "no-referrer");
    if (!result.ok) return c.redirect(`/downloads/${encodeURIComponent(token)}?error=${result.error}`, 303);
    return c.redirect(result.url, 302);
  })
  /** "Email me a new link" (same answer whether or not the email has orders). */
  .post("/downloads/request-link", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { email?: string; website?: string };
    const email = z.email().safeParse(String(body.email ?? "").trim());
    if (!email.success) return c.json({ error: "Enter the email you used at checkout." }, 400);
    if (!body.website) await requestNewLinks(email.data); // "website" = honeypot for bots
    return c.json({ ok: true });
  })
  /**
   * Free list sign-up. Plain form POST (303 to the thank-you page, works
   * without JavaScript) or JSON. "website" is a honeypot field for bots.
   */
  .post("/subscribe", async (c) => {
    const isForm = (c.req.header("content-type") ?? "").includes("form");
    const body = (isForm ? await c.req.parseBody() : await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    // Which free download (an allow-listed source; the Medication List by default).
    const magnet = LEAD_MAGNETS[String(body.source ?? "")] ?? FREE_LIST;
    const back = (error: string) =>
      isForm ? c.redirect(`${magnet.path}?error=${encodeURIComponent(error)}#signup`, 303) : c.json({ error }, 400);

    if (body.website) return isForm ? c.redirect(`${magnet.path}/thanks`, 303) : c.json({ ok: true }); // bot: pretend
    const email = z.email().safeParse(String(body.email ?? "").trim());
    if (!email.success) return back("Enter a valid email address.");

    // Dev only: ?country=GB on the page is passed through to test the EU/UK box.
    const devCountry = process.env.NODE_ENV !== "production" ? String(body.country ?? "") : "";
    try {
      const meta = {
        email: email.data,
        newsletterBox: body.newsletter === "on" || body.newsletter === true,
        country: (devCountry || c.req.header("x-vercel-ip-country")) ?? null,
        variant: getCookie(c, VARIANT_COOKIE) ?? null,
        ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        turnstileToken: String(body["cf-turnstile-response"] ?? "") || undefined,
      };
      // The quiz box posts JSON and stays on its page (the result lives only in the browser).
      if (body.source === QUIZ_SOURCE) await subscribeToQuizPlans(meta);
      else await subscribeToLeadMagnet({ ...meta, magnet });
    } catch (err) {
      if (err instanceof SignupError) return back(err.message);
      console.error("Sign-up failed", err);
      return back("Something went wrong. Please try again.");
    }
    return isForm ? c.redirect(`${magnet.path}/thanks`, 303) : c.json({ ok: true });
  })
  /**
   * Visit tracking beacon from store pages (Live View). Always answers 204:
   * a lost page view must never surface as an error to a visitor.
   */
  .post("/track", async (c) => {
    const body = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) return c.body(null, 204);
    // The store owner's own browsing isn't counted (signed in to the admin).
    if (getSessionCookie(c.req.raw)) return c.body(null, 204);
    const header = (name: string) => c.req.header(name) ?? null;
    const coord = (name: string) => {
      const n = Number.parseFloat(header(name) ?? "");
      return Number.isFinite(n) ? n : null;
    };
    const city = header("x-vercel-ip-city");
    try {
      await recordVisit(parsed.data, {
        host: header("host"),
        userAgent: header("user-agent"),
        geo: {
          country: header("x-vercel-ip-country"),
          region: header("x-vercel-ip-country-region"),
          city: city ? decodeURIComponent(city) : null,
          latitude: coord("x-vercel-ip-latitude"),
          longitude: coord("x-vercel-ip-longitude"),
        },
      });
    } catch (err) {
      console.error("Visit tracking failed", err);
    }
    return c.body(null, 204);
  })
  /** "Ask a question" on a product page: one email to support, reply-to the visitor. */
  .post("/contact", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    if (body.website) return c.json({ ok: true }); // honeypot: pretend

    const name = String(body.name ?? "").trim();
    const email = z.email().safeParse(String(body.email ?? "").trim());
    const message = String(body.message ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    if (!name || !email.success || !message) return c.json({ error: "Fill in your name, email and message." }, 400);

    try {
      await submitContactQuestion({
        name: name.slice(0, 200),
        email: email.data,
        phone: phone ? phone.slice(0, 40) : null,
        message: message.slice(0, 4000),
        productTitle: typeof body.productTitle === "string" ? body.productTitle.slice(0, 200) : null,
        ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      });
    } catch (err) {
      if (err instanceof ContactError) return c.json({ error: err.message }, err.status);
      console.error("Contact message failed", err);
      return c.json({ error: "Something went wrong. Please try again." }, 500);
    }
    return c.json({ ok: true });
  })
  /** Unsubscribe confirm button (the email link opens a page first, never a GET that acts). */
  .post("/unsubscribe", async (c) => {
    const body = await c.req.parseBody();
    const id = String(body.s ?? "");
    const sig = String(body.sig ?? "");
    if (!z.uuid().safeParse(id).success || !verifyUnsubscribe(id, sig)) return c.redirect("/pages/unsubscribe?status=invalid", 303);
    await unsubscribe(id);
    return c.redirect("/pages/unsubscribe?status=done", 303);
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
