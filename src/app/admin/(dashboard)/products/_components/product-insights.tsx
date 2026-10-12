import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatUsd } from "@/lib/money";
import type { ProductDetail } from "@/server/queries/products";
import { FormCard } from "../../_components/shared/form-card";

/** Sales, revenue and downloads for one product (sidebar). */
export function ProductStatsCard({ product, canSeeRevenue }: { product: ProductDetail["product"]; canSeeRevenue: boolean }) {
	const stats = [
		{ label: "Sales", value: product.sales.toLocaleString("en-US") },
		...(canSeeRevenue ? [{ label: "Revenue", value: formatUsd(product.revenue) }] : []),
		{ label: "Downloads", value: product.downloads.toLocaleString("en-US") },
	];
	return (
		<FormCard title="Performance" contentClassName="grid gap-2">
			{stats.map((s) => (
				<div key={s.label} className="bg-muted/70 flex items-baseline justify-between rounded-lg px-3 py-2.5">
					<span className="text-muted-foreground text-sm">{s.label}</span>
					<span className="text-lg font-medium tabular-nums">{s.value}</span>
				</div>
			))}
			<p className="text-muted-foreground text-xs">All time, paid orders only. Revenue is before tax.</p>
		</FormCard>
	);
}

const ORDER_STATUS: Record<ProductDetail["recentOrders"][number]["status"], { label: string; className: string }> = {
	paid: { label: "Paid", className: "border-transparent bg-[color-mix(in_oklab,var(--success)_14%,white)] text-[color-mix(in_oklab,var(--success)_70%,black)]" },
	refunded: { label: "Refunded", className: "text-muted-foreground" },
	flagged_non_us: { label: "Non-US", className: "border-transparent bg-amber-50 text-amber-800" },
};

/** Latest orders that include the product. */
export function RecentOrdersCard({ orders }: { orders: ProductDetail["recentOrders"] }) {
	return (
		<FormCard title="Recent orders">
			{orders.length === 0 ? (
				<p className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
					No orders yet. They appear here once Stripe Checkout is live.
				</p>
			) : (
				<ul className="divide-y rounded-lg border text-sm">
					{orders.map((o) => (
						<li key={`${o.id}-${o.isBump}`} className="flex items-center gap-3 p-3">
							<span className="font-medium tabular-nums">#{o.orderNumber}</span>
							<span className="text-muted-foreground min-w-0 flex-1 truncate">{o.email}</span>
							{o.isBump && <Badge variant="secondary">Bump</Badge>}
							<Badge variant="outline" className={ORDER_STATUS[o.status].className}>
								{ORDER_STATUS[o.status].label}
							</Badge>
							<span className="tabular-nums">{formatPrice(o.amount)}</span>
							<span className="text-muted-foreground hidden w-24 text-end sm:inline">{format(new Date(o.paidAt), "MMM d, yyyy")}</span>
						</li>
					))}
				</ul>
			)}
		</FormCard>
	);
}
