"use client";

import { Controller, useFormContext } from "react-hook-form";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ProductInput } from "@/lib/validations/product";
import { FormCard } from "../../../_components/shared/form-card";

/** Shopify's first card: Title + rich-text Description. */
export function TitleDescriptionCard() {
	const { control, register, formState } = useFormContext<ProductInput>();
	const { errors } = formState;

	return (
		<FormCard contentClassName="grid gap-4">
			<Field data-invalid={!!errors.title}>
				<FieldLabel htmlFor="title">Title</FieldLabel>
				<Input id="title" placeholder="Parentkeeping Medical Binder for an Elderly Parent" aria-invalid={!!errors.title} {...register("title")} />
				<FieldError errors={[errors.title]} />
			</Field>
			<Controller
				control={control}
				name="description"
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor="description">Description</FieldLabel>
						<RichTextEditor
							id="description"
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							aria-invalid={fieldState.invalid}
						/>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>
		</FormCard>
	);
}
