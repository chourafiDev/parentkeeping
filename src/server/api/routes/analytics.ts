import { Hono } from "hono";
import { z } from "zod";
import { RANGE_IDS } from "@/lib/analytics-ranges";
import { hasPermission } from "@/server/auth/permissions";
import { getLiveView, getOverview } from "@/server/queries/analytics";
import { validate } from "../lib/validate";
import { type AuthEnv, requirePermission } from "../middleware/auth";

const rangeQuery = z.object({ range: z.enum(RANGE_IDS).default("today") });

export const analyticsRoutes = new Hono<AuthEnv>()
  /** Live View, polled every few seconds by the admin page. Sales only with finance access. */
  .get("/live", requirePermission({ analytics: ["read"] }), validate("query", rangeQuery), async (c) => {
    const withSales = hasPermission(c.get("user").role, { finance: ["read"] });
    c.header("Cache-Control", "no-store");
    return c.json(await getLiveView({ range: c.req.valid("query").range, withSales }));
  })
  /** Overview strip: a date range's sessions, sales, orders, plus visitors right now. */
  .get(
    "/overview",
    requirePermission({ analytics: ["read"] }),
    validate("query", rangeQuery),
    async (c) => {
      const withSales = hasPermission(c.get("user").role, { finance: ["read"] });
      c.header("Cache-Control", "no-store");
      return c.json(await getOverview({ range: c.req.valid("query").range, withSales }));
    },
  );
