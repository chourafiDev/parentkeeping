"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Download, Loader, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { api } from "@/lib/api-client";
import { downloadResponse } from "@/lib/download";
import { countryName } from "@/lib/orders";
import { cn } from "@/lib/utils";
import type { SubscriberRow } from "@/server/queries/subscribers";
import { ConfirmDialog } from "../../_components/shared/confirm-dialog";
import { useListTransition } from "../../_components/shared/list-transition";
import { SUBSCRIBER_TABS, subscribersSearchParams } from "../_lib/search-params";
import { VARIANT_LABELS } from "../_lib/variants";

const TAB_LABELS: Record<(typeof SUBSCRIBER_TABS)[number], string> = {
	all: "All",
	newsletter: "Newsletter",
	file_only: "File only",
	unsubscribed: "Unsubscribed",
};

const ANY = "__any"; // Radix Select can't use "" as a value

/** "free-medication-list" → "Free medication list" */
const sourceLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");

function ConsentBadge({ row }: { row: SubscriberRow }) {
	if (row.unsubscribedAt) return <Badge variant="outline" className="text-muted-foreground">Unsubscribed</Badge>;
	return row.marketingConsent ? (
		<Badge variant="outline" className="border-transparent bg-[color-mix(in_oklab,var(--success)_14%,white)] text-[color-mix(in_oklab,var(--success)_70%,black)]">
			Newsletter
		</Badge>
	) : (
		<Badge variant="secondary">File only</Badge>
	);
}

/** Subscribers table with tabs, search, filters, CSV export and a details panel. */
export function SubscribersList({
	rows,
	counts,
	total,
	pageCount,
	facets,
	canExport,
	canDelete,
}: {
	rows: SubscriberRow[];
	counts: Record<(typeof SUBSCRIBER_TABS)[number], number>;
	total: number;
	pageCount: number;
	facets: { sources: string[]; countries: { code: string; count: number }[] };
	canExport: boolean;
	canDelete: boolean;
}) {
	const router = useRouter();
	const { isPending, startTransition } = useListTransition();
	const [params, setParams] = useQueryStates(subscribersSearchParams, { shallow: false, startTransition });
	const [search, setSearch] = useState(params.q);
	const [lastQ, setLastQ] = useState(params.q);
	const [selected, setSelected] = useState<SubscriberRow | null>(null);
	const [toDelete, setToDelete] = useState<SubscriberRow | null>(null);
	const [exporting, setExporting] = useState(false);
	const debouncedSearch = useDebouncedCallback((q: string) => setParams({ q: q || null, page: null }), 300);

	// Back/forward navigation changes the URL: keep the box in sync.
	if (params.q !== lastQ) {
		setLastQ(params.q);
		if (params.q !== search.trim()) setSearch(params.q);
	}

	const page = Math.min(Math.max(1, params.page), pageCount);
	const filtered = !!(params.q || params.source || params.country);

	async function exportCsv() {
		setExporting(true);
		const res = await api.api.admin.subscribers.export.$get({
			query: { status: params.status, q: params.q, source: params.source, country: params.country },
		});
		setExporting(false);
		if (!res.ok) {
			toast.error("Export failed");
			return;
		}
		await downloadResponse(res, "parentkeeping-subscribers.csv");
	}

	return (
		<div className="bg-card rounded-xl border p-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Tabs value={params.status} onValueChange={(v) => setParams({ status: v as typeof params.status, page: null })}>
					<TabsList className="max-w-full overflow-x-auto">
						{SUBSCRIBER_TABS.map((t) => (
							<TabsTrigger key={t} value={t}>
								{TAB_LABELS[t]}
								<span className="text-muted-foreground tabular-nums">{counts[t]}</span>
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
				{canExport && (
					<Button variant="outline" onClick={exportCsv} disabled={exporting || total === 0}>
						{exporting ? <Loader className="animate-spin" /> : <Download />}
						Export {total > 0 ? `${total} ` : ""}CSV
					</Button>
				)}
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-2">
				<InputGroup className="min-w-48 flex-1">
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							debouncedSearch(e.target.value.trim());
						}}
						placeholder="Search by email"
						aria-label="Search subscribers"
					/>
				</InputGroup>
				<Select
					value={params.source || ANY}
					onValueChange={(v) => setParams({ source: v === ANY ? null : v, page: null })}
				>
					<SelectTrigger aria-label="Source" className="w-auto min-w-36">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ANY}>All sources</SelectItem>
						{facets.sources.map((s) => (
							<SelectItem key={s} value={s}>
								{sourceLabel(s)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={params.country || ANY}
					onValueChange={(v) => setParams({ country: v === ANY ? null : v, page: null })}
				>
					<SelectTrigger aria-label="Country" className="w-auto min-w-36">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ANY}>All countries</SelectItem>
						{facets.countries.map((c) => (
							<SelectItem key={c.code} value={c.code}>
								{countryName(c.code)} · {c.count}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className={cn("mt-3 overflow-x-auto rounded-lg border", isPending && "opacity-60 transition-opacity")}>
				<Table>
					<TableHeader className="bg-muted/70">
						<TableRow>
							<TableHead className="ps-3">Email</TableHead>
							<TableHead>Emails</TableHead>
							<TableHead className="hidden md:table-cell">Country</TableHead>
							<TableHead className="hidden xl:table-cell">Source</TableHead>
							<TableHead className="hidden lg:table-cell">Headline</TableHead>
							<TableHead className="pe-3 text-end">Signed up</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-muted-foreground h-28 text-center">
									{filtered
										? "No subscribers match these filters."
										: counts.all === 0
											? "No sign-ups yet. They appear here when people request the free Medication List."
											: `No ${TAB_LABELS[params.status].toLowerCase()} subscribers.`}
								</TableCell>
							</TableRow>
						) : (
							rows.map((row) => (
								<TableRow
									key={row.id}
									className="cursor-pointer"
									onClick={() => setSelected(row)}
								>
									<TableCell className="ps-3">
										<button
											type="button"
											className="max-w-64 truncate text-start font-medium hover:underline"
											onClick={(e) => {
												e.stopPropagation();
												setSelected(row);
											}}
										>
											{row.email}
										</button>
									</TableCell>
									<TableCell>
										<ConsentBadge row={row} />
									</TableCell>
									<TableCell className="hidden md:table-cell">{row.country ?? "—"}</TableCell>
									<TableCell className="text-muted-foreground hidden xl:table-cell">{sourceLabel(row.source)}</TableCell>
									<TableCell className="text-muted-foreground hidden lg:table-cell">
										{row.testVariant ? (VARIANT_LABELS[row.testVariant] ?? row.testVariant) : "—"}
									</TableCell>
									<TableCell className="text-muted-foreground pe-3 text-end whitespace-nowrap">
										{format(new Date(row.createdAt), "MMM d, yyyy")}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{pageCount > 1 && (
				<div className="mt-3 flex items-center justify-between gap-2 text-sm">
					<span className="text-muted-foreground">
						Page {page} of {pageCount} · {total.toLocaleString("en-US")} subscribers
					</span>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="icon-sm"
							aria-label="Previous page"
							disabled={page <= 1}
							onClick={() => setParams({ page: page - 1 === 1 ? null : page - 1 })}
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="icon-sm"
							aria-label="Next page"
							disabled={page >= pageCount}
							onClick={() => setParams({ page: page + 1 })}
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			)}

			<Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
				<SheetContent className="w-full overflow-y-auto sm:max-w-md">
					{selected && (
						<>
							<SheetHeader>
								<SheetTitle className="[overflow-wrap:anywhere]">{selected.email}</SheetTitle>
								<SheetDescription>
									Signed up {format(new Date(selected.createdAt), "MMMM d, yyyy 'at' h:mm a")}
								</SheetDescription>
							</SheetHeader>
							<div className="grid gap-4 px-4 pb-4 text-sm">
								<div>
									<ConsentBadge row={selected} />
								</div>
								<dl className="bg-muted/70 grid gap-2 rounded-lg p-3">
									{(
										[
											["Source", sourceLabel(selected.source)],
											["Country", countryName(selected.country)],
											["Headline variant", selected.testVariant ? (VARIANT_LABELS[selected.testVariant] ?? selected.testVariant) : "—"],
											["Sent to email tool", selected.emailToolSyncedAt ? format(new Date(selected.emailToolSyncedAt), "MMM d, yyyy h:mm a") : "Not yet"],
											...(selected.unsubscribedAt
												? [["Unsubscribed", format(new Date(selected.unsubscribedAt), "MMM d, yyyy")]]
												: []),
										] as [string, string][]
									).map(([label, value]) => (
										<div key={label} className="flex justify-between gap-4">
											<dt className="text-muted-foreground">{label}</dt>
											<dd className="text-end">{value}</dd>
										</div>
									))}
								</dl>
								<div className="grid gap-1.5">
									<h3 className="font-medium">Consent record</h3>
									<p className="text-muted-foreground text-xs">
										The exact text shown when they signed up, and when they agreed. Keep it as proof of consent.
									</p>
									<blockquote className="rounded-lg border p-3 whitespace-pre-wrap">{selected.consentText}</blockquote>
									<p className="text-muted-foreground text-xs">
										{selected.marketingConsent ? "Agreed to the weekly emails" : "File only, no newsletter"} ·{" "}
										{format(new Date(selected.consentAt), "MMM d, yyyy 'at' h:mm:ss a")}
									</p>
								</div>
								{canDelete && (
									<Button variant="destructive" className="justify-self-start" onClick={() => setToDelete(selected)}>
										<Trash2 />
										Delete subscriber
									</Button>
								)}
							</div>
						</>
					)}
				</SheetContent>
			</Sheet>

			<ConfirmDialog
				open={!!toDelete}
				onOpenChange={(o) => !o && setToDelete(null)}
				title={`Delete ${toDelete?.email ?? "subscriber"}?`}
				description="Use this for a privacy deletion request. The subscriber and their consent record are removed here for good. Delete them from your email tool too, which keeps its own copy."
				confirmLabel="Delete"
				destructive
				onConfirm={async () => {
					if (!toDelete) return true;
					const res = await api.api.admin.subscribers[":id"].$delete({ param: { id: toDelete.id } });
					if (!res.ok) {
						toast.error("Couldn't delete the subscriber");
						return false;
					}
					toast.success("Subscriber deleted");
					setSelected(null);
					router.refresh();
					return true;
				}}
			/>
		</div>
	);
}
