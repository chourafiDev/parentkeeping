"use client";

import { FileText, Loader, Sheet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { api } from "@/lib/api-client";
import { formatBytes } from "@/lib/assets";
import type { LibraryAsset } from "@/server/queries/products";

/** "Select existing": attach assets from the library to this product. */
export function AttachAssetsDialog({
	open,
	onOpenChange,
	productId,
	assets,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	productId: string;
	assets: LibraryAsset[];
}) {
	const router = useRouter();
	const [selected, setSelected] = useState<string[]>([]);
	const [saving, setSaving] = useState(false);

	async function attach() {
		setSaving(true);
		const res = await api.api.admin.products[":id"].assets.$post({ param: { id: productId }, json: { fileIds: selected } });
		setSaving(false);
		if (!res.ok) {
			toast.error("Couldn't attach the assets");
			return;
		}
		toast.success(`${selected.length} asset${selected.length === 1 ? "" : "s"} attached`);
		setSelected([]);
		onOpenChange(false);
		router.refresh();
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (saving) return;
				if (!o) setSelected([]);
				onOpenChange(o);
			}}
		>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>Select existing assets</DialogTitle>
					<DialogDescription>The same file is shared: replacing it later updates every product that uses it.</DialogDescription>
				</DialogHeader>
				<div className="grid max-h-80 gap-1 overflow-y-auto rounded-lg border p-1">
					{assets.map((a) => {
						const Icon = a.kind === "pdf" ? FileText : Sheet;
						return (
							<label key={a.id} className="hover:bg-muted flex items-center gap-3 rounded-md px-2 py-2 text-sm">
								<Checkbox
									checked={selected.includes(a.id)}
									onCheckedChange={(on) => setSelected((s) => (on ? [...s, a.id] : s.filter((id) => id !== a.id)))}
								/>
								<Icon className="text-primary size-4 shrink-0" />
								<span className="grid min-w-0 flex-1">
									<span className="truncate font-medium">{a.label}</span>
									<span className="text-muted-foreground truncate text-xs">
										{[a.fileName, formatBytes(a.sizeBytes), a.products.length ? `in ${a.products.map((p) => p.title).join(", ")}` : "not attached"]
											.filter(Boolean)
											.join(" · ")}
									</span>
								</span>
							</label>
						);
					})}
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline" disabled={saving}>
							Cancel
						</Button>
					</DialogClose>
					<Button type="button" onClick={attach} disabled={saving || selected.length === 0}>
						{saving && <Loader className="size-4 animate-spin" />}
						Attach{selected.length ? ` ${selected.length}` : ""}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
