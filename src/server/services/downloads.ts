import "server-only";
import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { assetStatus, isUploadedFile } from "@/lib/assets";
import { db } from "@/server/db";
import { downloadTokens, downloads, files, orderItems, orders, productFiles } from "@/server/db/schema";
import { signedDownloadUrl } from "@/server/lib/storage";
import { resolveDownloadLink } from "./download-tokens";
import { sendOrderEmail } from "./orders";

export type DownloadResult =
  | { ok: true; url: string }
  | { ok: false; error: "link" | "not_in_order" | "not_ready" | "limit" };

/**
 * One download: the link must be valid, the file part of the order and
 * released, and under the per-file limit. Counts it, then returns where to
 * send the browser (a 10-minute signed URL, or the Sheet's copy link).
 */
export async function startDownload(token: string, fileId: string): Promise<DownloadResult> {
  const link = await resolveDownloadLink(token);
  if (!link.ok) return { ok: false, error: "link" };
  const { order, tokenId } = link;

  const [file] = await db
    .select()
    .from(files)
    .where(
      and(
        eq(files.id, fileId),
        inArray(
          files.id,
          db
            .select({ id: productFiles.fileId })
            .from(productFiles)
            .innerJoin(orderItems, eq(orderItems.productId, productFiles.productId))
            .where(eq(orderItems.orderId, order.id)),
        ),
      ),
    );
  if (!file) return { ok: false, error: "not_in_order" };
  if (assetStatus(file) !== "ready") return { ok: false, error: "not_ready" };

  // Per order and file, across all of the order's links, since the last reset.
  const [{ used }] = await db
    .select({ used: sql<number>`count(*)::int` })
    .from(downloads)
    .innerJoin(downloadTokens, eq(downloadTokens.id, downloads.tokenId))
    .where(
      and(
        eq(downloadTokens.orderId, order.id),
        eq(downloads.fileId, file.id),
        order.downloadsResetAt ? gt(downloads.createdAt, order.downloadsResetAt) : undefined,
      ),
    );
  // Access limit of the order's products that include this file (null = unlimited).
  // Sheet links are a copy link, not a file transfer: no limit, just counted.
  const [{ limit }] = (
    await db.execute<{ limit: number | null }>(sql`
      select case when bool_or(p.download_limit is null) then null else max(p.download_limit) end as limit
      from product_files pf
      join order_items oi on oi.product_id = pf.product_id
      join products p on p.id = pf.product_id
      where oi.order_id = ${order.id} and pf.file_id = ${file.id}
    `)
  ).rows;
  if (isUploadedFile(file.kind) && limit !== null && used >= Number(limit)) return { ok: false, error: "limit" };

  await db.insert(downloads).values({ tokenId, fileId: file.id });
  const url =
    isUploadedFile(file.kind) ? await signedDownloadUrl(file.storageKey!, file.fileName ?? "Parentkeeping-download") : file.url!;
  return { ok: true, url };
}

const RESEND_COOLDOWN_MS = 10 * 60 * 1000;

/**
 * "Email me a new link": every paid order on this email gets a fresh link,
 * at most once per 10 minutes per order. Says nothing about whether the
 * email exists (the caller always shows the same message).
 */
export async function requestNewLinks(email: string) {
  const paid = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.email, email.trim().toLowerCase()), eq(orders.status, "paid")));

  for (const order of paid) {
    const [latest] = await db
      .select({ createdAt: downloadTokens.createdAt })
      .from(downloadTokens)
      .where(eq(downloadTokens.orderId, order.id))
      .orderBy(desc(downloadTokens.createdAt))
      .limit(1);
    if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) continue;
    try {
      await sendOrderEmail(order.id, "resend", null);
    } catch (err) {
      console.error("New-link email failed", err);
    }
  }
}
