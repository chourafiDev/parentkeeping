import { Hono } from "hono";
import { auth } from "@/server/auth";
import { adminRoutes } from "./routes/admin";
import { devStorageRoutes } from "./routes/dev-storage";

export const app = new Hono()
  .basePath("/api")
  // Team management will go through /api/admin/team (with guard rails, e.g. the
  // store always keeps an owner), so Better Auth's raw admin endpoints are closed.
  .all("/auth/admin/*", (c) => c.json({ error: "Not found" }, 404))
  .on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get("/health", (c) => c.json({ ok: true }))
  .route("/admin", adminRoutes)
  .route("/dev-storage", devStorageRoutes);

export type AppType = typeof app;
