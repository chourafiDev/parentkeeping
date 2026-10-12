import "server-only";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { hasAssetContent } from "@/lib/assets";
import type { AssetInput } from "@/lib/validations/asset";
import { db } from "@/server/db";
import { files, orderEvents, orderItems, orders, productFiles } from "@/server/db/schema";
import { buyerFooter } from "@/server/emails/buyer-footer";
import { fileReadyEmail } from "@/server/emails/buyer";
import { sendEmail } from "@/server/lib/email";
import { deleteObjects, signedDownloadUrl } from "@/server/lib/storage";
import { issueDownloadLink } from "./download-tokens";

// Assets work like Shopify Digital Products: one file, attached to any number
// of products. Buyers of any of those products get it on their downloads page.

export class AssetError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 409 = 400,
  ) {
    super(message);
  }
}

function toColumns(input: AssetInput) {
  const pdf = input.kind === "pdf" ? input.file : null;
  return {
    label: input.label,
    kind: input.kind,
    storageKey: pdf?.storageKey ?? null,
    fileName: pdf?.fileName ?? null,
    contentType: pdf?.contentType ?? null,
    sizeBytes: pdf?.sizeBytes ?? null,
    url: input.kind === "sheet_link" ? input.url || null : null,
    availableAt: input.availableAt ? new Date(`${input.availableAt}T12:00:00Z`) : null,
  };
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Makes the asset attached to exactly `productIds` (new links go last). */
async function syncProducts(tx: Tx, fileId: string, productIds: string[]) {
  await tx
    .delete(productFiles)
    .where(
      productIds.length
        ? and(eq(productFiles.fileId, fileId), notInArray(productFiles.productId, productIds))
        : eq(productFiles.fileId, fileId),
    );
  const linked = await tx
    .select({ productId: productFiles.productId })
    .from(productFiles)
    .where(eq(productFiles.fileId, fileId));
  for (const productId of productIds.filter((p) => !linked.some((l) => l.productId === p))) {
    const [{ next }] = await tx
      .select({ next: sql<number>`coalesce(max(${productFiles.sortOrder}) + 1, 0)::int` })
      .from(productFiles)
      .where(eq(productFiles.productId, productId));
    await tx.insert(productFiles).values({ productId, fileId, sortOrder: next });
  }
}

export async function createAsset(input: AssetInput) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(files)
      .values({ ...toColumns(input), uploadedAt: input.file ? new Date() : null })
      .returning({ id: files.id });
    await syncProducts(tx, row.id, input.productIds);
    return row;
  });
}

export async function updateAsset(id: string, input: AssetInput) {
  const [before] = await db.select().from(files).where(eq(files.id, id));
  if (!before) throw new AssetError("Asset not found", 404);
  const columns = toColumns(input);
  const replaced = before.storageKey && before.storageKey !== columns.storageKey;

  await db.transaction(async (tx) => {
    await tx
      .update(files)
      .set({ ...columns, uploadedAt: columns.storageKey !== before.storageKey ? new Date() : before.uploadedAt })
      .where(eq(files.id, id));
    await syncProducts(tx, id, input.productIds);
  });
  if (replaced) await deleteObjects("private", [before.storageKey!]);
  return { id };
}

/** Paid orders that own the asset through any of its products. */
async function ownerOrders(fileId: string) {
  return db
    .selectDistinct({ id: orders.id, orderNumber: orders.orderNumber, email: orders.email, name: orders.name })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(productFiles, eq(productFiles.productId, orderItems.productId))
    .where(and(eq(productFiles.fileId, fileId), eq(orders.status, "paid")));
}

/** Detach from one product (the asset itself stays in the library). */
export async function detachAsset(productId: string, fileId: string) {
  await db.delete(productFiles).where(and(eq(productFiles.productId, productId), eq(productFiles.fileId, fileId)));
}

/** Attach library assets to a product. */
export async function attachAssets(productId: string, fileIds: string[]) {
  if (!fileIds.length) return;
  const existing = await db.select({ id: files.id }).from(files).where(inArray(files.id, fileIds));
  if (existing.length !== fileIds.length) throw new AssetError("Asset not found", 404);
  await db.transaction(async (tx) => {
    for (const fileId of fileIds) {
      const [{ next }] = await tx
        .select({ next: sql<number>`coalesce(max(${productFiles.sortOrder}) + 1, 0)::int` })
        .from(productFiles)
        .where(eq(productFiles.productId, productId));
      await tx.insert(productFiles).values({ productId, fileId, sortOrder: next }).onConflictDoNothing();
    }
  });
}

/** Delete an asset nobody has bought (otherwise: replace the file instead). */
export async function deleteAsset(id: string) {
  const [asset] = await db.select({ storageKey: files.storageKey }).from(files).where(eq(files.id, id));
  if (!asset) throw new AssetError("Asset not found", 404);
  if ((await ownerOrders(id)).length > 0) {
    throw new AssetError("Buyers already own this asset. Replace its file instead of deleting it.", 409);
  }
  await db.transaction(async (tx) => {
    await tx.delete(productFiles).where(eq(productFiles.fileId, id));
    await tx.delete(files).where(eq(files.id, id));
  });
  if (asset.storageKey) await deleteObjects("private", [asset.storageKey]);
}

/**
 * Release a pre-sale asset: clear its "Arrives by" date and email every buyer
 * who owns it a fresh link to their downloads page ("Your [part] is ready").
 * The email goes out once per asset; a failed send is logged on the order.
 */
export async function releaseAsset(id: string, actorId: string) {
  const [asset] = await db.select().from(files).where(eq(files.id, id));
  if (!asset) throw new AssetError("Asset not found", 404);
  if (!hasAssetContent(asset)) {
    throw new AssetError(asset.kind === "pdf" ? "Upload the PDF before releasing it" : "Add the sheet link before releasing it");
  }

  await db.update(files).set({ availableAt: null }).where(eq(files.id, id));
  if (asset.readyNotifiedAt) return { notified: 0, failed: 0, alreadyNotified: true };

  const owners = await ownerOrders(id);
  const footer = await buyerFooter();
  let notified = 0;
  let failed = 0;
  for (const order of owners) {
    try {
      const downloadsUrl = await issueDownloadLink(order.id);
      await sendEmail({
        to: { email: order.email, name: order.name ?? undefined },
        ...fileReadyEmail({ fileLabel: asset.label, orderNumber: order.orderNumber, downloadsUrl, footer }),
      });
      await db.insert(orderEvents).values({
        orderId: order.id,
        type: "file_ready_sent",
        message: `“${asset.label}” is ready email sent`,
        data: { fileId: id },
        actorId,
      });
      notified++;
    } catch (err) {
      console.error(`File-ready email failed for order #${order.orderNumber}`, err);
      await db.insert(orderEvents).values({
        orderId: order.id,
        type: "note",
        message: `Couldn't send the “${asset.label}” is ready email`,
        data: { fileId: id },
        actorId,
      });
      failed++;
    }
  }
  await db.update(files).set({ readyNotifiedAt: new Date() }).where(eq(files.id, id));
  return { notified, failed, alreadyNotified: false };
}

/** Admin preview: where to send the browser to open the asset. */
export async function assetPreviewUrl(id: string) {
  const [asset] = await db.select().from(files).where(eq(files.id, id));
  if (!asset) throw new AssetError("Asset not found", 404);
  if (asset.kind === "sheet_link") {
    if (!asset.url) throw new AssetError("No sheet link yet", 404);
    return asset.url;
  }
  if (!asset.storageKey) throw new AssetError("No file uploaded yet", 404);
  return signedDownloadUrl(asset.storageKey, asset.fileName ?? "file.pdf", 120);
}

/** How many paid orders own the asset (shown before risky changes). */
export async function assetOwnerCount(id: string) {
  return (await ownerOrders(id)).length;
}
