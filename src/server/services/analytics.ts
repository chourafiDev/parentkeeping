import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { analyticsEvents, analyticsSessions } from "@/server/db/schema";

// First-party visit tracking for the admin's Live View. One row per visit
// (browser tab session), one row per page view / Buy click / purchase.
// No IP address or cookie is stored; location is the edge's city guess.

export type TrackInput = {
  sessionId: string;
  /** "ping" keeps a visit "right now" while the tab stays open; it isn't stored as an event. */
  type: "page_view" | "checkout" | "ping";
  path: string;
  referrer: string | null;
  productSlug: string | null;
};

export type TrackContext = {
  host: string | null;
  userAgent: string | null;
  geo: { country: string | null; region: string | null; city: string | null; latitude: number | null; longitude: number | null };
};

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|monitor/i;

function deviceOf(ua: string | null) {
  if (!ua) return null;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

/** External referrer host only ("google.com"); our own pages and garbage → null. */
function referrerHostOf(referrer: string | null, host: string | null) {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, "");
    return host && h === host.replace(/^www\./, "").split(":")[0] ? null : h.slice(0, 120);
  } catch {
    return null;
  }
}

/** Reaching the thank-you page means the Stripe payment went through. */
const PURCHASE_PATH = "/thank-you";

export async function recordVisit(input: TrackInput, ctx: TrackContext) {
  if (BOT.test(ctx.userAgent ?? "")) return;
  const now = new Date();
  const isView = input.type === "page_view";
  const purchase = isView && input.path === PURCHASE_PATH;

  await db
    .insert(analyticsSessions)
    .values({
      id: input.sessionId,
      startedAt: now,
      lastSeenAt: now,
      landingPath: input.path,
      lastPath: input.path,
      referrerHost: referrerHostOf(input.referrer, ctx.host),
      device: deviceOf(ctx.userAgent),
      ...ctx.geo,
      pageViews: isView ? 1 : 0,
      checkoutAt: input.type === "checkout" ? now : null,
      purchasedAt: purchase ? now : null,
    })
    .onConflictDoUpdate({
      target: analyticsSessions.id,
      set: {
        lastSeenAt: now,
        ...(isView && { lastPath: input.path, pageViews: sql`${analyticsSessions.pageViews} + 1` }),
        ...(input.type === "checkout" && { checkoutAt: now }),
        ...(purchase && { purchasedAt: now }),
      },
    });

  if (input.type === "ping") return;
  await db.insert(analyticsEvents).values([
    { sessionId: input.sessionId, type: input.type, path: input.path, productSlug: input.productSlug, createdAt: now },
    ...(purchase ? [{ sessionId: input.sessionId, type: "purchase" as const, path: input.path, createdAt: now }] : []),
  ]);
}
