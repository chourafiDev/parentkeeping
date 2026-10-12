"use client";

import { format } from "date-fns";
import {
	ChevronDown,
	EllipsisVertical,
	ExternalLink,
	FileText,
	Library,
	Link2Off,
	Pencil,
	Plus,
	Rocket,
	Sheet,
	Trash2,
	Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-client";
import { assetStatus, formatBytes, hasAssetContent } from "@/lib/assets";
import { cn } from "@/lib/utils";
import type { LibraryAsset, ProductAsset, ProductOption } from "@/server/queries/products";
import { ConfirmDialog } from "../../_components/shared/confirm-dialog";
import { FormCard } from "../../_components/shared/form-card";
import { AssetDialog, type EditedAsset } from "./asset-dialog";
import { AttachAssetsDialog } from "./attach-assets-dialog";

const toDateInput = (d: Date | string | null) => (d ? format(new Date(d), "yyyy-MM-dd") : null);

function StatusBadge({ asset }: { asset: ProductAsset }) {
	const status = assetStatus(asset);
	if (status === "ready") {
		return (
			<Badge variant="outline" className="border-transparent bg-[color-mix(in_oklab,var(--success)_14%,white)] text-[color-mix(in_oklab,var(--success)_70%,black)]">
				Ready
			</Badge>
		);
	}
	if (status === "presale") {
		return (
			<Badge variant="outline" className="border-transparent bg-amber-50 text-amber-800">
				Arrives by {format(new Date(asset.availableAt!), "MMM d")}
			</Badge>
		);
	}
	return <Badge variant="destructive">Missing file</Badge>;
}

type Pending =
	| { type: "release"; asset: ProductAsset; owners: number | null }
	| { type: "detach"; asset: ProductAsset }
	| { type: "delete"; asset: ProductAsset };

/**
 * The product's deliverables, like Shopify Digital Products: each asset shows
 * its status (ready / pre-sale / missing) and downloads; add new files, attach
 * existing ones, release pre-sale parts to buyers.
 */
export function AssetsCard({
	productId,
	productTitle,
	assets,
	library,
	products,
	sales,
	canUpdate,
	canDelete,
}: {
	productId: string;
	productTitle: string;
	assets: ProductAsset[];
	library: LibraryAsset[];
	products: ProductOption[];
	sales: number;
	canUpdate: boolean;
	canDelete: boolean;
}) {
	const router = useRouter();
	const [creating, setCreating] = useState(false);
	const [attaching, setAttaching] = useState(false);
	const [editing, setEditing] = useState<EditedAsset | undefined>();
	const [pending, setPending] = useState<Pending | null>(null);

	const attachable = library.filter((a) => !assets.some((x) => x.id === a.id));

	const edit = (a: ProductAsset) =>
		setEditing({
			id: a.id,
			label: a.label,
			kind: a.kind,
			file:
				a.kind === "pdf" && a.storageKey
					? { storageKey: a.storageKey, fileName: a.fileName ?? "file.pdf", contentType: "application/pdf", sizeBytes: a.sizeBytes ?? 1 }
					: null,
			url: a.url ?? "",
			availableAt: toDateInput(a.availableAt),
			productIds: library.find((l) => l.id === a.id)?.products.map((p) => p.id) ?? [productId],
		});

	async function askRelease(asset: ProductAsset) {
		setPending({ type: "release", asset, owners: null });
		const res = await api.api.admin.assets[":id"].owners.$get({ param: { id: asset.id } });
		const owners = res.ok ? (await res.json()).count : null;
		setPending((p) => (p?.type === "release" && p.asset.id === asset.id ? { ...p, owners } : p));
	}

	async function run(action: () => Promise<Response>, success: string) {
		const res = await action();
		const body = (await res.json().catch(() => null)) as { error?: string } | null;
		if (!res.ok) {
			toast.error(body?.error ?? "Something went wrong");
			return false;
		}
		toast.success(success);
		router.refresh();
		return true;
	}

	const addMenu = canUpdate && (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="outline" size="sm">
					<Plus />
					Add asset
					<ChevronDown className="text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuItem onSelect={() => setCreating(true)}>
					<Upload />
					Upload new file or link
				</DropdownMenuItem>
				<DropdownMenuItem disabled={attachable.length === 0} onSelect={() => setAttaching(true)}>
					<Library />
					Select existing ({attachable.length})
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<FormCard title={`Assets · ${assets.length}`} action={addMenu}>
			{assets.length === 0 ? (
				<div className="text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-sm">
					<FileText className="size-5" />
					<p>No files yet. Buyers of this product get nothing until you add one.</p>
					{canUpdate && (
						<Button type="button" size="sm" onClick={() => setCreating(true)}>
							<Upload />
							Add asset
						</Button>
					)}
				</div>
			) : (
				<ul className="divide-y rounded-lg border">
					{assets.map((a) => {
						const status = assetStatus(a);
						const Icon = a.kind === "pdf" ? FileText : Sheet;
						const meta = [
							a.kind === "pdf" ? (a.fileName ?? "No file uploaded") : a.url ? "Google Sheet copy link" : "No link yet",
							a.kind === "pdf" ? formatBytes(a.sizeBytes) : null,
							a.uploadedAt ? `updated ${format(new Date(a.uploadedAt), "MMM d, yyyy")}` : null,
							status === "presale" && hasAssetContent(a) ? "uploaded, not released" : null,
							`${a.downloads} download${a.downloads === 1 ? "" : "s"}`,
						].filter(Boolean);
						return (
							<li key={a.id} className="flex items-center gap-3 p-3">
								<span
									className={cn(
										"flex size-9 shrink-0 items-center justify-center rounded-md",
										status === "missing" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
									)}
								>
									<Icon className="size-4" />
								</span>
								<div className="grid min-w-0 flex-1 gap-0.5">
									<div className="flex flex-wrap items-center gap-2">
										<span className="truncate text-sm font-medium">{a.label}</span>
										<StatusBadge asset={a} />
									</div>
									<span className="text-muted-foreground text-xs [overflow-wrap:anywhere]">{meta.join(" · ")}</span>
									{a.alsoIn.length > 0 && (
										<span className="text-muted-foreground truncate text-xs">Also in: {a.alsoIn.join(", ")}</span>
									)}
								</div>
								{status === "presale" && hasAssetContent(a) && canUpdate && (
									<Button type="button" size="sm" onClick={() => void askRelease(a)}>
										<Rocket />
										Release
									</Button>
								)}
								{/* Non-modal: a modal menu hands focus back to its trigger on close, which
								    the dialog opened from it reads as "focus outside" and closes at once. */}
								<DropdownMenu modal={false}>
									<DropdownMenuTrigger asChild>
										<Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions: ${a.label}`}>
											<EllipsisVertical className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										{hasAssetContent(a) && (
											<DropdownMenuItem asChild>
												<a href={`/api/admin/assets/${a.id}/preview`} target="_blank" rel="noreferrer">
													<ExternalLink />
													{a.kind === "pdf" ? "Download" : "Open sheet"}
												</a>
											</DropdownMenuItem>
										)}
										{canUpdate && (
											<>
												<DropdownMenuItem onSelect={() => edit(a)}>
													<Pencil />
													Edit or replace file
												</DropdownMenuItem>
												{status === "presale" && hasAssetContent(a) && (
													<DropdownMenuItem onSelect={() => void askRelease(a)}>
														<Rocket />
														Release and notify buyers
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem onSelect={() => setPending({ type: "detach", asset: a })}>
													<Link2Off />
													Remove from this product
												</DropdownMenuItem>
											</>
										)}
										{canDelete && (
											<DropdownMenuItem variant="destructive" onSelect={() => setPending({ type: "delete", asset: a })}>
												<Trash2 />
												Delete asset
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</li>
						);
					})}
				</ul>
			)}

			<AssetDialog open={creating} onOpenChange={setCreating} products={products} defaultProductIds={[productId]} />
			<AssetDialog open={!!editing} onOpenChange={(o) => !o && setEditing(undefined)} products={products} asset={editing} />
			<AttachAssetsDialog open={attaching} onOpenChange={setAttaching} productId={productId} assets={attachable} />

			<ConfirmDialog
				open={pending?.type === "release"}
				onOpenChange={(o) => !o && setPending(null)}
				title={`Release “${pending?.asset.label}”?`}
				description={
					pending?.type === "release" ? (
						<p>
							The “Arrives by” date is cleared and buyers can download it right away.{" "}
							{pending.asset.readyNotifiedAt
								? "Buyers were already emailed about it, so no email goes out."
								: pending.owners === null
									? "Counting buyers…"
									: pending.owners === 0
										? "Nobody has bought it yet, so no email goes out."
										: `${pending.owners === 1 ? "1 buyer gets" : `${pending.owners} buyers get`} a “Your ${pending.asset.label} is ready” email with a link to their downloads.`}
						</p>
					) : null
				}
				confirmLabel="Release"
				onConfirm={async () => {
					if (pending?.type !== "release") return true;
					const res = await api.api.admin.assets[":id"].release.$post({ param: { id: pending.asset.id } });
					const body = (await res.json().catch(() => null)) as { error?: string; notified?: number; failed?: number } | null;
					if (!res.ok) {
						toast.error(body?.error ?? "Couldn't release the asset");
						return false;
					}
					toast.success(
						body?.notified ? `Released · ${body.notified} buyer${body.notified === 1 ? "" : "s"} emailed` : "Released",
					);
					if (body?.failed) toast.error(`${body.failed} email${body.failed === 1 ? "" : "s"} failed. See the orders' history.`);
					router.refresh();
					return true;
				}}
			/>
			<ConfirmDialog
				open={pending?.type === "detach"}
				onOpenChange={(o) => !o && setPending(null)}
				title={`Remove “${pending?.asset.label}” from ${productTitle}?`}
				description={
					sales > 0
						? `It disappears from the downloads page of this product's ${sales} buyer${sales === 1 ? "" : "s"}. The asset stays in your library.`
						: "The asset stays in your library; you can attach it again later."
				}
				confirmLabel="Remove"
				destructive={sales > 0}
				onConfirm={() =>
					pending?.type === "detach"
						? run(
								() => api.api.admin.products[":id"].assets[":fileId"].$delete({ param: { id: productId, fileId: pending.asset.id } }),
								"Asset removed from this product",
							)
						: Promise.resolve(true)
				}
			/>
			<ConfirmDialog
				open={pending?.type === "delete"}
				onOpenChange={(o) => !o && setPending(null)}
				title={`Delete “${pending?.asset.label}”?`}
				description="The file is deleted from storage and removed from every product. This can't be undone. Assets that buyers already own can't be deleted: replace the file instead."
				confirmLabel="Delete"
				destructive
				onConfirm={() =>
					pending?.type === "delete"
						? run(() => api.api.admin.assets[":id"].$delete({ param: { id: pending.asset.id } }), "Asset deleted")
						: Promise.resolve(true)
				}
			/>
		</FormCard>
	);
}
