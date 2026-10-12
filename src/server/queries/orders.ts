import "server-only";
import { and, asc, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import type { OrderStatus } from "@/lib/orders";
import { db } from "@/server/db";
import { downloadTokens, orderEvents, orderItems, orders, users } from "@/server/db/schema";

export type OrderTab = "all" | OrderStatus;
export const ORDERS_PER_PAGE = 25;

const escapeLike = (s: string) => s.replace(/[%_\\]/g, "\\$&");

/** "#1001" or "1001" → order number; anything else searches email and name. */
function searchWhere(q: string): SQL | undefined {
  const term = q.trim();
  if (!term) return undefined;
  const number = /^#?\d+$/.test(term) ? Number(term.replace("#", "")) : null;
  if (number !== null) return eq(orders.orderNumber, number);
  const like = `%${escapeLike(term)}%`;
  return or(ilike(orders.email, like), ilike(orders.name, like));
}

// Correlated subqueries with explicit table names (Drizzle doesn't qualify
// columns in a single-table select, so "id" would be ambiguous).
const itemsSummary = sql<string>`(
  select string_agg(oi.title, ', ' order by oi.is_bump, oi.title)
  from order_items oi where oi.order_id = orders.id
)`;
const hasBump = sql<boolean>`exists (select 1 from order_items oi where oi.order_id = orders.id and oi.is_bump)`;
const downloadsCount = sql<number>`(
  select count(*)::int from downloads d join download_tokens t on t.id = d.token_id where t.order_id = orders.id
)`;

/** Orders list: status tab, search, newest first, paged. */
export async function getOrdersList({ tab, q, page }: { tab: OrderTab; q: string; page: number }) {
  const where = and(tab === "all" ? undefined : eq(orders.status, tab), searchWhere(q));

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        paidAt: orders.paidAt,
        email: orders.email,
        name: orders.name,
        billingCountry: orders.billingCountry,
        amountTotal: orders.amountTotal,
        amountRefunded: orders.amountRefunded,
        status: orders.status,
        founding: orders.founding,
        items: itemsSummary,
        hasBump,
        downloads: downloadsCount,
      })
      .from(orders)
      .where(where)
      .orderBy(desc(orders.paidAt))
      .limit(ORDERS_PER_PAGE)
      .offset((page - 1) * ORDERS_PER_PAGE),
    db.select({ total: sql<number>`count(*)::int` }).from(orders).where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / ORDERS_PER_PAGE)) };
}

export type OrderListRow = Awaited<ReturnType<typeof getOrdersList>>["rows"][number];

/** Number of orders per status tab. */
export async function getOrderTabCounts() {
  const rows = await db
    .select({ status: orders.status, count: sql<number>`count(*)::int` })
    .from(orders)
    .groupBy(orders.status);
  const counts: Record<OrderTab, number> = { all: 0, paid: 0, refunded: 0, flagged_non_us: 0 };
  for (const r of rows) {
    counts[r.status] = r.count;
    counts.all += r.count;
  }
  return counts;
}

/**
 * The files an order delivers: every asset of every product it includes
 * (bump included), deduplicated — the Binder PDF bought twice is one file.
 * `downloads` counts this order's downloads since the last limit reset.
 */
export async function getOrderFiles(orderId: string, downloadsSince: Date | null = null) {
  const result = await db.execute<{
    id: string;
    label: string;
    kind: "file" | "pdf" | "sheet_link";
    storage_key: string | null;
    file_name: string | null;
    size_bytes: number | null;
    download_limit: number | null;
    url: string | null;
    available_at: string | null;
    downloads: number;
    total_downloads: number;
    last_download_at: string | null;
  }>(sql`
    select f.id, f.label, f.kind, f.storage_key, f.file_name, f.size_bytes, f.url, f.available_at,
      -- Access limit from the order's products that include the file (null = unlimited).
      (select case when bool_or(p.download_limit is null) then null else max(p.download_limit) end
        from product_files pf join order_items oi on oi.product_id = pf.product_id join products p on p.id = pf.product_id
        where oi.order_id = ${orderId} and pf.file_id = f.id) as download_limit,
      (select count(*)::int from downloads d join download_tokens t on t.id = d.token_id
        where t.order_id = ${orderId} and d.file_id = f.id
        and (${downloadsSince}::timestamptz is null or d.created_at > ${downloadsSince}::timestamptz)) as downloads,
      (select count(*)::int from downloads d join download_tokens t on t.id = d.token_id
        where t.order_id = ${orderId} and d.file_id = f.id) as total_downloads,
      (select max(d.created_at) from downloads d join download_tokens t on t.id = d.token_id
        where t.order_id = ${orderId} and d.file_id = f.id) as last_download_at
    from files f
    where f.id in (
      select pf.file_id from product_files pf
      join order_items oi on oi.product_id = pf.product_id
      where oi.order_id = ${orderId}
    )
    -- Main products' files first (in their product order), the bump's last.
    order by (
      select min(case when oi.is_bump then 1000 else 0 end + pf.sort_order)
      from product_files pf join order_items oi on oi.product_id = pf.product_id
      where oi.order_id = ${orderId} and pf.file_id = f.id
    ), f.label
  `);
  return result.rows.map((r) => ({
    id: r.id,
    label: r.label,
    kind: r.kind,
    storageKey: r.storage_key,
    fileName: r.file_name,
    sizeBytes: r.size_bytes === null ? null : Number(r.size_bytes),
    downloadLimit: r.download_limit === null ? null : Number(r.download_limit),
    url: r.url,
    availableAt: r.available_at ? new Date(r.available_at) : null,
    downloads: Number(r.downloads),
    totalDownloads: Number(r.total_downloads),
    lastDownloadAt: r.last_download_at ? new Date(r.last_download_at) : null,
  }));
}

export type OrderFile = Awaited<ReturnType<typeof getOrderFiles>>[number];

/** Everything the order page shows. */
export async function getOrderDetail(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;

  const [items, files, events, [links]] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        title: orderItems.title,
        amount: orderItems.amount,
        isBump: orderItems.isBump,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, id))
      .orderBy(asc(orderItems.isBump), asc(orderItems.title)),
    getOrderFiles(id, order.downloadsResetAt),
    db
      .select({
        id: orderEvents.id,
        type: orderEvents.type,
        message: orderEvents.message,
        createdAt: orderEvents.createdAt,
        actorName: users.name,
      })
      .from(orderEvents)
      .leftJoin(users, eq(users.id, orderEvents.actorId))
      .where(eq(orderEvents.orderId, id))
      .orderBy(desc(orderEvents.createdAt)),
    db
      .select({
        active: sql<number>`count(*) filter (where ${downloadTokens.revokedAt} is null and ${downloadTokens.expiresAt} > now())::int`,
        expiresAt: sql<Date | null>`max(${downloadTokens.expiresAt}) filter (where ${downloadTokens.revokedAt} is null)`,
      })
      .from(downloadTokens)
      .where(eq(downloadTokens.orderId, id)),
  ]);

  return {
    order,
    items,
    files,
    events,
    links: { active: links?.active ?? 0, expiresAt: links?.expiresAt ? new Date(links.expiresAt) : null },
  };
}

export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderDetail>>>;
