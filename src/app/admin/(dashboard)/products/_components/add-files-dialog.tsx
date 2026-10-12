"use client";

import { CircleAlert, FileArchive, FileText, FileUp, Loader, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { formatBytes } from "@/lib/assets";
import { ASSET_ACCEPT, uploadAsset } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { MAX_ASSET_MB, type UploadedFile } from "@/lib/validations/asset";
import type { ProductOption } from "@/server/queries/products";

type Item = {
	id: string;
	name: string;
	size: number;
	progress: number;
	uploaded?: UploadedFile;
	error?: string;
};

/**
 * Shopify Digital Products' "Add files": pick or drop files (usually one ZIP
 * per product), each uploads straight to storage with its own progress, then
 * Save attaches them to the product.
 */
export function AddFilesDialog({
	open,
	onOpenChange,
	productId,
	products,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Fixed product (product page). Omit to pick one (products list). */
	productId?: string;
	products?: ProductOption[];
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[620px]">
				{/* Mounted only while open: every opening starts empty. */}
				{open && <AddFilesForm productId={productId} products={products} onDone={() => onOpenChange(false)} />}
			</DialogContent>
		</Dialog>
	);
}

function AddFilesForm({
	productId,
	products,
	onDone,
}: {
	productId?: string;
	products?: ProductOption[];
	onDone: () => void;
}) {
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const [items, setItems] = useState<Item[]>([]);
	const [target, setTarget] = useState(productId ?? "");
	const [dragging, setDragging] = useState(false);
	const [saving, setSaving] = useState(false);

	const uploading = items.some((i) => !i.uploaded && !i.error);
	const ready = items.filter((i) => i.uploaded);
	const update = (id: string, patch: Partial<Item>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));

	function addFiles(list: FileList | null) {
		const picked = Array.from(list ?? []);
		if (!picked.length) return;
		const next = picked.map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size, progress: 0 }));
		setItems((current) => [...current, ...next]);
		picked.forEach((file, i) => {
			const { id } = next[i];
			uploadAsset(file, (progress) => update(id, { progress }))
				.then((uploaded) => update(id, { uploaded, progress: 100 }))
				.catch((err: Error) => update(id, { error: err.message }));
		});
	}

	async function save() {
		if (!target || ready.length === 0) return;
		setSaving(true);
		const res = await api.api.admin.products[":id"].assets.$post({
			param: { id: target },
			json: { files: ready.map((i) => i.uploaded!) },
		});
		setSaving(false);
		if (!res.ok) {
			const body = (await res.json().catch(() => null)) as { error?: string } | null;
			toast.error(body?.error ?? "Couldn't add the files");
			return;
		}
		toast.success(`${ready.length} file${ready.length === 1 ? "" : "s"} added`);
		onDone();
		// From the products list, go to the product, like Shopify does.
		if (!productId) router.push(`/admin/products/${target}`);
		else router.refresh();
	}

	return (
		<div className="grid gap-5">
			<DialogHeader>
				<DialogTitle>Add files</DialogTitle>
				<DialogDescription>
					Upload each product&apos;s final files as one ZIP folder. Buyers download them after payment.
				</DialogDescription>
			</DialogHeader>

			{!productId && products && (
				<div className="grid gap-1.5">
					<span className="text-sm font-medium">Product</span>
					<Select value={target} onValueChange={setTarget}>
						<SelectTrigger aria-label="Product" className="w-full">
							<SelectValue placeholder="Choose the product these files belong to" />
						</SelectTrigger>
						<SelectContent>
							{products.map((p) => (
								<SelectItem key={p.id} value={p.id}>
									{p.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			<input
				ref={inputRef}
				type="file"
				accept={ASSET_ACCEPT}
				multiple
				hidden
				onChange={(e) => {
					addFiles(e.target.files);
					e.target.value = "";
				}}
			/>
			<div
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					addFiles(e.dataTransfer.files);
				}}
				className={cn(
					"border-input grid justify-items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
					dragging && "border-primary bg-accent",
				)}
			>
				<Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
					<FileUp />
					Upload file
				</Button>
				<p className="text-muted-foreground text-sm">or drag and drop files</p>
				<p className="text-muted-foreground text-xs">ZIP or PDF · up to {MAX_ASSET_MB} MB each</p>
			</div>

			{items.length > 0 && (
				<div className="grid gap-2">
					<p className="text-sm font-medium">Files selected ({items.length})</p>
					<ul className="divide-y rounded-lg border">
						{items.map((item) => {
							const Icon = item.name.toLowerCase().endsWith(".pdf") ? FileText : FileArchive;
							return (
								<li key={item.id} className="grid gap-2 p-3">
									<div className="flex items-center gap-3">
										<Icon className="text-muted-foreground size-5 shrink-0" />
										<span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
										<span className="text-muted-foreground shrink-0 text-sm tabular-nums">{formatBytes(item.size)}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											aria-label={`Remove ${item.name}`}
											onClick={() => setItems((list) => list.filter((i) => i.id !== item.id))}
										>
											<Trash2 className="text-destructive size-4" />
										</Button>
									</div>
									{item.error ? (
										<p className="text-destructive flex items-center gap-1.5 text-xs">
											<CircleAlert className="size-3.5" />
											{item.error}
										</p>
									) : !item.uploaded ? (
										<span className="bg-muted h-1.5 overflow-hidden rounded-full">
											<span className="bg-primary block h-full transition-[width]" style={{ width: `${item.progress}%` }} />
										</span>
									) : null}
								</li>
							);
						})}
					</ul>
				</div>
			)}

			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" variant="outline" disabled={saving}>
						Cancel
					</Button>
				</DialogClose>
				<Button type="button" onClick={save} disabled={saving || uploading || ready.length === 0 || !target}>
					{(saving || uploading) && <Loader className="size-4 animate-spin" />}
					{uploading ? "Uploading…" : "Save"}
				</Button>
			</DialogFooter>
		</div>
	);
}
