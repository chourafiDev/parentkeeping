"use client";

import { format, parseISO } from "date-fns";
import {
	CalendarClock,
	ChevronDown,
	CloudDownload,
	Download,
	EllipsisVertical,
	FileArchive,
	FileText,
	Loader,
	Pencil,
	PlusCircle,
	RefreshCw,
	Rocket,
	Sheet,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { assetStatus, formatBytes, hasAssetContent } from "@/lib/assets";
import { ASSET_ACCEPT, uploadAsset } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ProductInput } from "@/lib/validations/product";
import type { ProductAsset } from "@/server/queries/products";
import { ConfirmDialog } from "../../_components/shared/confirm-dialog";
import { AddFilesDialog } from "./add-files-dialog";

const fmtDay = (d: Date | string) => format(new Date(d), "MMM d, yyyy");

type Pending =
	| { type: "release"; asset: ProductAsset; owners: number | null }
	| { type: "delete"; asset: ProductAsset };

/** "Fulfilled · Access limit" chips + settings (Shopify), bound to the product form. */
function DeliverySettings() {
	const { control } = useFormContext<ProductInput>();
	const [open, setOpen] = useState(false);
	return (
		<Controller
			control={control}
			name="downloadLimit"
			render={({ field, fieldState }) => (
				<div className="grid gap-3 border-t pt-3">
					<button type="button" onClick={() => setOpen((o) => !o)} className="flex flex-wrap items-center gap-2 text-start" aria-expanded={open}>
						<span className="bg-muted flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm whitespace-nowrap">
							<span className="text-muted-foreground">Fulfilled</span>
							<span className="bg-background rounded-md px-1.5 font-medium">Automatically</span>
						</span>
						<span className="bg-muted flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm whitespace-nowrap">
							<span className="text-muted-foreground">Access limit</span>
							<span className="bg-background rounded-md px-1.5 font-medium">
								{field.value === null ? "Unlimited" : `${field.value} downloads`}
							</span>
						</span>
						<ChevronDown className={cn("text-muted-foreground ms-auto size-4 transition-transform", open && "rotate-180")} />
					</button>
					{(open || fieldState.invalid) && (
						<div className="bg-muted/60 grid gap-3 rounded-lg p-3 text-sm">
							<p className="text-muted-foreground">
								Files are delivered automatically after payment: on the thank-you page and in the order email. The access limit
								is how many times a buyer can download each file.
							</p>
							<div className="flex flex-wrap items-center gap-4">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="access-limit"
										className="accent-primary size-4"
										checked={field.value === null}
										onChange={() => field.onChange(null)}
									/>
									Unlimited
								</label>
								<label className="flex items-center gap-2">
									<input
										type="radio"
										name="access-limit"
										className="accent-primary size-4"
										checked={field.value !== null}
										onChange={() => field.onChange(field.value ?? 20)}
									/>
									Limited to
								</label>
								<Input
									type="number"
									min={1}
									max={1000}
									aria-label="Downloads per file"
									className="h-8 w-20"
									disabled={field.value === null}
									value={field.value ?? 20}
									onChange={(e) => field.onChange(e.target.value === "" ? 1 : Number(e.target.value))}
								/>
								<span className="text-muted-foreground">downloads per file, per order</span>
							</div>
							{fieldState.error && <p className="text-destructive">{fieldState.error.message}</p>}
						</div>
					)}
				</div>
			)}
		/>
	);
}

/**
 * Shopify Digital Products card on the product page: the product's files
 * (usually one ZIP), add / replace / delete, delivery settings. Pre-sale
 * extra: an "arrives by" date per file, released with an email to buyers.
 */
export function AssetsCard({
	productId,
	assets,
	canUpdate,
	canDelete,
}: {
	/** Undefined on a new product: files come after the first save. */
	productId?: string;
	assets: ProductAsset[];
	canUpdate: boolean;
	canDelete: boolean;
}) {
	const router = useRouter();
	const [adding, setAdding] = useState(false);
	const [pending, setPending] = useState<Pending | null>(null);
	const [dating, setDating] = useState<ProductAsset | null>(null);
	const [renaming, setRenaming] = useState<ProductAsset | null>(null);
	const [replacing, setReplacing] = useState<{ asset: ProductAsset; progress: number } | null>(null);
	const replaceInput = useRef<HTMLInputElement>(null);
	const replaceTarget = useRef<ProductAsset | null>(null);

	async function call(res: Promise<Response>, success: string) {
		const r = await res;
		const body = (await r.json().catch(() => null)) as { error?: string } | null;
		if (!r.ok) {
			toast.error(body?.error ?? "Something went wrong");
			return false;
		}
		toast.success(success);
		router.refresh();
		return true;
	}

	async function replace(file: File | undefined) {
		const asset = replaceTarget.current;
		if (!file || !asset) return;
		setReplacing({ asset, progress: 0 });
		try {
			const uploaded = await uploadAsset(file, (progress) => setReplacing({ asset, progress }));
			await call(api.api.admin.assets[":id"].$patch({ param: { id: asset.id }, json: { file: uploaded } }), "File replaced");
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setReplacing(null);
		}
	}

	async function askRelease(asset: ProductAsset) {
		setPending({ type: "release", asset, owners: null });
		const res = await api.api.admin.assets[":id"].owners.$get({ param: { id: asset.id } });
		const owners = res.ok ? (await res.json()).count : null;
		setPending((p) => (p?.type === "release" && p.asset.id === asset.id ? { ...p, owners } : p));
	}

	return (
		<div className="bg-card grid gap-3 rounded-xl border p-3">
			<div className="flex items-center gap-2">
				<span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md">
					<CloudDownload className="size-3.5" />
				</span>
				<span className="text-sm font-semibold">Digital Products</span>
			</div>
			<p className="text-sm font-medium">Assets ({assets.length})</p>

			{!productId ? (
				<p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
					Save the product first, then add its files (one ZIP folder per product).
				</p>
			) : assets.length > 0 ? (
				<ul className="divide-y rounded-lg border">
					{assets.map((a) => {
						const status = assetStatus(a);
						const Icon = a.kind === "sheet_link" ? Sheet : a.kind === "pdf" ? FileText : FileArchive;
						const busy = replacing?.asset.id === a.id;
						return (
							<li key={a.id} className="flex items-start gap-3 p-3">
								<Icon className={cn("mt-0.5 size-5 shrink-0", status === "missing" ? "text-destructive" : "text-muted-foreground")} />
								<div className="grid min-w-0 flex-1 gap-0.5">
									<span className="text-sm font-medium [overflow-wrap:anywhere]">{a.label}</span>
									{a.fileName && a.fileName !== a.label && (
										<span className="text-muted-foreground text-xs [overflow-wrap:anywhere]">{a.fileName}</span>
									)}
									<span className="text-muted-foreground text-xs">
										{busy
											? `Uploading new version… ${replacing.progress}%`
											: [
													formatBytes(a.sizeBytes),
													a.uploadedAt ? fmtDay(a.uploadedAt) : null,
													`${a.downloads} download${a.downloads === 1 ? "" : "s"}`,
													a.readyNotifiedAt ? "buyers notified" : null,
												]
													.filter(Boolean)
													.join(" · ")}
									</span>
									{status === "presale" && (
										<Badge variant="outline" className="mt-1 border-transparent bg-amber-50 text-amber-800">
											<CalendarClock />
											Pre-sale · arrives by {fmtDay(a.availableAt!)}
										</Badge>
									)}
									{status === "missing" && (
										<Badge variant="destructive" className="mt-1">
											No file
										</Badge>
									)}
								</div>
								{status === "presale" && hasAssetContent(a) && canUpdate && (
									<Button type="button" size="sm" onClick={() => void askRelease(a)}>
										<Rocket />
										Release
									</Button>
								)}
								{hasAssetContent(a) && (
									<Button type="button" variant="ghost" size="icon-sm" asChild aria-label={`Download ${a.fileName ?? a.label}`}>
										<a href={`/api/admin/assets/${a.id}/preview`}>
											<Download className="size-4" />
										</a>
									</Button>
								)}
								{(canUpdate || canDelete) && (
									// Non-modal: a modal menu hands focus back to its trigger on close, which
									// the dialog opened from it reads as "focus outside" and closes at once.
									<DropdownMenu modal={false}>
										<DropdownMenuTrigger asChild>
											<Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions: ${a.fileName ?? a.label}`} disabled={busy}>
												{busy ? <Loader className="size-4 animate-spin" /> : <EllipsisVertical className="size-4" />}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-56">
											{canUpdate && (
												<>
													<DropdownMenuItem onSelect={() => setRenaming(a)}>
														<Pencil />
														Rename for buyers…
													</DropdownMenuItem>
													<DropdownMenuItem
														onSelect={() => {
															replaceTarget.current = a;
															replaceInput.current?.click();
														}}
													>
														<RefreshCw />
														Replace file
													</DropdownMenuItem>
													<DropdownMenuItem onSelect={() => setDating(a)}>
														<CalendarClock />
														{a.availableAt ? "Change arrival date" : "Set as pre-sale…"}
													</DropdownMenuItem>
													{status === "presale" && hasAssetContent(a) && (
														<DropdownMenuItem onSelect={() => void askRelease(a)}>
															<Rocket />
															Release and notify buyers
														</DropdownMenuItem>
													)}
												</>
											)}
											{canDelete && (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem variant="destructive" onSelect={() => setPending({ type: "delete", asset: a })}>
														<Trash2 />
														Delete
													</DropdownMenuItem>
												</>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</li>
						);
					})}
				</ul>
			) : null}

			{productId && canUpdate && (
				<button type="button" onClick={() => setAdding(true)} className="flex items-center gap-2 justify-self-start rounded-md px-1 py-1 text-sm font-medium hover:underline">
					<PlusCircle className="size-4" />
					Add asset
				</button>
			)}

			<DeliverySettings />

			<input
				ref={replaceInput}
				type="file"
				accept={ASSET_ACCEPT}
				hidden
				onChange={(e) => {
					void replace(e.target.files?.[0]);
					e.target.value = "";
				}}
			/>
			{productId && <AddFilesDialog open={adding} onOpenChange={setAdding} productId={productId} />}
			<PresaleDialog
				asset={dating}
				onClose={() => setDating(null)}
				onSave={(date) =>
					dating
						? call(
								api.api.admin.assets[":id"].$patch({ param: { id: dating.id }, json: { availableAt: date } }),
								date ? `Arrives by ${format(parseISO(date), "MMMM d")}` : "Pre-sale date removed",
							)
						: Promise.resolve(true)
				}
			/>

			<RenameDialog
				asset={renaming}
				onClose={() => setRenaming(null)}
				onSave={(label) =>
					renaming
						? call(api.api.admin.assets[":id"].$patch({ param: { id: renaming.id }, json: { label } }), "Name saved")
						: Promise.resolve(true)
				}
			/>
			<ConfirmDialog
				open={pending?.type === "release"}
				onOpenChange={(o) => !o && setPending(null)}
				title={`Release “${pending?.asset.fileName ?? pending?.asset.label}”?`}
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
										: `${pending.owners === 1 ? "1 buyer gets" : `${pending.owners} buyers get`} a “your file is ready” email with a link to their downloads.`}
						</p>
					) : null
				}
				confirmLabel="Release"
				onConfirm={async () => {
					if (pending?.type !== "release") return true;
					const res = await api.api.admin.assets[":id"].release.$post({ param: { id: pending.asset.id } });
					const body = (await res.json().catch(() => null)) as { error?: string; notified?: number; failed?: number } | null;
					if (!res.ok) {
						toast.error(body?.error ?? "Couldn't release the file");
						return false;
					}
					toast.success(body?.notified ? `Released · ${body.notified} buyer${body.notified === 1 ? "" : "s"} emailed` : "Released");
					if (body?.failed) toast.error(`${body.failed} email${body.failed === 1 ? "" : "s"} failed. See the orders' history.`);
					router.refresh();
					return true;
				}}
			/>
			<ConfirmDialog
				open={pending?.type === "delete"}
				onOpenChange={(o) => !o && setPending(null)}
				title={`Delete “${pending?.asset.fileName ?? pending?.asset.label}”?`}
				description="The file is deleted from storage. This can't be undone. Files that buyers already own can't be deleted: use “Replace file” to give them a new version instead."
				confirmLabel="Delete"
				destructive
				onConfirm={() =>
					pending?.type === "delete" ? call(api.api.admin.assets[":id"].$delete({ param: { id: pending.asset.id } }), "File deleted") : Promise.resolve(true)
				}
			/>
		</div>
	);
}

/** The name buyers see on their downloads page and in emails (the download's file name stays as uploaded). */
function RenameDialog({
	asset,
	onClose,
	onSave,
}: {
	asset: ProductAsset | null;
	onClose: () => void;
	onSave: (label: string) => Promise<boolean>;
}) {
	const [label, setLabel] = useState("");
	const [saving, setSaving] = useState(false);
	const [lastId, setLastId] = useState<string | null>(null);
	if ((asset?.id ?? null) !== lastId) {
		setLastId(asset?.id ?? null);
		setLabel(asset?.label ?? "");
	}
	const value = label.trim();

	return (
		<Dialog open={!!asset} onOpenChange={(o) => !o && onClose()}>
			<DialogContent>
				<form
					className="grid gap-4"
					onSubmit={async (e) => {
						e.preventDefault();
						if (!value || saving) return;
						setSaving(true);
						const ok = await onSave(value);
						setSaving(false);
						if (ok) onClose();
					}}
				>
					<DialogHeader>
						<DialogTitle>Rename for buyers</DialogTitle>
						<DialogDescription>
							Shown on the buyer&apos;s downloads page and in order emails. The file they download keeps its name
							{asset?.fileName ? ` (${asset.fileName})` : ""}.
						</DialogDescription>
					</DialogHeader>
					<Input
						aria-label="Name buyers see"
						value={label}
						maxLength={120}
						autoFocus
						onChange={(e) => setLabel(e.target.value)}
						placeholder="Medical Binder for an Elderly Parent (US Letter and A4 PDFs)"
					/>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" disabled={!value || value === asset?.label || saving}>
							{saving && <Loader className="animate-spin" />}
							Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/** Set, change or remove a file's pre-sale "arrives by" date. */
function PresaleDialog({
	asset,
	onClose,
	onSave,
}: {
	asset: ProductAsset | null;
	onClose: () => void;
	onSave: (date: string | null) => Promise<boolean>;
}) {
	const [date, setDate] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [lastId, setLastId] = useState<string | null>(null);
	// New asset opened: start from its current date.
	if ((asset?.id ?? null) !== lastId) {
		setLastId(asset?.id ?? null);
		setDate(asset?.availableAt ? format(new Date(asset.availableAt), "yyyy-MM-dd") : null);
	}

	const submit = async (value: string | null) => {
		setSaving(true);
		const ok = await onSave(value);
		setSaving(false);
		if (ok) onClose();
	};

	return (
		<Dialog open={!!asset} onOpenChange={(o) => !o && !saving && onClose()}>
			<DialogContent className="sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle>Pre-sale date</DialogTitle>
					<DialogDescription>
						Until it&apos;s released, buyers see “Arrives by [date]” instead of a download button. Release it from the file&apos;s
						menu when it&apos;s ready.
					</DialogDescription>
				</DialogHeader>
				<div className="flex justify-center rounded-lg border">
					<Calendar
						mode="single"
						selected={date ? parseISO(date) : undefined}
						onSelect={(d) => d && setDate(format(d, "yyyy-MM-dd"))}
						disabled={{ before: new Date() }}
					/>
				</div>
				<DialogFooter className="sm:justify-between">
					{asset?.availableAt ? (
						<Button type="button" variant="ghost" disabled={saving} onClick={() => void submit(null)}>
							Remove date
						</Button>
					) : (
						<span />
					)}
					<div className="flex gap-2">
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={saving}>
								Cancel
							</Button>
						</DialogClose>
						<Button type="button" disabled={saving || !date} onClick={() => void submit(date)}>
							{saving && <Loader className="size-4 animate-spin" />}
							Save
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
