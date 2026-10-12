import { Hono } from "hono";
import { settingsInputSchema } from "@/lib/validations/settings";
import { saveSettings } from "@/server/services/settings";
import { validate } from "../lib/validate";
import { type AuthEnv, requirePermission } from "../middleware/auth";

export const settingsRoutes = new Hono<AuthEnv>().put(
  "/",
  requirePermission({ settings: ["update"] }),
  validate("json", settingsInputSchema),
  async (c) => {
    await saveSettings(c.req.valid("json"));
    return c.json({ ok: true });
  },
);
