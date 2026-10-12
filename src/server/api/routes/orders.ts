import { Hono } from "hono";
import { z } from "zod";
import { addOrderNote, OrderError, refundOrder, resetDownloadLimits, sendOrderEmail } from "@/server/services/orders";
import { validate } from "../lib/validate";
import { type AuthEnv, requirePermission } from "../middleware/auth";

const idParam = validate("param", z.object({ id: z.uuid() }));

function fail(err: unknown) {
  if (err instanceof OrderError) return { error: err.message, status: err.status };
  throw err;
}

export const orderRoutes = new Hono<AuthEnv>()
  // Resend the order email (new link) or reset the link (old links revoked).
  .post(
    "/:id/email",
    requirePermission({ order: ["update"] }),
    idParam,
    validate("json", z.object({ mode: z.enum(["resend", "reset"]) })),
    async (c) => {
      try {
        return c.json(await sendOrderEmail(c.req.valid("param").id, c.req.valid("json").mode, c.get("user").id));
      } catch (err) {
        const { error, status } = fail(err);
        return c.json({ error }, status);
      }
    },
  )
  .post("/:id/reset-downloads", requirePermission({ order: ["update"] }), idParam, async (c) => {
    try {
      await resetDownloadLimits(c.req.valid("param").id, c.get("user").id);
      return c.json({ ok: true });
    } catch (err) {
      const { error, status } = fail(err);
      return c.json({ error }, status);
    }
  })
  .post("/:id/refund", requirePermission({ order: ["refund"] }), idParam, async (c) => {
    try {
      await refundOrder(c.req.valid("param").id, c.get("user").id);
      return c.json({ ok: true });
    } catch (err) {
      const { error, status } = fail(err);
      return c.json({ error }, status);
    }
  })
  .post(
    "/:id/notes",
    requirePermission({ order: ["update"] }),
    idParam,
    validate("json", z.object({ text: z.string().trim().min(1, "Write a note").max(2000) })),
    async (c) => {
      try {
        await addOrderNote(c.req.valid("param").id, c.req.valid("json").text, c.get("user").id);
        return c.json({ ok: true });
      } catch (err) {
        const { error, status } = fail(err);
        return c.json({ error }, status);
      }
    },
  );
