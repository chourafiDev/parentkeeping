import { Hono } from "hono";
import { auth } from "@/server/auth";
import { adminRoutes } from "./routes/admin";
import { devStorageRoutes } from "./routes/dev-storage";

export const app = new Hono()
  .basePath("/api")
  // Single-owner store: Better Auth's user-management endpoints stay closed.
  .all("/auth/admin/*", (c) => c.json({ error: "Not found" }, 404))
  .on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get("/health", (c) => c.json({ ok: true }))
  .route("/admin", adminRoutes)
  .route("/dev-storage", devStorageRoutes);

export type AppType = typeof app;
