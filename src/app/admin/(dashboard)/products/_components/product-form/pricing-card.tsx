"use client";

import { ChevronDown } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { MoneyInput } from "@/components/money-input";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ProductInput } from "@/lib/validations/product";
import { FormCard } from "../../../_components/shared/form-card";

export function PricingCard() {
	const { control, register, formState } = useFormContext<ProductInput>();
	const { errors } = formState;

	return (
		<FormCard title="Price" contentClassName="grid gap-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<Controller
					control={control}
					name="price"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="price">Price</FieldLabel>
							<MoneyInput id="price" value={field.value} onChange={(v) => field.onChange(v ?? Number.NaN)} onBlur={field.onBlur} />
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					control={control}
					name="foundingPrice"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="foundingPrice">Founding price</FieldLabel>
							<MoneyInput id="foundingPrice" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
							<FieldDescription>Optional. Used until the founding end date (Settings).</FieldDescription>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>
			</div>

			{/* Stripe ids: secondary, folded away like Shopify's price chips. */}
			<details className="group rounded-lg border" open={!!(errors.stripeProductId || errors.stripePriceId || errors.foundingPriceId)}>
				<summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
					<span className="flex flex-wrap items-center gap-2">
						<span className="font-medium">Stripe</span>
						<span className="text-muted-foreground text-xs">Checkout charges these Stripe prices; the amounts above are what pages show.</span>
					</span>
					<ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" />
				</summary>
				<div className="grid gap-4 border-t p-3 sm:grid-cols-2">
					<Field data-invalid={!!errors.stripeProductId} className="sm:col-span-2">
						<FieldLabel htmlFor="stripeProductId">Stripe product ID</FieldLabel>
						<Input id="stripeProductId" placeholder="prod_…" className="font-mono" {...register("stripeProductId")} />
						<FieldError errors={[errors.stripeProductId]} />
					</Field>
					<Field data-invalid={!!errors.stripePriceId}>
						<FieldLabel htmlFor="stripePriceId">Stripe price ID</FieldLabel>
						<Input id="stripePriceId" placeholder="price_…" className="font-mono" {...register("stripePriceId")} />
						<FieldError errors={[errors.stripePriceId]} />
					</Field>
					<Field data-invalid={!!errors.foundingPriceId}>
						<FieldLabel htmlFor="foundingPriceId">Founding price ID</FieldLabel>
						<Input id="foundingPriceId" placeholder="price_…" className="font-mono" {...register("foundingPriceId")} />
						<FieldError errors={[errors.foundingPriceId]} />
					</Field>
					<p className="text-muted-foreground text-xs sm:col-span-2">Run pnpm stripe:sync to create missing Stripe prices and fill these in.</p>
				</div>
			</details>
		</FormCard>
	);
}
