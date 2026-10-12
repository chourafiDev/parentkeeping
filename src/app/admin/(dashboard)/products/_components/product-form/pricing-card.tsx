"use client";

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
		<FormCard title="Pricing" contentClassName="grid gap-4">
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

			<div className="bg-muted/70 grid gap-4 rounded-lg p-3">
				<p className="text-muted-foreground text-xs">
					Stripe is the source of truth for money: checkout charges these Stripe prices, the amounts above are only
					shown on pages. Create them in Stripe test mode first, then live.
				</p>
				<div className="grid gap-4 sm:grid-cols-2">
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
				</div>
			</div>
		</FormCard>
	);
}
