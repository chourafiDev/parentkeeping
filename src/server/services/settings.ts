import "server-only";
import { sql } from "drizzle-orm";
import { endOfStoreDay } from "@/lib/store-time";
import type { SettingsInput } from "@/lib/validations/settings";
import { db } from "@/server/db";
import { settings } from "@/server/db/schema";
import type { StoreSettings } from "@/server/queries/settings";

const orNull = (v: string) => (v === "" ? null : v);

/** Save every settings group (one row per key). */
export async function saveSettings(input: SettingsInput) {
  const values: StoreSettings = {
    pricing: { foundingEndsAt: input.pricing.foundingEndsOn ? endOfStoreDay(input.pricing.foundingEndsOn).toISOString() : null },
    checkout: { bumpEnabled: input.checkout.bumpEnabled },
    contact: {
      legalName: orNull(input.contact.legalName),
      supportEmail: orNull(input.contact.supportEmail.toLowerCase()),
      privacyEmail: orNull(input.contact.privacyEmail.toLowerCase()),
      postalAddress: orNull(input.contact.postalAddress),
    },
  };
  await db
    .insert(settings)
    .values(Object.entries(values).map(([key, value]) => ({ key, value })))
    .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value`, updatedAt: new Date() } });
}
