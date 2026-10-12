import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/orders";
import type { ProductDetail } from "@/server/queries/products";
import { FormCard } from "../../_components/shared/form-card";

/** Shopify sidebar "Sales past 90 days". */
export function SalesCard({ last90, canSeeRevenue }: { last90: ProductDetail["last90"]; canSeeRevenue: boolean }) {
	return (
		<FormCard title="Sales past 90 days" contentClassName="grid gap-2 text-sm">
			<ul className="grid list-disc gap-1 ps-5">
				<li>
					{last90.units} unit{last90.units === 1 ? "" : "s"} sold
				</li>
				<li>
					{last90.buyers} buyer{last90.buyers === 1 ? "" : "s"}
				</li>
				{canSeeRevenue && <li>{formatPrice(last90.net)} in net sales</li>}
			</ul>
			<Link href="/admin/orders" className="text-primary justify-self-start text-sm font-medium hover:underline">
				View orders
			</Link>
		</FormCard>
	);
}

/** Latest orders that include the product. */
export function RecentOrdersCard({ orders }: { orders: ProductDetail["recentOrders"] }) {
	return (
		<FormCard title="Recent orders">
			{orders.length === 0 ? (
				<p className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">No orders yet.</p>
			) : (
				<ul className="divide-y rounded-lg border text-sm">
					{orders.map((o) => (
						<li key={`${o.id}-${o.isBump}`}>
							<Link href={`/admin/orders/${o.id}`} className="hover:bg-muted/60 flex items-center gap-3 p-3">
								<span className="font-medium tabular-nums">#{o.orderNumber}</span>
								<span className="text-muted-foreground min-w-0 flex-1 truncate">{o.email}</span>
								{o.isBump && <Badge variant="secondary">Bump</Badge>}
								<Badge variant="outline" className={ORDER_STATUS_TONES[o.status]}>
									{ORDER_STATUS_LABELS[o.status]}
								</Badge>
								<span className="tabular-nums">{formatPrice(o.amount)}</span>
								<span className="text-muted-foreground hidden w-24 text-end sm:inline">{format(new Date(o.paidAt), "MMM d, yyyy")}</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</FormCard>
	);
}
