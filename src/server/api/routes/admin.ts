import { Hono } from "hono";
import { revalidatePath } from "next/cache";
import { type AuthEnv, requireStaff } from "../middleware/auth";
import { assetRoutes } from "./assets";
import { orderRoutes } from "./orders";
import { productRoutes } from "./products";
import { subscriberRoutes } from "./subscribers";

// Every route in here requires a signed-in team member.
// Add per-route permissions with requirePermission({ resource: ["action"] }).
export const adminRoutes = new Hono<AuthEnv>()
  .use(requireStaff())
  // Any successful change in the admin refreshes the cached pages at once.
  .use(async (c, next) => {
    await next();
    if (c.req.method !== "GET" && c.res.status < 400) revalidatePath("/", "layout");
  })
  .get("/me", (c) => {
    const { id, name, email, role } = c.get("user");
    return c.json({ id, name, email, role });
  })
  .route("/products", productRoutes)
  .route("/assets", assetRoutes)
  .route("/orders", orderRoutes)
  .route("/subscribers", subscriberRoutes);
