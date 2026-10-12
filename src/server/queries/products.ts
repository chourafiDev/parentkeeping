import "server-only";
import { and, asc, desc, eq, ilike, inArray, type SQL, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  files,
  orderItems,
  orders,
  productFiles,
  products,
} from "@/server/db/schema";
import type { ProductInput } from "@/lib/validations/product";

export type ProductStatusTab = "active" | "draft" | "archived" | "all";
export type ProductSort = "title" | "sales" | "downloads" | "created";

// Per-product figures, as correlated subqueries (the catalog is a handful of rows).
// Written with explicit table names: Drizzle doesn't qualify columns in a
// single-table select, which would make "id" ambiguous inside the subquery.
// Sales     = paid orders that include the product (as a line or as the bump).
// Downloads = downloads of the product's files by buyers of that product.
const assetsCount = sql<number>`(
  select count(*)::int from product_files pf where pf.product_id = products.id
)`;
const salesCount = sql<number>`(
  select count(distinct oi.order_id)::int
  from order_items oi join orders o on o.id = oi.order_id
  where oi.product_id = products.id and o.status = 'paid'
)`;
const downloadsCount = sql<number>`(
  select count(*)::int
  from downloads d
  join download_tokens t on t.id = d.token_id
  join order_items oi on oi.order_id = t.order_id and oi.product_id = products.id
  join product_files pf on pf.file_id = d.file_id and pf.product_id = products.id
)`;
const revenueSum = sql<number>`(
  select coalesce(sum(oi.amount), 0)::int
  from order_items oi join orders o on o.id = oi.order_id
  where oi.product_id = products.id and o.status = 'paid'
)`;

/** Products list (Shopify Digital Products style): status tab, search, sort. */
export async function getProductsList({
  tab,
  q,
  sort,
}: {
  tab: ProductStatusTab;
  q: string;
  sort: ProductSort;
}) {
  const where: SQL[] = [];
  if (tab !== "all") where.push(eq(products.status, tab));
  if (q) where.push(ilike(products.title, `%${q.replace(/[%_\\]/g, "\\$&")}%`));

  const orderBy = {
    title: [asc(products.title)],
    sales: [desc(salesCount), asc(products.sortOrder)],
    downloads: [desc(downloadsCount), asc(products.sortOrder)],
    created: [desc(products.createdAt)],
  }[sort];

  return db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      kind: products.kind,
      status: products.status,
      imageUrl: products.imageUrl,
      price: products.price,
      foundingPrice: products.foundingPrice,
      assets: assetsCount,
      sales: salesCount,
      downloads: downloadsCount,
    })
    .from(products)
    .where(and(...where))
    .orderBy(...orderBy, asc(products.sortOrder));
}

export type ProductListRow = Awaited<ReturnType<typeof getProductsList>>[number];

/** Number of products per status tab. */
export async function getProductTabCounts() {
  const rows = await db
    .select({ status: products.status, count: sql<number>`count(*)::int` })
    .from(products)
    .groupBy(products.status);
  const counts = { active: 0, draft: 0, archived: 0, all: 0 };
  for (const r of rows) {
    counts[r.status] = r.count;
    counts.all += r.count;
  }
  return counts;
}

/** Product + its assets, figures and latest orders, for the product page. */
export async function getProductDetail(id: string) {
  const [product] = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      kind: products.kind,
      status: products.status,
      price: products.price,
      foundingPrice: products.foundingPrice,
      stripeProductId: products.stripeProductId,
      stripePriceId: products.stripePriceId,
      foundingPriceId: products.foundingPriceId,
      imageKey: products.imageKey,
      imageUrl: products.imageUrl,
      sales: salesCount,
      downloads: downloadsCount,
      revenue: revenueSum,
    })
    .from(products)
    .where(eq(products.id, id));
  if (!product) return null;

  const assets = await db
    .select({
      id: files.id,
      label: files.label,
      kind: files.kind,
      storageKey: files.storageKey,
      fileName: files.fileName,
      sizeBytes: files.sizeBytes,
      url: files.url,
      availableAt: files.availableAt,
      readyNotifiedAt: files.readyNotifiedAt,
      uploadedAt: files.uploadedAt,
      sortOrder: productFiles.sortOrder,
      downloads: sql<number>`(
        select count(*)::int
        from downloads d
        join download_tokens t on t.id = d.token_id
        join order_items oi on oi.order_id = t.order_id and oi.product_id = ${id}
        where d.file_id = files.id
      )`,
    })
    .from(productFiles)
    .innerJoin(files, eq(files.id, productFiles.fileId))
    .where(eq(productFiles.productId, id))
    .orderBy(asc(productFiles.sortOrder), asc(files.label));

  // Other products each asset is attached to ("Also in: …").
  const links = assets.length
    ? await db
        .select({ fileId: productFiles.fileId, productId: products.id, title: products.title })
        .from(productFiles)
        .innerJoin(products, eq(products.id, productFiles.productId))
        .where(inArray(productFiles.fileId, assets.map((a) => a.id)))
    : [];

  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      email: orders.email,
      status: orders.status,
      paidAt: orders.paidAt,
      amount: orderItems.amount,
      isBump: orderItems.isBump,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(eq(orderItems.productId, id))
    .orderBy(desc(orders.paidAt))
    .limit(10);

  return {
    product,
    assets: assets.map((a) => ({
      ...a,
      alsoIn: links.filter((l) => l.fileId === a.id && l.productId !== id).map((l) => l.title),
    })),
    recentOrders,
  };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductDetail>>>;
export type ProductAsset = ProductDetail["assets"][number];

/** Form values for the product page (prices in dollars). */
export function toProductInput(p: ProductDetail["product"]): ProductInput {
  return {
    title: p.title,
    slug: p.slug,
    kind: p.kind,
    status: p.status,
    price: p.price / 100,
    foundingPrice: p.foundingPrice === null ? null : p.foundingPrice / 100,
    stripeProductId: p.stripeProductId ?? "",
    stripePriceId: p.stripePriceId ?? "",
    foundingPriceId: p.foundingPriceId ?? "",
    image: p.imageKey && p.imageUrl ? { key: p.imageKey, url: p.imageUrl } : null,
  };
}

/** Every asset with the products it's attached to (asset picker, "Add asset"). */
export async function getAssetLibrary() {
  const rows = await db
    .select({
      id: files.id,
      label: files.label,
      kind: files.kind,
      storageKey: files.storageKey,
      fileName: files.fileName,
      sizeBytes: files.sizeBytes,
      url: files.url,
      availableAt: files.availableAt,
    })
    .from(files)
    .orderBy(asc(files.label));
  const links = await db
    .select({ fileId: productFiles.fileId, productId: products.id, title: products.title })
    .from(productFiles)
    .innerJoin(products, eq(products.id, productFiles.productId));
  return rows.map((r) => ({
    ...r,
    products: links.filter((l) => l.fileId === r.id).map((l) => ({ id: l.productId, title: l.title })),
  }));
}

export type LibraryAsset = Awaited<ReturnType<typeof getAssetLibrary>>[number];

/** Products for the asset dialog's "Attach to" picker. */
export function getProductOptions() {
  return db
    .select({ id: products.id, title: products.title, status: products.status })
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.title));
}

export type ProductOption = Awaited<ReturnType<typeof getProductOptions>>[number];
