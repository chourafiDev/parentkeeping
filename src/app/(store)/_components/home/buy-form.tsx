import { buyGateCopy } from "@/lib/checkout-region";
import { BUY_LABELS } from "@/lib/catalog";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { formatStorePrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { HomeProduct } from "./types";

/**
 * Buy button = plain form POST to Stripe Checkout (no JavaScript needed).
 * A visitor Stripe can't check out yet (almost nobody once worldwide
 * selling is on) gets the free list instead; unsellable → disabled.
 */
export function BuyForm({
	product,
	canBuy,
	worldwideEnabled,
	className,
	label,
}: {
	product: HomeProduct;
	canBuy: boolean;
	worldwideEnabled: boolean;
	className: string;
	label?: string;
}) {
	if (!canBuy) {
		return (
			<a href={FREE_LIST_PATH} className={className}>
				{buyGateCopy(worldwideEnabled).cta}
			</a>
		);
	}
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
