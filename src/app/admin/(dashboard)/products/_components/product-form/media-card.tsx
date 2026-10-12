"use client";

import { ImagePlus, Loader, X } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ProductInput } from "@/lib/validations/product";
import { FormCard } from "../../../_components/shared/form-card";

/** Single cover image (admin list + store). */
export function MediaCard() {
	const { control } = useFormContext<ProductInput>();
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<FormCard title="Cover image">
			<Controller
				control={control}
				name="image"
				render={({ field }) => {
					const pick = async (file: File | undefined) => {
						if (!file) return;
						setUploading(true);
						try {
							field.onChange(await uploadImage(file));
						} catch (err) {
							toast.error((err as Error).message);
						} finally {
							setUploading(false);
						}
					};
					return (
						<div className="flex items-center gap-4">
							<input
								ref={inputRef}
								type="file"
								accept={IMAGE_ACCEPT}
								hidden
								onChange={(e) => {
									void pick(e.target.files?.[0]);
									e.target.value = "";
								}}
							/>
							<button
								type="button"
								onClick={() => inputRef.current?.click()}
								className={cn(
									"border-input text-muted-foreground hover:border-primary hover:text-foreground relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-colors",
									!field.value && "border-dashed",
								)}
								aria-label={field.value ? "Replace cover image" : "Add cover image"}
							>
								{uploading ? (
									<Loader className="size-5 animate-spin" />
								) : field.value ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={field.value.url} alt="" className="size-full object-cover" />
								) : (
									<ImagePlus className="size-5" />
								)}
							</button>
							<div className="grid gap-2 text-sm">
								<p className="text-muted-foreground">JPG, PNG, WEBP or AVIF · up to 10 MB. Square works best.</p>
								<div className="flex gap-2">
									<Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
										{field.value ? "Replace" : "Upload image"}
									</Button>
									{field.value && (
										<Button type="button" variant="ghost" size="sm" onClick={() => field.onChange(null)}>
											<X />
											Remove
										</Button>
									)}
								</div>
							</div>
						</div>
					);
				}}
			/>
		</FormCard>
	);
}
