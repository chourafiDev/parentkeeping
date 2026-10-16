import { z } from "zod";

export const reviewEntrySchema = z.object({
  productId: z.uuid(),
  rating: z.number().int().min(1, "Pick a star rating").max(5),
  headline: z.string().trim().min(3, "Add a short headline").max(80),
  body: z.string().trim().min(20, "Tell us a little more (20 characters or more)").max(2000),
});

export const reviewSubmitSchema = z.object({
  orderId: z.uuid(),
  sig: z.string().min(10).max(200),
  displayName: z.string().trim().min(2, "Add the name to show").max(40),
  consent: z.literal(true, { error: "Tick the box so we can publish it" }),
  reviews: z.array(reviewEntrySchema).min(1).max(4),
});

export type ReviewSubmit = z.infer<typeof reviewSubmitSchema>;

export const reviewModerateSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("published") }),
  z.object({ status: z.literal("pending") }),
  z.object({ status: z.literal("hidden"), hiddenReason: z.enum(["spam", "offensive", "private-info", "off-topic", "buyer-asked"]) }),
]);

/** Allowed reasons to hide a review. "Negative" is deliberately not one. */
export const HIDE_REASONS = {
  spam: "Spam or fake",
  offensive: "Offensive or abusive language",
  "private-info": "Shares private information",
  "off-topic": "Not about the product",
  "buyer-asked": "The buyer asked to remove it",
} as const;
