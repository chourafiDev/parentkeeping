import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "@/lib/site-url";

// Signed unsubscribe links: /pages/unsubscribe?s=<subscriber id>&sig=<hmac>.
// No login needed, and nobody can unsubscribe someone else by guessing ids.

const sign = (id: string) =>
  createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "dev").update(`unsubscribe:${id}`).digest("base64url");

export const unsubscribeUrl = (subscriberId: string) =>
  `${siteUrl()}/pages/unsubscribe?s=${subscriberId}&sig=${sign(subscriberId)}`;

export function verifyUnsubscribe(id: string, sig: string) {
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
