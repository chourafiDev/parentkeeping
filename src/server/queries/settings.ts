import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { settings } from "@/server/db/schema";

// Key/value settings with typed defaults (rows are seeded by pnpm db:seed).
export type StoreSettings = {
  pricing: { foundingEndsAt: string | null };
  checkout: { bumpEnabled: boolean };
  contact: { legalName: string | null; supportEmail: string | null; privacyEmail: string | null; postalAddress: string | null };
};

const DEFAULTS: StoreSettings = {
  pricing: { foundingEndsAt: null },
  checkout: { bumpEnabled: false },
  contact: { legalName: null, supportEmail: null, privacyEmail: null, postalAddress: null },
};

export async function getSettings<K extends keyof StoreSettings>(...keys: K[]): Promise<Pick<StoreSettings, K>> {
  const rows = await db.select().from(settings).where(inArray(settings.key, keys));
  const out = {} as Pick<StoreSettings, K>;
  for (const key of keys) {
    const row = rows.find((r) => r.key === key);
    out[key] = { ...DEFAULTS[key], ...((row?.value as object) ?? {}) } as StoreSettings[K];
  }
  return out;
}

/** Founding price window: active until `endsAt` (end of a US Eastern day). */
export async function getFoundingPrice() {
  const { pricing } = await getSettings("pricing");
  const endsAt = pricing.foundingEndsAt ? new Date(pricing.foundingEndsAt) : null;
  return { endsAt, active: !!endsAt && endsAt.getTime() > Date.now() };
}
