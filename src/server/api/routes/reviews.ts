import { Hono } from "hono";
import { z } from "zod";
import { reviewModerateSchema } from "@/lib/validations/review";
import { moderateReview } from "@/server/services/reviews";
import { validate } from "../lib/validate";
import { type AuthEnv, requirePermission } from "../middleware/auth";

export const reviewRoutes = new Hono<AuthEnv>().patch(
  "/:id",
  requirePermission({ review: ["update"] }),
  validate("param", z.object({ id: z.uuid() })),
  validate("json", reviewModerateSchema),
  async (c) => {
    const ok = await moderateReview(c.req.valid("param").id, c.req.valid("json"));
    if (!ok) return c.json({ error: "Review not found" }, 404);
    return c.json({ ok: true });
  },
);
