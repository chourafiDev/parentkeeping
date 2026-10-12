import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import { requireStaffPage } from "@/server/auth/session";
import { AssetsCard } from "../_components/assets-card";
import { ProductForm } from "../_components/product-form/product-form";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
	await requireStaffPage({ product: ["create"] });
	return (
		<ProductForm
			host={new URL(siteUrl()).host}
			// Files are added once the product exists; the access limit saves with it.
			assets={<AssetsCard assets={[]} canUpdate canDelete={false} />}
		/>
	);
}
