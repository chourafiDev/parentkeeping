import { BUY_LABELS } from "@/lib/catalog";
import { formatStorePrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { HomeProduct } from "./types";

/** Buy button = plain form POST to Stripe Checkout (no JavaScript needed); unsellable → disabled. */
export function BuyForm({
	product,
	className,
	label,
}: {
	product: HomeProduct;
	className: string;
	label?: string;
}) {
	if (!product.sellable) {
		return (
			<button type="button" disabled className={cn(className, "cursor-not-allowed opacity-50")}>
				Coming soon
			</button>
		);
	}
	return (
		<form action="/api/checkout" method="post" className="contents">
			<input type="hidden" name="slug" value={product.slug} />
			<button type="submit" className={className}>
				{label ?? BUY_LABELS[product.slug] ?? `Buy now · ${formatStorePrice(product.price)}`}
			</button>
		</form>
	);
}
