import type { Metadata } from "next";
import { HiShoppingCart } from "react-icons/hi2";
import { requireStaffPage } from "@/server/auth/session";
import { getOrdersList, getOrderTabCounts } from "@/server/queries/orders";
import { ListHeader } from "../_components/shared/list-header";
import { ListTransitionProvider } from "../_components/shared/list-transition";
import { OrdersList } from "./_components/orders-list";
import { ordersSearchParamsCache } from "./_lib/search-params";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
	await requireStaffPage({ order: ["read"] });
	const { status, q, page } = ordersSearchParamsCache.parse(await searchParams);

	const [{ rows, total, pageCount }, counts] = await Promise.all([
		getOrdersList({ tab: status, q, page: Math.max(1, page) }),
		getOrderTabCounts(),
	]);

	return (
		<ListTransitionProvider>
			<ListHeader icon={<HiShoppingCart />} total={total} label={{ singular: "Order", plural: "Orders" }} />
			<OrdersList rows={rows} counts={counts} pageCount={pageCount} total={total} />
		</ListTransitionProvider>
	);
}
