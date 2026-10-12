import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/money";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { getFoundingPrice, getSettings } from "@/server/queries/settings";

export const metadata: Metadata = { title: "Checkout test", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Development only: Buy buttons for every product, to try Stripe Checkout
 * (test mode) before the real product pages exist. 404 in production.
 */
export default async function CheckoutTestPage({ searchParams }: PageProps<"/dev/checkout">) {
	if (process.env.NODE_ENV === "production") notFound();
	const error = (await searchParams).checkout_error;
	const [rows, founding, { checkout }] = await Promise.all([
		db.select().from(products).orderBy(asc(products.sortOrder)),
		getFoundingPrice(),
		getSettings("checkout"),
	]);

	return (
		<main className="mx-auto grid w-full max-w-xl gap-4 px-4 py-12">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Checkout test</h1>
				<p className="text-muted-foreground text-sm">
					Development only. Use Stripe&apos;s test card 4242 4242 4242 4242, any future date, any CVC, and a US
					billing address. Founding price {founding.active ? "on" : "off"} · order bump {checkout.bumpEnabled ? "on" : "off"}.
				</p>
			</div>
			{typeof error === "string" && <p className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</p>}
			{rows
				.filter((p) => p.kind !== "bump")
				.map((p) => (
					// A plain form, exactly like the real Buy buttons will be.
					<form key={p.id} action="/api/checkout" method="post" className="bg-card flex items-center gap-3 rounded-xl border p-4">
						<input type="hidden" name="slug" value={p.slug} />
						<div className="min-w-0 flex-1">
							<p className="font-medium">{p.title}</p>
							<p className="text-muted-foreground text-xs">
								{formatPrice(founding.active && p.foundingPrice !== null ? p.foundingPrice : p.price)} ·{" "}
								{p.status} · Stripe price {p.stripePriceId ? "set" : "missing"}
							</p>
						</div>
						<Button type="submit">Buy</Button>
					</form>
				))}
		</main>
	);
}
