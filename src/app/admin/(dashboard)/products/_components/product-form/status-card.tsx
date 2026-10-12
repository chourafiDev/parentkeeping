"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	PRODUCT_KIND_LABELS,
	PRODUCT_KINDS,
	PRODUCT_STATUS_LABELS,
	PRODUCT_STATUSES,
	type ProductInput,
} from "@/lib/validations/product";
import { FormCard } from "../../../_components/shared/form-card";

const STATUS_HINTS: Record<ProductInput["status"], string> = {
	active: "For sale: its page and Buy button are live.",
	draft: "Hidden from the store until you activate it.",
	archived: "Retired. Past buyers keep their downloads.",
};

const KIND_HINTS: Record<ProductInput["kind"], string> = {
	bundle: "Delivers several parts (e.g. the Family Care System).",
	single: "One product with its own page.",
	bump: "No page: only offered as the add-on on the System checkout.",
};

export function StatusCard() {
	const { control } = useFormContext<ProductInput>();

	return (
		<FormCard title="Status" contentClassName="grid gap-4">
			<Controller
				control={control}
				name="status"
				render={({ field }) => (
					<Field>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger aria-label="Status" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PRODUCT_STATUSES.map((s) => (
									<SelectItem key={s} value={s}>
										{PRODUCT_STATUS_LABELS[s]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldDescription>{STATUS_HINTS[field.value]}</FieldDescription>
					</Field>
				)}
			/>
			<Controller
				control={control}
				name="kind"
				render={({ field }) => (
					<Field>
						<FieldLabel>Type</FieldLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger aria-label="Type" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PRODUCT_KINDS.map((k) => (
									<SelectItem key={k} value={k}>
										{PRODUCT_KIND_LABELS[k]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldDescription>{KIND_HINTS[field.value]}</FieldDescription>
					</Field>
				)}
			/>
		</FormCard>
	);
}
