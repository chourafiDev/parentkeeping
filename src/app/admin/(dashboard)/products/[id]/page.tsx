import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { getAssetLibrary, getProductDetail, getProductOptions, toProductInput } from "@/server/queries/products";
import { AssetsCard } from "../_components/assets-card";
import { ProductStatsCard, RecentOrdersCard } from "../_components/product-insights";
import { ProductForm } from "../_components/product-form/product-form";

const paramsSchema = z.object({ id: z.uuid() });

async function load(params: Promise<{ id: string }>) {
	const parsed = paramsSchema.safeParse(await params);
	if (!parsed.success) notFound();
	const data = await getProductDetail(parsed.data.id);
	if (!data) notFound();
	return data;
}

export async function generateMetadata({ params }: PageProps<"/admin/products/[id]">): Promise<Metadata> {
	const { product } = await load(params);
	return { title: product.title };
}

export default async function ProductPage({ params }: PageProps<"/admin/products/[id]">) {
	const { user } = await requireStaffPage({ product: ["read"] });
	const [{ product, assets, recentOrders }, library, products] = await Promise.all([
		load(params),
		getAssetLibrary(),
		getProductOptions(),
	]);
	const canUpdate = hasPermission(user.role, { product: ["update"] });

	return (
		<ProductForm
			// Remount with fresh values when switching between products.
			key={product.id}
			productId={product.id}
			defaultValues={toProductInput(product)}
			readOnly={!canUpdate}
			assets={
				<AssetsCard
					productId={product.id}
					productTitle={product.title}
					assets={assets}
					library={library}
					products={products}
					sales={product.sales}
					canUpdate={canUpdate}
					canDelete={hasPermission(user.role, { product: ["delete"] })}
				/>
			}
			aside={<ProductStatsCard product={product} canSeeRevenue={hasPermission(user.role, { finance: ["read"] })} />}
			after={<RecentOrdersCard orders={recentOrders} />}
		/>
	);
}
