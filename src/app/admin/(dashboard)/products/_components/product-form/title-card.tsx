"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import type { ProductInput } from "@/lib/validations/product";
import { FormCard } from "../../../_components/shared/form-card";

export function TitleCard() {
	const { register, formState } = useFormContext<ProductInput>();
	const { errors } = formState;

	return (
		<FormCard contentClassName="grid gap-4">
			<Field data-invalid={!!errors.title}>
				<FieldLabel htmlFor="title">Title</FieldLabel>
				<Input id="title" placeholder="Parentkeeping Medical Binder for an Elderly Parent" aria-invalid={!!errors.title} {...register("title")} />
				<FieldDescription>Include the page&apos;s main keyword (it&apos;s also the page title).</FieldDescription>
				<FieldError errors={[errors.title]} />
			</Field>
			<Field data-invalid={!!errors.slug}>
				<FieldLabel htmlFor="slug">URL handle</FieldLabel>
				<InputGroup>
					<InputGroupAddon>
						<InputGroupText>/products/</InputGroupText>
					</InputGroupAddon>
					<InputGroupInput id="slug" placeholder="medical-binder" aria-invalid={!!errors.slug} {...register("slug")} />
				</InputGroup>
				<FieldDescription>Also the id the Stripe webhook uses to map payments back to this product.</FieldDescription>
				<FieldError errors={[errors.slug]} />
			</Field>
		</FormCard>
	);
}
