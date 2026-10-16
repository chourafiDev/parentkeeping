import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "@/lib/site-url";

// Signed review links: /reviews/write?o=<order id>&sig=<hmac>. Only the buyer
// has the link (it's in their email), which is what makes a review "verified".

const sign = (orderId: string) =>
  createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "dev").update(`review:${orderId}`).digest("base64url");

export const reviewUrl = (orderId: string) => `${siteUrl()}/reviews/write?o=${orderId}&sig=${sign(orderId)}`;

export function verifyReviewLink(orderId: string, sig: string) {
  const expected = Buffer.from(sign(orderId));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
