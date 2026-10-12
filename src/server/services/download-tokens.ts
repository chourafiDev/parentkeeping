import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { downloadTokens, orders } from "@/server/db/schema";

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

export type ResolvedLink =
  | { ok: true; tokenId: string; order: typeof orders.$inferSelect }
  | { ok: false; reason: "invalid" | "expired" | "revoked" | "refunded" };

/** The downloads link in a URL → its order, or why it doesn't work. */
export async function resolveDownloadLink(token: string): Promise<ResolvedLink> {
  if (!/^[\w-]{20,100}$/.test(token)) return { ok: false, reason: "invalid" };
  const [row] = await db
    .select({ token: downloadTokens, order: orders })
    .from(downloadTokens)
    .innerJoin(orders, eq(orders.id, downloadTokens.orderId))
    .where(eq(downloadTokens.tokenHash, hashToken(token)));
  if (!row) return { ok: false, reason: "invalid" };
  if (row.order.status !== "paid") return { ok: false, reason: "refunded" };
  if (row.token.revokedAt) return { ok: false, reason: "revoked" };
  if (row.token.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  return { ok: true, tokenId: row.token.id, order: row.order };
}
