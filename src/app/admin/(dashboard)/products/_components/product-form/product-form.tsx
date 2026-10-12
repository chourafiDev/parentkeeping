"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { PRODUCT_STATUS_LABELS, type ProductInput, productInputSchema } from "@/lib/validations/product";
import { UnsavedChangesBar } from "../../../_components/shared/unsaved-changes-bar";
import { STATUS_STYLES } from "../products-list";
import { MediaCard } from "./media-card";
import { PricingCard } from "./pricing-card";
import { StatusCard } from "./status-card";
import { TitleCard } from "./title-card";

export const emptyProduct: ProductInput = {
	title: "",
	slug: "",
	kind: "single",
	status: "draft",
	price: 0,
	foundingPrice: null,
	stripeProductId: "",
	stripePriceId: "",
	foundingPriceId: "",
	image: null,
};

/**
 * Product page. `assets`, `aside` and `after` are server-rendered cards placed
 * in the layout (assets and orders act immediately, outside the Save button).
 */
export function ProductForm({
	productId,
	defaultValues = emptyProduct,
	readOnly = false,
	assets,
	aside,
	after,
}: {
	productId?: string;
	defaultValues?: ProductInput;
	readOnly?: boolean;
	assets?: React.ReactNode;
	aside?: React.ReactNode;
	after?: React.ReactNode;
}) {
	const router = useRouter();
	const form = useForm<ProductInput>({
		resolver: zodResolver(productInputSchema),
		defaultValues,
		mode: "onTouched",
	});
	const { isDirty, isSubmitting } = form.formState;

	// Warn before leaving the page with unsaved changes.
	useEffect(() => {
		if (!isDirty) return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [isDirty]);

	const onSubmit = form.handleSubmit(
		async (values) => {
			const res = productId
				? await api.api.admin.products[":id"].$patch({ param: { id: productId }, json: values })
				: await api.api.admin.products.$post({ json: values });
			const body = (await res.json().catch(() => null)) as { id: string } | { error?: string } | null;
			if (!res.ok || !body || !("id" in body)) {
				toast.error((body && "error" in body && body.error) || "Couldn't save the product");
				return;
			}
			form.reset(values); // saved values become the new baseline
			if (productId) {
				toast.success("Product saved");
				router.refresh();
			} else {
				toast.success("Product created");
				router.push(`/admin/products/${body.id}`);
			}
		},
		() => toast.error("Fix the highlighted fields"),
	);

	return (
		<FormProvider {...form}>
			<form onSubmit={onSubmit} noValidate>
				<UnsavedChangesBar
					visible={isDirty}
					label="Unsaved product"
					isSubmitting={isSubmitting}
					onDiscard={() => form.reset()}
				/>

				<div className="mb-4 flex items-center gap-2">
					<Button asChild variant="ghost" size="icon" aria-label="Back to products" className="bg-grey">
						<Link href="/admin/products">
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<h1 className="truncate text-lg font-semibold">{productId ? defaultValues.title : "New product"}</h1>
					{productId && (
						<Badge variant="outline" className={STATUS_STYLES[defaultValues.status]}>
							{PRODUCT_STATUS_LABELS[defaultValues.status]}
						</Badge>
					)}
				</div>

				<fieldset disabled={readOnly} className="contents">
					<div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
						<div className="flex min-w-0 flex-col gap-4">
							<TitleCard />
							{assets}
							<PricingCard />
							<MediaCard />
							{after}
						</div>
						<div className="flex flex-col gap-4 lg:sticky lg:top-20">
							<StatusCard />
							{aside}
						</div>
					</div>
				</fieldset>

				{!readOnly && (
					<div className="mt-4 flex justify-end pt-4">
						<Button type="submit" disabled={isSubmitting} className="px-10">
							{isSubmitting && <Loader className="size-4 animate-spin" />}
							Save
						</Button>
					</div>
				)}
			</form>
		</FormProvider>
	);
}
