import { Hono } from "hono";
import { hasPermission } from "@/server/auth/permissions";
import { getLiveView } from "@/server/queries/analytics";
import { type AuthEnv, requirePermission } from "../middleware/auth";

export const analyticsRoutes = new Hono<AuthEnv>()
  /** Live View, polled every few seconds by the admin page. Sales only with finance access. */
  .get("/live", requirePermission({ analytics: ["read"] }), async (c) => {
    const withSales = hasPermission(c.get("user").role, { finance: ["read"] });
    c.header("Cache-Control", "no-store");
    return c.json(await getLiveView({ withSales }));
  });
