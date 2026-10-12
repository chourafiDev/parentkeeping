import type { Metadata } from "next";
import { requireStaffPage } from "@/server/auth/session";
import { ProductForm } from "../_components/product-form/product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
	await requireStaffPage({ product: ["create"] });
	return <ProductForm />;
}
