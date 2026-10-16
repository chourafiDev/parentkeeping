"use client";

import { format } from "date-fns";
import { Loader, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { HIDE_REASONS } from "@/lib/validations/review";

type Review = {
	id: string;
	rating: number;
	headline: string;
	body: string;
	displayName: string;
	status: "pending" | "published" | "hidden";
	hiddenReason: string | null;
	createdAt: string;
	publishedAt: string | null;
	productTitle: string;
	orderId: string;
	orderNumber: number;
	orderStatus: "paid" | "refunded" | "flagged_non_us";
};

type Change = { status: "published" } | { status: "pending" } | { status: "hidden"; hiddenReason: keyof typeof HIDE_REASONS };

export function ReviewCardAdmin({ review: r, canEdit }: { review: Review; canEdit: boolean }) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);

	async function change(json: Change, done: string) {
		setBusy(true);
		const res = await api.api.admin.reviews[":id"].$patch({ param: { id: r.id }, json }).catch(() => null);
		setBusy(false);
		if (!res?.ok) return toast.error("Couldn't update the review");
		toast.success(done);
		router.refresh();
	}

	return (
		<li className="bg-card grid gap-3 rounded-xl border p-4">
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
				<span className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>
					{Array.from({ length: 5 }, (_, i) => (
						<Star key={i} className={cn("size-4", i < r.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
					))}
				</span>
				<span className="font-medium">{r.productTitle}</span>
				<span className="text-muted-foreground">
					{r.displayName} ·{" "}
					<Link href={`/admin/orders/${r.orderId}`} className="hover:text-foreground underline underline-offset-2">
						#{r.orderNumber}
					</Link>{" "}
					· {format(new Date(r.createdAt), "MMM d, yyyy")}
				</span>
				{r.orderStatus === "refunded" && <Badge variant="secondary">Refunded order</Badge>}
				{r.status === "hidden" && r.hiddenReason && (
					<Badge variant="outline">Hidden: {HIDE_REASONS[r.hiddenReason as keyof typeof HIDE_REASONS] ?? r.hiddenReason}</Badge>
				)}
			</div>
			<div className="grid gap-1">
				<p className="font-semibold">{r.headline}</p>
				<p className="text-muted-foreground text-sm whitespace-pre-line">{r.body}</p>
			</div>
			{canEdit && (
				<div className="flex flex-wrap items-center gap-2">
					{busy && <Loader className="text-primary size-4 animate-spin" />}
					{r.status !== "published" && (
						<Button size="sm" disabled={busy} onClick={() => change({ status: "published" }, "Published on the product page")}>
							Publish
						</Button>
					)}
					{r.status !== "hidden" && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="sm" variant="outline" disabled={busy}>
									Hide…
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-64">
								<DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Why? (never because it&apos;s negative)</DropdownMenuLabel>
								{Object.entries(HIDE_REASONS).map(([id, label]) => (
									<DropdownMenuItem key={id} onSelect={() => change({ status: "hidden", hiddenReason: id as keyof typeof HIDE_REASONS }, "Review hidden")}>
										{label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
					{r.status !== "pending" && (
						<Button size="sm" variant="ghost" disabled={busy} onClick={() => change({ status: "pending" }, "Moved back to “To review”")}>
							Move back
						</Button>
					)}
				</div>
			)}
		</li>
	);
}
