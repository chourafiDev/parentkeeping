import type { Metadata } from "next";
import { HiCube } from "react-icons/hi2";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { getProductOptions, getProductsList, getProductTabCounts } from "@/server/queries/products";
import { ListHeader } from "../_components/shared/list-header";
import { ListTransitionProvider } from "../_components/shared/list-transition";
import { AddAssetButton } from "./_components/add-asset-button";
import { ProductsList } from "./_components/products-list";
import { productsSearchParamsCache } from "./_lib/search-params";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
	const { user } = await requireStaffPage({ product: ["read"] });
	const { status, q, sort } = productsSearchParamsCache.parse(await searchParams);
	const canUpdate = hasPermission(user.role, { product: ["update"] });

	const [rows, counts, productOptions] = await Promise.all([
		getProductsList({ tab: status, q, sort }),
		getProductTabCounts(),
		getProductOptions(),
	]);

	return (
		<ListTransitionProvider>
			<ListHeader
				icon={<HiCube />}
				total={counts.all}
				label={{ singular: "Product", plural: "Products" }}
				create={hasPermission(user.role, { product: ["create"] }) ? { href: "/admin/products/new", label: "New product" } : undefined}
				action={canUpdate ? <AddAssetButton products={productOptions} /> : undefined}
			/>
			<ProductsList rows={rows} counts={counts} />
		</ListTransitionProvider>
	);
}
