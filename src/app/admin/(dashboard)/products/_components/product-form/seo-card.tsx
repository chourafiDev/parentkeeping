"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { formatStorePrice } from "@/lib/money";
import type { ProductInput } from "@/lib/validations/product";
import { FormCard } from "../../../_components/shared/form-card";

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/** Shopify "Search engine listing": Google-style preview, edit title, description and URL handle. */
export function SeoCard({ host, pathPrefix, storePath }: { host: string; pathPrefix: string; storePath?: string | null }) {
	const [editing, setEditing] = useState(false);
	const { control, register, formState } = useFormContext<ProductInput>();
	const [title, description, seoTitle, seoDescription, slug, price] = useWatch({
		control,
		name: ["title", "description", "seoTitle", "seoDescription", "slug", "price"],
	});
	const { errors } = formState;
	const previewTitle = seoTitle || title;
	const previewDescription = seoDescription || stripHtml(description).slice(0, 160);
	const open = editing || !!(errors.seoTitle || errors.seoDescription || errors.slug);
	// A few products have a public URL that differs from this id (see catalog.ts
	// PRODUCT_PATHS): show the real one here so the preview never lies.
	const previewPath = storePath ?? `${pathPrefix}${slug}`;
	const remapped = !!storePath && storePath !== `${pathPrefix}${slug}`;

	return (
		<FormCard
			title="Search engine listing"
			action={
				<Button type="button" variant="ghost" size="icon-sm" aria-label="Edit search engine listing" onClick={() => setEditing((e) => !e)}>
					<Pencil className="size-4" />
				</Button>
			}
			contentClassName="grid gap-4"
		>
			{previewTitle ? (
				<div className="grid gap-0.5 rounded-lg border p-3">
					<p className="text-sm">Parentkeeping</p>
					<p className="text-muted-foreground truncate text-xs">
						{host}
						{previewPath}
					</p>
					<p className="truncate text-lg text-[#1a0dab]">{previewTitle}</p>
					<p className="text-muted-foreground line-clamp-2 text-sm">{previewDescription || "Add a description to see it here."}</p>
					{Number.isFinite(price) && <p className="text-muted-foreground text-sm">{formatStorePrice(Math.round(price * 100))} USD</p>}
				</div>
			) : (
				<p className="text-muted-foreground text-sm">Add a title and description to see how this product might appear in a search engine listing.</p>
			)}
			{open && (
				<div className="grid gap-4 border-t pt-4">
					<Field data-invalid={!!errors.seoTitle}>
						<FieldLabel htmlFor="seoTitle">Page title</FieldLabel>
						<Input id="seoTitle" placeholder={title} maxLength={70} {...register("seoTitle")} />
						<FieldDescription>{(seoTitle || "").length} of 70 characters used. Include the page&apos;s main keyword.</FieldDescription>
						<FieldError errors={[errors.seoTitle]} />
					</Field>
					<Field data-invalid={!!errors.seoDescription}>
						<FieldLabel htmlFor="seoDescription">Meta description</FieldLabel>
						<Textarea id="seoDescription" rows={3} maxLength={320} placeholder={stripHtml(description).slice(0, 160)} {...register("seoDescription")} />
						<FieldDescription>{(seoDescription || "").length} of 320 characters used</FieldDescription>
						<FieldError errors={[errors.seoDescription]} />
					</Field>
					<Field data-invalid={!!errors.slug}>
						<FieldLabel htmlFor="slug">URL handle</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<InputGroupText>{pathPrefix}</InputGroupText>
							</InputGroupAddon>
							<InputGroupInput id="slug" placeholder="medical-binder" aria-invalid={!!errors.slug} {...register("slug")} />
						</InputGroup>
						<FieldDescription>
							Also the id the Stripe webhook uses to map payments back to this product.
							{remapped && ` This product's live URL is ${previewPath} — do not change this field to match it.`}
						</FieldDescription>
						<FieldError errors={[errors.slug]} />
					</Field>
				</div>
			)}
		</FormCard>
	);
}
