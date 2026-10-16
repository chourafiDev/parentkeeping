"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { formatPrice } from "@/lib/money";
import { formatOrderNumber, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/orders";
import { cn } from "@/lib/utils";
import type { OrderListRow } from "@/server/queries/orders";
import { useListTransition } from "../../_components/shared/list-transition";
import { ORDER_TABS, ordersSearchParams } from "../_lib/search-params";

const TAB_LABELS: Record<(typeof ORDER_TABS)[number], string> = {
	all: "All",
	paid: "Paid",
	refunded: "Refunded",
	flagged_non_us: "Blocked",
};

/** Orders table: status tabs, search by email/name/#number, 25 per page. */
export function OrdersList({
	rows,
	counts,
	pageCount,
	total,
}: {
	rows: OrderListRow[];
	counts: Record<(typeof ORDER_TABS)[number], number>;
	pageCount: number;
	total: number;
}) {
	const { isPending, startTransition } = useListTransition();
	const [params, setParams] = useQueryStates(ordersSearchParams, { shallow: false, startTransition });
	const [search, setSearch] = useState(params.q);
	const [lastQ, setLastQ] = useState(params.q);
	const debouncedSearch = useDebouncedCallback((q: string) => setParams({ q: q || null, page: null }), 300);

	// Back/forward navigation changes the URL: keep the box in sync.
	if (params.q !== lastQ) {
		setLastQ(params.q);
		if (params.q !== search.trim()) setSearch(params.q);
	}

	const page = Math.min(Math.max(1, params.page), pageCount);

	return (
		<div className="bg-card rounded-xl border p-3">
			<Tabs value={params.status} onValueChange={(v) => setParams({ status: v as typeof params.status, page: null })}>
				<TabsList className="max-w-full overflow-x-auto">
					{ORDER_TABS.map((t) => (
						<TabsTrigger key={t} value={t}>
							{TAB_LABELS[t]}
							<span className="text-muted-foreground tabular-nums">{counts[t]}</span>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<InputGroup className="mt-3">
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
				<InputGroupInput
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						debouncedSearch(e.target.value.trim());
					}}
					placeholder="Search by email, name or #order"
					aria-label="Search orders"
				/>
			</InputGroup>

			<div className={cn("mt-3 overflow-x-auto rounded-lg border", isPending && "opacity-60 transition-opacity")}>
				<Table>
					<TableHeader className="bg-muted/70">
						<TableRow>
							<TableHead className="ps-3">Order</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead className="hidden xl:table-cell">Items</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-end">Total</TableHead>
							<TableHead className="hidden pe-3 text-end lg:table-cell">Downloads</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-muted-foreground h-28 text-center">
									{params.q
										? "No orders match your search."
										: counts.all === 0
											? "No orders yet. Paid Stripe checkouts appear here."
											: `No ${TAB_LABELS[params.status].toLowerCase()} orders.`}
								</TableCell>
							</TableRow>
						) : (
							rows.map((row) => (
								<TableRow key={row.id} className="relative">
									<TableCell className="ps-3">
										<Link href={`/admin/orders/${row.id}`} className="font-medium tabular-nums hover:underline">
											{formatOrderNumber(row.orderNumber)}
											<span className="absolute inset-0" aria-hidden />
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground whitespace-nowrap">
										{format(new Date(row.paidAt), "MMM d, h:mm a")}
									</TableCell>
									<TableCell>
										<div className="grid max-w-56">
											<span className="truncate">{row.name ?? row.email}</span>
											{row.name && <span className="text-muted-foreground truncate text-xs">{row.email}</span>}
										</div>
									</TableCell>
									<TableCell className="hidden max-w-72 xl:table-cell">
										<div className="flex items-center gap-1.5">
											<span className="truncate">{row.items}</span>
											{row.hasBump && <Badge variant="secondary">Bump</Badge>}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline" className={ORDER_STATUS_TONES[row.status]}>
											{ORDER_STATUS_LABELS[row.status]}
										</Badge>
									</TableCell>
									<TableCell className="text-end tabular-nums">
										<span className={cn(row.status === "refunded" && "text-muted-foreground line-through")}>
											{formatPrice(row.amountTotal)}
										</span>
									</TableCell>
									<TableCell className="hidden pe-3 text-end tabular-nums lg:table-cell">{row.downloads}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{pageCount > 1 && (
				<div className="mt-3 flex items-center justify-between gap-2 text-sm">
					<span className="text-muted-foreground">
						Page {page} of {pageCount} · {total} orders
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
		</div>
	);
}
