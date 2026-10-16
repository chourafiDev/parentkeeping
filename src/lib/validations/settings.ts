import { z } from "zod";

// Settings form ↔ API. Dates are store-local days ("yyyy-MM-dd", US Eastern).

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email");

export const settingsInputSchema = z.object({
  pricing: z.object({
    // Founding price runs until the end of this day; null = no founding price.
    foundingEndsOn: z.iso.date().nullable(),
  }),
  checkout: z.object({
    bumpEnabled: z.boolean(),
    /** Opens paid checkout worldwide via Stripe Managed Payments. Off = US only. */
    worldwideEnabled: z.boolean(),
  }),
  contact: z.object({
    supportEmail: optionalEmail,
    privacyEmail: optionalEmail,
    postalAddress: z.string().trim().max(400),
    phone: z.string().trim().max(30),
  }),
  proof: z.object({
    showFamilies: z.boolean(),
    showRefundRate: z.boolean(),
  }),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
