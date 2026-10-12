import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { PRODUCT_DISCLAIMER_SHORT } from "@/lib/legal";
import { formatStorePrice } from "@/lib/money";
import { cn } from "@/lib/utils";

const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });

/**
 * Price, Buy button and the lines the spec puts around it. The Buy button is a
 * plain form POST to /api/checkout (works without JavaScript); prices on the
 * page are display copies, checkout always uses the Stripe prices.
 */
export function BuyBox({
	slug,
	price,
	foundingPrice,
	foundingEndsAt,
	badge,
	usVisitor,
	sellable,
	error,
	aboveButton,
	className,
}: {
	slug: string;
	price: number;
	/** Shown only while the founding window is open. */
	foundingPrice: number | null;
	foundingEndsAt: Date | null;
	badge?: string;
	usVisitor: boolean;
	sellable: boolean;
	error?: string | null;
	/** e.g. the Agreement's attorney line, which the spec wants above the button. */
	aboveButton?: React.ReactNode;
	className?: string;
}) {
	const founding = foundingPrice !== null && foundingEndsAt !== null;
	return (
		<div className={cn("bg-card grid gap-4 rounded-2xl border p-5 shadow-sm sm:p-6", className)}>
			<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
				<span className="text-4xl font-semibold tracking-tight tabular-nums">{formatStorePrice(founding ? foundingPrice : price)}</span>
				{founding && <span className="text-muted-foreground text-xl tabular-nums line-through">{formatStorePrice(price)}</span>}
				<span className="text-muted-foreground text-sm">Available to US customers</span>
			</div>
			{founding && (
				<p className="text-sm">
					<span className="font-medium">Founding price</span> until {fmtDay(foundingEndsAt)}. Then {formatStorePrice(price)}.
				</p>
			)}
			{badge && (
				<p className="bg-accent text-foreground justify-self-start rounded-full px-3 py-1 text-xs font-medium">{badge}</p>
			)}
			{aboveButton}
			{error && (
				<p role="alert" className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
					{error}
				</p>
			)}
			{!usVisitor ? (
				<div className="bg-muted/70 grid gap-1 rounded-lg p-3 text-sm">
					<p>Our paid products are available to US customers only for now.</p>
					<Link href={FREE_LIST_PATH} className="text-primary font-medium underline-offset-2 hover:underline">
						Join the list for the UK edition (and get the free Medication List)
					</Link>
				</div>
			) : sellable ? (
				<form action="/api/checkout" method="post">
					<input type="hidden" name="slug" value={slug} />
					<Button type="submit" size="lg" className="h-12 w-full text-base">
						Buy now · {formatStorePrice(founding ? foundingPrice : price)}
					</Button>
				</form>
			) : (
				<Button size="lg" className="h-12 w-full text-base" disabled>
					Coming soon
				</Button>
			)}
			<div className="text-muted-foreground grid gap-1 text-xs">
				<p>{PRODUCT_DISCLAIMER_SHORT}</p>
				<p className="flex items-center gap-1.5">
					<ShieldCheck className="text-primary size-3.5" />
					14-day “if it doesn&apos;t help” guarantee
				</p>
			</div>
		</div>
	);
}
