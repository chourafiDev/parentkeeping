"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ProductOption } from "@/server/queries/products";
import { AddFilesDialog } from "./add-files-dialog";

/** "Add asset" in the list header (Shopify Digital Products): upload files, pick their product. */
export function AddAssetButton({ products }: { products: ProductOption[] }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)} className="md:w-auto w-full">
				<Plus className="size-4" />
				Add asset
			</Button>
			<AddFilesDialog open={open} onOpenChange={setOpen} products={products} />
		</>
	);
}
