"use client";

import { Check, ImagePlus, Loader, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ProductInput } from "@/lib/validations/product";
import { FormCard } from "../../../_components/shared/form-card";

const MAX_IMAGES = 20;

/** Shopify "Media": gallery of images, first one is the main image. Drop to upload. */
export function MediaCard() {
	const { control, register } = useFormContext<ProductInput>();
	const { fields, append, remove, move } = useFieldArray({ control, name: "images", keyName: "_id" });
	const images = useWatch({ control, name: "images" });
	const [altIndex, setAltIndex] = useState<number | null>(null);
	const [uploading, setUploading] = useState(0);
	const [dragging, setDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFiles = async (list: FileList | null) => {
		const files = Array.from(list ?? []).slice(0, MAX_IMAGES - fields.length);
		if (!files.length) return;
		setUploading((n) => n + files.length);
		await Promise.all(
			files.map(async (file) => {
				try {
					append(await uploadImage(file));
				} catch (err) {
					toast.error(`${file.name}: ${(err as Error).message}`);
				} finally {
					setUploading((n) => n - 1);
				}
			}),
		);
	};

	const dropzone = (
		<button
			type="button"
			onClick={() => inputRef.current?.click()}
			className={cn(
				"border-input text-muted-foreground hover:border-primary hover:text-foreground flex size-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm transition-colors",
				fields.length === 0 && "min-h-36",
				dragging && "border-primary bg-accent text-foreground",
			)}
		>
			{uploading > 0 ? <Loader className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
			<span className="font-medium">{uploading > 0 ? `Uploading ${uploading}…` : fields.length ? "Add" : "Upload images"}</span>
			{fields.length === 0 && <span className="text-xs">or drop them here · JPG, PNG, WEBP · 10 MB max</span>}
		</button>
	);

	return (
		<FormCard title="Media">
			<div
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					void handleFiles(e.dataTransfer.files);
				}}
			>
				<input
					ref={inputRef}
					type="file"
					accept={IMAGE_ACCEPT}
					multiple
					hidden
					onChange={(e) => {
						void handleFiles(e.target.files);
						e.target.value = "";
					}}
				/>
				{fields.length === 0 ? (
					dropzone
				) : (
					<div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
						{fields.map((image, index) => (
							<div
								key={image._id}
								className={cn("group bg-muted relative overflow-hidden rounded-lg border", index === 0 ? "col-span-2 row-span-2" : "aspect-square")}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={image.url} alt="" className="size-full object-cover" />
								<button
									type="button"
									onClick={() => setAltIndex(index)}
									aria-label={images?.[index]?.alt ? "Edit alt text" : "Add alt text"}
									className={cn(
										"bg-background/90 absolute start-1.5 top-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium shadow-sm transition-opacity",
										images?.[index]?.alt ? "opacity-0 group-hover:opacity-100 focus-visible:opacity-100" : "text-destructive",
									)}
								>
									{images?.[index]?.alt && <Check className="size-3" />}
									Alt
								</button>
								<button
									type="button"
									aria-label="Remove image"
									onClick={() => remove(index)}
									className="bg-background/90 absolute end-1.5 top-1.5 rounded-md p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
								>
									<X className="size-3.5" />
								</button>
								{index === 0 ? (
									<span className="bg-background/90 absolute start-1.5 bottom-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium">Main</span>
								) : (
									<button
										type="button"
										onClick={() => move(index, 0)}
										className="bg-background/90 absolute start-1.5 bottom-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
									>
										Make main
									</button>
								)}
							</div>
						))}
						{fields.length < MAX_IMAGES && <div className="aspect-square">{dropzone}</div>}
					</div>
				)}
			</div>
			<Dialog open={altIndex !== null} onOpenChange={(open) => !open && setAltIndex(null)}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Alt text</DialogTitle>
						<DialogDescription>Describes the image for screen readers and search engines.</DialogDescription>
					</DialogHeader>
					{altIndex !== null && fields[altIndex] && (
						<div className="grid grid-cols-[96px_1fr] items-start gap-4">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={fields[altIndex].url} alt="" className="bg-muted aspect-square w-full rounded-md border object-cover" />
							<Field>
								<FieldLabel htmlFor="image-alt">Alt text</FieldLabel>
								<Textarea id="image-alt" rows={4} maxLength={255} autoFocus {...register(`images.${altIndex}.alt`)} />
								<FieldDescription>Say what the image shows, in plain words. Under 125 characters reads best.</FieldDescription>
							</Field>
						</div>
					)}
					<DialogFooter>
						<Button type="button" onClick={() => setAltIndex(null)}>
							Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</FormCard>
	);
}
