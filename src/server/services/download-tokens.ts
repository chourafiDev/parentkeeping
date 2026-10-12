import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { downloadTokens } from "@/server/db/schema";

const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000; // valid 1 year

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * New download link for an order: /downloads/[token]. Only the hash is stored,
 * so a link can't be rebuilt later — emails that need one issue a new token
 * (earlier links keep working until they expire or are revoked).
 */
export async function issueDownloadLink(orderId: string, tx: Pick<typeof db, "insert"> = db) {
  const token = randomBytes(32).toString("base64url");
  await tx.insert(downloadTokens).values({
    orderId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });
  return `${siteUrl()}/downloads/${token}`;
}
