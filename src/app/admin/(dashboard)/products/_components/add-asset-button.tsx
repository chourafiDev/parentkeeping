"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ProductOption } from "@/server/queries/products";
import { AssetDialog } from "./asset-dialog";

/** "Add asset" in the list header: upload a file and pick its products. */
export function AddAssetButton({ products, assetCount }: { products: ProductOption[]; assetCount: number }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)} className="md:w-auto w-full">
				<Plus className="size-4" />
				Add asset
				<span className="text-muted-foreground tabular-nums">· {assetCount} in library</span>
			</Button>
			<AssetDialog open={open} onOpenChange={setOpen} products={products} />
		</>
	);
}
