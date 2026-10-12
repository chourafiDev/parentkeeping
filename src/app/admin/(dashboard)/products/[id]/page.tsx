import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PRODUCT_PATHS } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-url";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { getProductDetail, toProductInput } from "@/server/queries/products";
import { AssetsCard } from "../_components/assets-card";
import { RecentOrdersCard, SalesCard } from "../_components/product-insights";
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
	const detail = await load(params);
	const { product, assets, recentOrders, last90 } = detail;
	const canUpdate = hasPermission(user.role, { product: ["update"] });

	return (
		<ProductForm
			// Remount with fresh values when switching between products.
			key={product.id}
			productId={product.id}
			defaultValues={toProductInput(detail)}
			readOnly={!canUpdate}
			host={new URL(siteUrl()).host}
			storePath={PRODUCT_PATHS[product.slug] ?? null}
			assets={
				<AssetsCard
					productId={product.id}
					assets={assets}
					canUpdate={canUpdate}
					canDelete={hasPermission(user.role, { product: ["delete"] })}
				/>
			}
			aside={<SalesCard last90={last90} canSeeRevenue={hasPermission(user.role, { finance: ["read"] })} />}
			after={<RecentOrdersCard orders={recentOrders} />}
		/>
	);
}
