"use client";

import { ImagePlus, Loader, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ProductInput } from "@/lib/validations/product";
import { FormCard } from "../../../_components/shared/form-card";

const MAX_IMAGES = 20;

/** Shopify "Media": gallery of images, first one is the main image. Drop to upload. */
export function MediaCard() {
	const { control } = useFormContext<ProductInput>();
	const { fields, append, remove, move } = useFieldArray({ control, name: "images", keyName: "_id" });
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
		</FormCard>
	);
}
