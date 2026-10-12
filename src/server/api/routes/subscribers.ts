import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/server/db";
import { subscribers } from "@/server/db/schema";
import { csvDate, csvResponseHeaders, toCsv } from "@/server/lib/csv";
import { getSubscribersForExport } from "@/server/queries/subscribers";
import { validate } from "../lib/validate";
import { type AuthEnv, requirePermission } from "../middleware/auth";

const filters = z.object({
  status: z.enum(["all", "newsletter", "file_only", "unsubscribed"]).default("all"),
  q: z.string().max(200).default(""),
  source: z.string().max(100).default(""),
  country: z.string().max(2).default(""),
});

export const subscriberRoutes = new Hono<AuthEnv>()
  // CSV of the current view (same tab, search and filters as the page).
  .get("/export", requirePermission({ subscriber: ["export"] }), validate("query", filters), async (c) => {
    const { status, ...rest } = c.req.valid("query");
    const rows = await getSubscribersForExport({ tab: status, ...rest });
    const csv = toCsv(
      ["email", "source", "country", "newsletter_consent", "consent_text", "consent_at_utc", "headline_variant", "synced_to_email_tool_at_utc", "unsubscribed_at_utc", "signed_up_at_utc"],
      rows.map((r) => [
        r.email,
        r.source,
        r.country,
        r.marketingConsent ? "yes" : "no",
        r.consentText,
        csvDate(r.consentAt),
        r.testVariant,
        csvDate(r.emailToolSyncedAt),
        csvDate(r.unsubscribedAt),
        csvDate(r.createdAt),
      ]),
    );
    return c.body(csv, 200, csvResponseHeaders("parentkeeping-subscribers"));
  })
  // Privacy erasure request: removes the row here. The email tool has its own
  // copy, which has to be deleted there too.
  .delete("/:id", requirePermission({ subscriber: ["delete"] }), validate("param", z.object({ id: z.uuid() })), async (c) => {
    const [row] = await db
      .delete(subscribers)
      .where(eq(subscribers.id, c.req.valid("param").id))
      .returning({ id: subscribers.id });
    if (!row) return c.json({ error: "Subscriber not found" }, 404);
    return c.json({ ok: true });
  });
