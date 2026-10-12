import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { hasAssetContent } from "@/lib/assets";
import type { UploadedFile, updateAssetSchema } from "@/lib/validations/asset";
import type { z } from "zod";
import { db } from "@/server/db";
import { files, orderEvents, orderItems, orders, productFiles, products } from "@/server/db/schema";
import { buyerFooter } from "@/server/emails/buyer-footer";
import { fileReadyEmail } from "@/server/emails/buyer";
import { sendEmail } from "@/server/lib/email";
import { deleteObjects, signedDownloadUrl } from "@/server/lib/storage";
import { issueDownloadLink } from "./download-tokens";

// Assets work like Shopify Digital Products: files uploaded to a product
// (usually one ZIP per product). Buyers of the product get them on their
// downloads page. Pre-sale assets carry an "arrives by" date until released.

type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

export class AssetError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 409 = 400,
  ) {
    super(message);
  }
}

const day = (d: string) => new Date(`${d}T12:00:00Z`); // noon UTC: same calendar day in US time zones

/** "Add files": attach uploaded files to a product, in upload order, after its existing assets. */
export async function addAssets(productId: string, uploads: UploadedFile[]) {
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId));
  if (!product) throw new AssetError("Product not found", 404);
  return db.transaction(async (tx) => {
    const [{ next }] = await tx
      .select({ next: sql<number>`coalesce(max(${productFiles.sortOrder}) + 1, 0)::int` })
      .from(productFiles)
      .where(eq(productFiles.productId, productId));
    const rows = await tx
      .insert(files)
      .values(
        uploads.map((u) => ({
          label: u.fileName,
          kind: "file" as const,
          storageKey: u.storageKey,
          fileName: u.fileName,
          contentType: u.contentType,
          sizeBytes: u.sizeBytes,
          uploadedAt: new Date(),
        })),
      )
      .returning({ id: files.id });
    await tx.insert(productFiles).values(rows.map((r, i) => ({ productId, fileId: r.id, sortOrder: next + i })));
    return { ids: rows.map((r) => r.id) };
  });
}

/**
 * Replace an asset's file (buyers keep access, they get the new version) and/or
 * set or clear its pre-sale "arrives by" date.
 */
export async function updateAsset(id: string, input: UpdateAssetInput) {
  const [before] = await db.select().from(files).where(eq(files.id, id));
  if (!before) throw new AssetError("Asset not found", 404);
  const set: Partial<typeof files.$inferInsert> = {};
  if (input.file) {
    Object.assign(set, {
      kind: "file",
      label: input.file.fileName,
      storageKey: input.file.storageKey,
      fileName: input.file.fileName,
      contentType: input.file.contentType,
      sizeBytes: input.file.sizeBytes,
      url: null,
      uploadedAt: new Date(),
    });
  }
  if (input.availableAt !== undefined) set.availableAt = input.availableAt ? day(input.availableAt) : null;
  if (Object.keys(set).length === 0) return { id };
  await db.update(files).set(set).where(eq(files.id, id));
  if (input.file && before.storageKey && before.storageKey !== input.file.storageKey) {
    await deleteObjects("private", [before.storageKey]);
  }
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



/** Delete an asset nobody has bought (otherwise: replace its file instead, so buyers keep access). */
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
    throw new AssetError(asset.kind === "sheet_link" ? "Add the sheet link before releasing it" : "Upload the file before releasing it");
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
  return signedDownloadUrl(asset.storageKey, asset.fileName ?? "Parentkeeping-download", 120);
}

/** How many paid orders own the asset (shown before risky changes). */
export async function assetOwnerCount(id: string) {
  return (await ownerOrders(id)).length;
}
