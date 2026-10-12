import { createMiddleware } from "hono/factory";
import { auth, type Session } from "@/server/auth";
import {
  hasPermission,
  isRole,
  type Permissions,
} from "@/server/auth/permissions";

export type AuthEnv = {
  Variables: {
    user: Session["user"];
    session: Session["session"];
  };
};

/**
 * Requires a signed-in team member (any admin role). Pass `permissions`
 * to also require specific rights, e.g. requireStaff({ product: ["create"] }).
 */
export const requireStaff = (permissions?: Permissions) =>
  createMiddleware<AuthEnv>(async (c, next) => {
    const result = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!result) return c.json({ error: "Unauthorized" }, 401);

    const { user, session } = result;
    const isStaff = (user.role ?? "").split(",").some(isRole);
    if (!isStaff || user.banned) return c.json({ error: "Forbidden" }, 403);
    if (permissions && !hasPermission(user.role, permissions)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    c.set("user", user);
    c.set("session", session);
    await next();
  });

/**
 * Per-route permission check for routes mounted under adminRoutes, which
 * already ran requireStaff() — reuses that user instead of re-reading the session.
 */
export const requirePermission = (permissions: Permissions) =>
  createMiddleware<AuthEnv>(async (c, next) => {
    if (!hasPermission(c.get("user")?.role, permissions)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  });
