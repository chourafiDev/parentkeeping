import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { verifyUnsubscribe } from "@/server/lib/unsubscribe";
import { StoreCard } from "../../_components/store-card";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Two steps on purpose: email scanners open links, so the link only shows
// this page; the button (a POST) does the unsubscribing.
export default async function UnsubscribePage({ searchParams }: PageProps<"/pages/unsubscribe">) {
	const { s, sig, status } = await searchParams;

	if (status === "done") {
		return (
			<StoreCard>
				<div className="grid gap-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">You&apos;re unsubscribed</h1>
					<p className="text-muted-foreground">You won&apos;t get our weekly emails anymore. Your free list stays yours.</p>
				</div>
			</StoreCard>
		);
	}

	const valid = typeof s === "string" && typeof sig === "string" && verifyUnsubscribe(s, sig);
	if (!valid) {
		return (
			<StoreCard>
				<div className="grid gap-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">This link doesn&apos;t work</h1>
					<p className="text-muted-foreground">Use the unsubscribe link at the bottom of any of our emails.</p>
				</div>
			</StoreCard>
		);
	}

	return (
		<StoreCard>
			<form action="/api/unsubscribe" method="post" className="grid gap-4 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Unsubscribe from our emails?</h1>
				<p className="text-muted-foreground">You&apos;ll stop getting Parentkeeping&apos;s weekly caregiving emails.</p>
				<input type="hidden" name="s" value={s} />
				<input type="hidden" name="sig" value={sig} />
				<Button type="submit" size="lg" className="h-11 justify-self-center px-8">
					Unsubscribe
				</Button>
			</form>
		</StoreCard>
	);
}
