"use client";

import { ArrowDownUp, ImageIcon, Search } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import { PRODUCT_STATUS_LABELS } from "@/lib/validations/product";
import type { ProductListRow } from "@/server/queries/products";
import { useListTransition } from "../../_components/shared/list-transition";
import { PRODUCT_SORTS, PRODUCT_TABS, productsSearchParams } from "../_lib/search-params";

const TAB_LABELS: Record<(typeof PRODUCT_TABS)[number], string> = {
	active: "Active",
	draft: "Draft",
	archived: "Archived",
	all: "All",
};

const SORT_LABELS: Record<(typeof PRODUCT_SORTS)[number], string> = {
	sales: "Most sales",
	downloads: "Most downloads",
	title: "Title A–Z",
	created: "Newest",
};

export const STATUS_STYLES: Record<ProductListRow["status"], string> = {
	active: "border-transparent bg-[color-mix(in_oklab,var(--success)_14%,white)] text-[color-mix(in_oklab,var(--success)_70%,black)]",
	draft: "border-transparent bg-secondary text-secondary-foreground",
	archived: "text-muted-foreground",
};

/** Products table, Shopify Digital Products style: status tabs, search, sort. */
export function ProductsList({
	rows,
	counts,
}: {
	rows: ProductListRow[];
	counts: Record<(typeof PRODUCT_TABS)[number], number>;
}) {
	const { isPending, startTransition } = useListTransition();
	const [params, setParams] = useQueryStates(productsSearchParams, { shallow: false, startTransition });
	const [search, setSearch] = useState(params.q);
	const [lastQ, setLastQ] = useState(params.q);
	const debouncedSearch = useDebouncedCallback((q: string) => setParams({ q: q || null }), 300);

	// Back/forward navigation changes the URL: keep the box in sync.
	if (params.q !== lastQ) {
		setLastQ(params.q);
		if (params.q !== search.trim()) setSearch(params.q);
	}

	return (
		<div className="bg-card rounded-xl border p-3">
			<Tabs value={params.status} onValueChange={(v) => setParams({ status: v as typeof params.status })}>
				<TabsList>
					{PRODUCT_TABS.map((t) => (
						<TabsTrigger key={t} value={t}>
							{TAB_LABELS[t]}
							<span className="text-muted-foreground tabular-nums">{counts[t]}</span>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<div className="mt-3 flex items-center gap-2">
				<InputGroup className="flex-1">
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							debouncedSearch(e.target.value.trim());
						}}
						placeholder="Filter products"
						aria-label="Filter products"
					/>
				</InputGroup>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline">
							<ArrowDownUp />
							<span className="hidden sm:inline">Sort</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Sort by</DropdownMenuLabel>
						<DropdownMenuRadioGroup
							value={params.sort}
							onValueChange={(v) => setParams({ sort: v as typeof params.sort })}
						>
							{PRODUCT_SORTS.map((s) => (
								<DropdownMenuRadioItem key={s} value={s}>
									{SORT_LABELS[s]}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className={cn("mt-3 overflow-x-auto rounded-lg border", isPending && "opacity-60 transition-opacity")}>
				<Table>
					<TableHeader className="bg-muted/70">
						<TableRow>
							<TableHead className="ps-3">Product</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Assets</TableHead>
							<TableHead className="hidden text-end xl:table-cell">Price</TableHead>
							<TableHead className="text-end">Sales</TableHead>
							<TableHead className="pe-3 text-end">Downloads</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-muted-foreground h-24 text-center">
									{params.q ? "No products match your search." : `No ${TAB_LABELS[params.status].toLowerCase()} products.`}
								</TableCell>
							</TableRow>
						) : (
							rows.map((row) => (
								<TableRow key={row.id} className="relative">
									<TableCell className="ps-3">
										<Link href={`/admin/products/${row.id}`} className="group/title flex items-center gap-3">
											<span className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border">
												{row.imageUrl ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img src={row.imageUrl} alt="" className="size-full object-cover" />
												) : (
													<ImageIcon className="text-muted-foreground size-4" />
												)}
											</span>
											<span className="font-medium group-hover/title:underline">{row.title}</span>
											{/* Whole row is clickable, like Shopify. */}
											<span className="absolute inset-0" aria-hidden />
										</Link>
									</TableCell>
									<TableCell>
										<Badge variant="outline" className={STATUS_STYLES[row.status]}>
											{PRODUCT_STATUS_LABELS[row.status]}
										</Badge>
									</TableCell>
									<TableCell>
										<span className={cn(row.assets > 0 ? "text-primary font-medium" : "text-muted-foreground")}>
											{row.assets === 0 ? "No files" : `${row.assets} file${row.assets === 1 ? "" : "s"}`}
										</span>
									</TableCell>
									<TableCell className="hidden text-end tabular-nums xl:table-cell">
										{row.foundingPrice !== null ? (
											<span>
												{formatPrice(row.foundingPrice)}{" "}
												<span className="text-muted-foreground line-through">{formatPrice(row.price)}</span>
											</span>
										) : (
											formatPrice(row.price)
										)}
									</TableCell>
									<TableCell className="text-end tabular-nums">{row.sales}</TableCell>
									<TableCell className="pe-3 text-end tabular-nums">{row.downloads}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
