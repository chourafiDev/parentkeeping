import { CircleCheck, FileArchive, FileText, Sheet } from "lucide-react";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { assetStatus } from "@/lib/assets";
import { SITE } from "@/lib/site";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { getStripe } from "@/server/lib/stripe";
import { getOrderFiles } from "@/server/queries/orders";
import { StoreCard } from "../_components/store-card";
import { Refresher } from "./refresher";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// The session id in this URL works as a key only for a short while: after that
// the buyer uses the link from their order email.
const FRESH_MS = 48 * 60 * 60 * 1000;
const isFresh = (paidAt: Date) => Date.now() - paidAt.getTime() < FRESH_MS;

export default async function ThankYouPage({ searchParams }: PageProps<"/thank-you">) {
	const sessionId = (await searchParams).session_id;
	const stripe = getStripe();
	if (typeof sessionId !== "string" || !sessionId.startsWith("cs_") || !stripe) {
		return (
			<StoreCard>
			<div className="text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Thank you</h1>
				<p className="text-muted-foreground mt-2">Your download link is in your order email.</p>
						</div>
		</StoreCard>
		);
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
	if (!session || session.payment_status !== "paid") {
		return (
			<StoreCard>
			<div className="text-center">
				<h1 className="text-2xl font-semibold tracking-tight">We couldn&apos;t confirm this payment</h1>
				<p className="text-muted-foreground mt-2">
					If you were charged, your download link will arrive by email shortly.
				</p>
						</div>
		</StoreCard>
		);
	}

	const [order] = await db.select().from(orders).where(eq(orders.stripeSessionId, session.id));
	const email = session.customer_details?.email;

	if (!order) {
		return (
			<StoreCard>
			<div className="text-center">
				<CircleCheck className="text-primary mx-auto mb-3 size-10" />
				<h1 className="text-2xl font-semibold tracking-tight">Thank you for your order</h1>
				<p className="text-muted-foreground mt-2 mb-6">
					Your payment went through{email ? `, and a receipt is on its way to ${email}` : ""}.
				</p>
				<Refresher />
						</div>
		</StoreCard>
		);
	}

	if (order.status !== "paid") {
		return (
			<StoreCard>
			<div className="text-center">
				<h1 className="text-2xl font-semibold tracking-tight">This order was refunded</h1>
				<p className="text-muted-foreground mt-2">
					If you didn&apos;t expect that, reply to your receipt email and a person will sort it out.
				</p>
						</div>
		</StoreCard>
		);
	}

	const files = await getOrderFiles(order.id);
	const fresh = isFresh(order.paidAt);

	return (
		<StoreCard>
			<div className="text-center">
			<CircleCheck className="text-primary mx-auto mb-3 size-10" />
			<h1 className="text-2xl font-semibold tracking-tight">
				{files.some((f) => assetStatus(f) === "ready") ? "Thank you, your files are ready" : "Thank you for your order"}
			</h1>
			<p className="text-muted-foreground mt-2">
				Order #{order.orderNumber}. We also emailed your download link to {order.email}.
			</p>
			<ul className="mt-6 divide-y rounded-lg border text-start">
				{files.map((f) => {
					const Icon = f.kind === "sheet_link" ? Sheet : f.kind === "file" ? FileArchive : FileText;
					const status = assetStatus(f);
					return (
						<li key={f.id} className="flex items-center gap-3 p-3 text-sm">
							<Icon className="text-primary size-4 shrink-0" />
							<span className="min-w-0 flex-1">{f.label}</span>
							<span className="text-muted-foreground shrink-0 text-xs">
								{status === "ready"
									? "Ready"
									: f.availableAt
										? `Arrives by ${f.availableAt.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" })}`
										: "Coming soon"}
							</span>
						</li>
					);
				})}
			</ul>
			{fresh ? (
				<Button asChild size="lg" className="mt-6 h-11 w-full">
					{/* Plain link: the API issues the download link on click, then redirects. */}
					<a href={`/api/thank-you/downloads?session_id=${encodeURIComponent(session.id)}`}>Go to my downloads</a>
				</Button>
			) : (
				<p className="text-muted-foreground mt-6 text-sm">Use the link in your order email to download your files.</p>
			)}
			<p className="text-muted-foreground mt-4 text-xs">
				{SITE.name} · 14-day “if it doesn&apos;t help” guarantee. An organizing tool, not medical or legal advice.
			</p>
					</div>
		</StoreCard>
	);
}
