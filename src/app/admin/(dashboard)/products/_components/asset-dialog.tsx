"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, FileText, FileUp, Loader, Sheet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api-client";
import { formatBytes } from "@/lib/assets";
import { ASSET_ACCEPT, uploadAsset } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { type AssetInput, assetInputSchema } from "@/lib/validations/asset";
import { PRODUCT_STATUS_LABELS } from "@/lib/validations/product";
import type { ProductOption } from "@/server/queries/products";

/** Existing asset being edited. */
export type EditedAsset = { id: string } & AssetInput;

const emptyAsset: AssetInput = { label: "", kind: "pdf", file: null, url: "", availableAt: null, productIds: [] };

/** "Medical-Binder_v2.pdf" → "Medical Binder v2" (a starting point for the buyer-facing name). */
const labelFromFileName = (name: string) =>
	name
		.replace(/\.pdf$/i, "")
		.replace(/[-_]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();

/**
 * Create or edit an asset (Shopify Digital Products' "Add asset"): upload a PDF
 * or paste a Google Sheets copy link, optionally as a pre-sale with an
 * "Arrives by" date, and pick the products it's delivered with.
 */
export function AssetDialog({
	open,
	onOpenChange,
	products,
	asset,
	defaultProductIds = [],
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	products: ProductOption[];
	asset?: EditedAsset;
	defaultProductIds?: string[];
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-[560px]">
				{/* Mounted only while open: every opening starts from fresh values. */}
				{open && (
					<AssetForm
						products={products}
						asset={asset}
						defaultProductIds={defaultProductIds}
						onDone={() => onOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function AssetForm({
	products,
	asset,
	defaultProductIds,
	onDone,
}: {
	products: ProductOption[];
	asset?: EditedAsset;
	defaultProductIds: string[];
	onDone: () => void;
}) {
	const router = useRouter();
	const form = useForm<AssetInput>({
		resolver: zodResolver(assetInputSchema),
		defaultValues: asset ?? { ...emptyAsset, productIds: defaultProductIds },
	});
	const { control, register, setValue, getValues, formState } = form;
	const [kind, file, availableAt] = useWatch({ control, name: ["kind", "file", "availableAt"] });
	const [progress, setProgress] = useState<number | null>(null);
	const [dragging, setDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const uploading = progress !== null;

	async function handleFile(selected: File | undefined) {
		if (!selected) return;
		setProgress(0);
		try {
			const uploaded = await uploadAsset(selected, setProgress);
			setValue("file", uploaded, { shouldDirty: true, shouldValidate: formState.isSubmitted });
			if (!getValues("label")) setValue("label", labelFromFileName(selected.name), { shouldDirty: true });
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setProgress(null);
		}
	}

	const onSubmit = form.handleSubmit(async (values) => {
		const res = asset
			? await api.api.admin.assets[":id"].$patch({ param: { id: asset.id }, json: values })
			: await api.api.admin.assets.$post({ json: values });
		const body = (await res.json().catch(() => null)) as { error?: string } | null;
		if (!res.ok) {
			toast.error(body?.error ?? "Couldn't save the asset");
			return;
		}
		toast.success(asset ? "Asset saved" : "Asset added");
		onDone();
		router.refresh();
	});

	return (
		<form
			// The dialog is portalled, but React still bubbles submit to a parent
			// <form> (the product form): keep it here.
			onSubmit={(e) => {
				e.stopPropagation();
				void onSubmit(e);
			}}
			noValidate
			className="grid gap-5"
		>
			<DialogHeader>
				<DialogTitle>{asset ? "Edit asset" : "Add asset"}</DialogTitle>
				<DialogDescription>
					Buyers of the selected products get this on their downloads page, after payment.
				</DialogDescription>
			</DialogHeader>

			{/* Type: PDF or Google Sheet (type can't change once created). */}
			{!asset && (
				<Controller
					control={control}
					name="kind"
					render={({ field }) => (
						<div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Asset type">
							{(
								[
									{ value: "pdf", icon: FileText, title: "PDF file", hint: "Stored privately, signed links" },
									{ value: "sheet_link", icon: Sheet, title: "Google Sheet", hint: "“Make a copy” link" },
								] as const
							).map((o) => (
								<button
									key={o.value}
									type="button"
									role="radio"
									aria-checked={field.value === o.value}
									onClick={() => field.onChange(o.value)}
									className={cn(
										"flex items-start gap-3 rounded-lg border p-3 text-start transition-colors",
										field.value === o.value ? "border-primary bg-accent" : "hover:bg-muted",
									)}
								>
									<o.icon className={cn("mt-0.5 size-4 shrink-0", field.value === o.value && "text-primary")} />
									<span className="grid">
										<span className="text-sm font-medium">{o.title}</span>
										<span className="text-muted-foreground text-xs">{o.hint}</span>
									</span>
								</button>
							))}
						</div>
					)}
				/>
			)}

			{kind === "pdf" ? (
				<Field data-invalid={!!formState.errors.file}>
					<FieldLabel>File</FieldLabel>
					<input
						ref={inputRef}
						type="file"
						accept={ASSET_ACCEPT}
						hidden
						onChange={(e) => {
							void handleFile(e.target.files?.[0]);
							e.target.value = "";
						}}
					/>
					{file && !uploading ? (
						<div className="flex items-center gap-3 rounded-lg border p-3">
							<span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
								<FileText className="size-4" />
							</span>
							<span className="grid min-w-0 flex-1">
								<span className="truncate text-sm font-medium">{file.fileName}</span>
								<span className="text-muted-foreground text-xs">{formatBytes(file.sizeBytes)} · PDF</span>
							</span>
							<Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
								Replace
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="Remove file"
								onClick={() => setValue("file", null, { shouldDirty: true })}
							>
								<X className="size-4" />
							</Button>
						</div>
					) : (
						<button
							type="button"
							disabled={uploading}
							onClick={() => inputRef.current?.click()}
							onDragOver={(e) => {
								e.preventDefault();
								setDragging(true);
							}}
							onDragLeave={() => setDragging(false)}
							onDrop={(e) => {
								e.preventDefault();
								setDragging(false);
								void handleFile(e.dataTransfer.files[0]);
							}}
							className={cn(
								"border-input text-muted-foreground hover:border-primary hover:text-foreground flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm transition-colors",
								dragging && "border-primary bg-accent text-foreground",
							)}
						>
							{uploading ? <Loader className="size-5 animate-spin" /> : <FileUp className="size-5" />}
							<span className="font-medium">{uploading ? `Uploading… ${progress}%` : "Upload a PDF"}</span>
							{uploading ? (
								<span className="bg-muted h-1.5 w-40 overflow-hidden rounded-full">
									<span className="bg-primary block h-full transition-[width]" style={{ width: `${progress}%` }} />
								</span>
							) : (
								<span className="text-xs">or drop it here · up to 200 MB</span>
							)}
						</button>
					)}
					<FieldError errors={[formState.errors.file]} />
				</Field>
			) : (
				<Field data-invalid={!!formState.errors.url}>
					<FieldLabel htmlFor="asset-url">Google Sheets “Make a copy” link</FieldLabel>
					<Input
						id="asset-url"
						placeholder="https://docs.google.com/spreadsheets/d/…/copy"
						aria-invalid={!!formState.errors.url}
						{...register("url")}
					/>
					<FieldDescription>
						Shown only on the buyer&apos;s downloads page. Buyers get their own copy; never ask them to share it with you.
					</FieldDescription>
					<FieldError errors={[formState.errors.url]} />
				</Field>
			)}

			<Field data-invalid={!!formState.errors.label}>
				<FieldLabel htmlFor="asset-label">Name buyers see</FieldLabel>
				<Input
					id="asset-label"
					placeholder="Medical Binder (fillable PDF + printable)"
					aria-invalid={!!formState.errors.label}
					{...register("label")}
				/>
				<FieldError errors={[formState.errors.label]} />
			</Field>

			{/* Pre-sale */}
			<div className="grid gap-3 rounded-lg border p-3">
				<label className="flex items-start justify-between gap-4">
					<span className="grid gap-0.5">
						<span className="text-sm font-medium">Pre-sale</span>
						<span className="text-muted-foreground text-xs">
							Not ready yet: buyers see “Arrives by [date]” instead of a download button.
						</span>
					</span>
					<Switch
						checked={availableAt !== null}
						onCheckedChange={(on) =>
							setValue("availableAt", on ? format(new Date(Date.now() + 14 * 864e5), "yyyy-MM-dd") : null, {
								shouldDirty: true,
								shouldValidate: formState.isSubmitted,
							})
						}
					/>
				</label>
				{availableAt !== null && (
					<Controller
						control={control}
						name="availableAt"
						render={({ field }) => (
							<Popover>
								<PopoverTrigger asChild>
									<Button type="button" variant="outline" className="justify-start font-normal">
										<CalendarIcon className="text-muted-foreground" />
										Arrives by {field.value ? format(parseISO(field.value), "MMMM d, yyyy") : "…"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value ? parseISO(field.value) : undefined}
										onSelect={(d) => d && field.onChange(format(d, "yyyy-MM-dd"))}
										disabled={{ before: new Date() }}
									/>
								</PopoverContent>
							</Popover>
						)}
					/>
				)}
			</div>

			<Controller
				control={control}
				name="productIds"
				render={({ field }) => (
					<Field>
						<FieldLabel>Delivered with</FieldLabel>
						<div className="grid gap-1 rounded-lg border p-1">
							{products.map((p) => {
								const checked = field.value.includes(p.id);
								return (
									<label key={p.id} className="hover:bg-muted flex items-center gap-3 rounded-md px-2 py-2 text-sm">
										<Checkbox
											checked={checked}
											onCheckedChange={(on) =>
												field.onChange(on ? [...field.value, p.id] : field.value.filter((id) => id !== p.id))
											}
										/>
										<span className="flex-1">{p.title}</span>
										{p.status !== "active" && (
											<span className="text-muted-foreground text-xs">{PRODUCT_STATUS_LABELS[p.status]}</span>
										)}
									</label>
								);
							})}
						</div>
						<FieldDescription>
							{field.value.length === 0
								? "Not attached to any product yet: nobody receives it."
								: "Removing a product here also removes the file from that product's past buyers."}
						</FieldDescription>
					</Field>
				)}
			/>

			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" variant="outline" disabled={formState.isSubmitting}>
						Cancel
					</Button>
				</DialogClose>
				<Button type="submit" disabled={formState.isSubmitting || uploading}>
					{formState.isSubmitting && <Loader className="size-4 animate-spin" />}
					{asset ? "Save" : "Add asset"}
				</Button>
			</DialogFooter>
		</form>
	);
}
