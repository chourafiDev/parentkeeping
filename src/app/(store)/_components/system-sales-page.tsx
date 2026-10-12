import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { ArrowRight, CalendarClock, FileText, Handshake, MessagesSquare, Sheet, ShieldCheck } from "lucide-react";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { BUNDLE_SLUG, PRODUCT_PATHS, VARIANT_COOKIE } from "@/lib/catalog";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { AGREEMENT_LEGAL_LINE, BINDER_LEGAL_LINE, SHEET_LEGAL_LINE } from "@/lib/legal";
import { formatStorePrice } from "@/lib/money";
import { siteUrl } from "@/lib/site-url";
import {
	GUARANTEE_TEXT,
	OFFER_FAQ,
	OFFER_HEADLINES,
	OFFER_MOMENT,
	OFFER_PARTS,
	OFFER_SUBHEAD,
	ONE_PRICE_BADGE,
	ONLY_CHILD_NOTE,
	SHARING_STEPS,
} from "@/lib/offer";
import { db } from "@/server/db";
import { files, productFiles, products } from "@/server/db/schema";
import { getFoundingPrice } from "@/server/queries/settings";
import { BuyBox } from "./buy-box";

const PART_ICONS = [FileText, Sheet, Handshake, MessagesSquare];

/** Visitor country from the edge; dev can preview with ?country=GB. */
export async function visitorCountry(devParam: unknown) {
	if (process.env.NODE_ENV !== "production" && typeof devParam === "string") return devParam.toUpperCase();
	return (await headers()).get("x-vercel-ip-country");
}

/** Everything the System page needs: prices, founding window, pre-sale dates. */
async function loadOffer() {
	const rows = await db
		.select()
		.from(products)
		.where(inArray(products.slug, [BUNDLE_SLUG, "medical-binder", "caregiver-agreement"]));
	const system = rows.find((p) => p.slug === BUNDLE_SLUG);
	if (!system) throw new Error("Family Care System product is missing (run pnpm db:seed)");
	const [founding, presale] = await Promise.all([
		getFoundingPrice(),
		db
			.select({ label: files.label, availableAt: files.availableAt })
			.from(productFiles)
			.innerJoin(files, eq(files.id, productFiles.fileId))
			.where(and(eq(productFiles.productId, system.id), isNotNull(files.availableAt))),
	]);
	return {
		system,
		binder: rows.find((p) => p.slug === "medical-binder"),
		agreement: rows.find((p) => p.slug === "caregiver-agreement"),
		founding,
		presale,
	};
}

export function systemJsonLd(p: { title: string; price: number; foundingPrice: number | null; foundingActive: boolean; url: string }) {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: p.title,
		description: OFFER_SUBHEAD,
		brand: { "@type": "Brand", name: "Parentkeeping" },
		offers: {
			"@type": "Offer",
			url: p.url,
			priceCurrency: "USD",
			price: ((p.foundingActive && p.foundingPrice !== null ? p.foundingPrice : p.price) / 100).toFixed(2),
			availability: "https://schema.org/InStock",
			eligibleRegion: { "@type": "Country", name: "US" },
		},
	};
}

const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });

/**
 * The Family Care System sales page, in the spec's block order: hero, the
 * moment, what's inside, how sharing works, price anchor, guarantee, FAQ,
 * downsell strip, free list strip. Rendered at / and /products/family-care-system.
 */
export async function SystemSalesPage({
	searchParams,
	path,
}: {
	searchParams: Record<string, string | string[] | undefined>;
	/** Page path, for the structured data's URL. */
	path: string;
}) {
	const [{ system, binder, agreement, founding, presale }, country, jar] = await Promise.all([
		loadOffer(),
		visitorCountry(searchParams.country),
		cookies(),
	]);
	const variant = jar.get(VARIANT_COOKIE)?.value === "fairness" ? "fairness" : "one_place";
	const usVisitor = !country || country === "US";
	const foundingActive = founding.active && system.foundingPrice !== null;
	const error = typeof searchParams.checkout_error === "string" ? searchParams.checkout_error : null;
	const dateFor = (fileLabel: string) => presale.find((f) => f.label.startsWith(fileLabel))?.availableAt ?? null;

	const separately = (binder?.price ?? 0) + (agreement?.price ?? 0);
	const difference = system.price - separately;

	const buyBox = (
		<BuyBox
			slug={system.slug}
			price={system.price}
			foundingPrice={foundingActive ? system.foundingPrice : null}
			foundingEndsAt={foundingActive ? founding.endsAt : null}
			badge={ONE_PRICE_BADGE}
			usVisitor={usVisitor}
			sellable={system.status === "active" && !!(foundingActive ? system.foundingPriceId : system.stripePriceId)}
			error={error}
		/>
	);

	const jsonLd = systemJsonLd({
		title: system.title,
		price: system.price,
		foundingPrice: system.foundingPrice,
		foundingActive,
		url: `${siteUrl()}${path}`,
	});

	return (
		<main className="flex-1">
			<script
				type="application/ld+json"
				// JSON.stringify output; "<" escaped so the data can't close the tag.
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
			/>
			{/* Hero */}
			<section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-20">
				<div className="grid gap-5">
					<p className="text-primary text-sm font-semibold tracking-wide uppercase">The Parentkeeping Family Care System</p>
					<h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-5xl">{OFFER_HEADLINES[variant]}</h1>
					<p className="text-muted-foreground text-lg">{OFFER_SUBHEAD}</p>
					<ul className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-sm">
						<li>Medical Binder</li>
						<li>Shared Family Care Sheet</li>
						<li>Caregiver Agreement</li>
						<li>Family Meeting Kit</li>
					</ul>
				</div>
				{buyBox}
			</section>

			{/* The moment */}
			<section className="bg-muted/60 border-y">
				<div className="mx-auto grid max-w-3xl gap-4 px-4 py-16">
					<h2 className="text-3xl font-semibold tracking-tight">{OFFER_MOMENT.title}</h2>
					{OFFER_MOMENT.paragraphs.map((p) => (
						<p key={p} className="text-muted-foreground text-lg leading-relaxed">
							{p}
						</p>
					))}
				</div>
			</section>

			{/* What's inside */}
			<section className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
				<div className="grid gap-2">
					<h2 className="text-3xl font-semibold tracking-tight">What&apos;s inside</h2>
					<p className="text-muted-foreground">Four parts, one price, one promise: one place, shared fairly, no new app.</p>
				</div>
				<ul className="grid gap-4 md:grid-cols-2">
					{OFFER_PARTS.map((part, i) => {
						const Icon = PART_ICONS[i];
						const arrives = dateFor(part.fileLabel);
						return (
							<li key={part.name} className="bg-card grid content-start gap-3 rounded-2xl border p-5">
								<div className="flex items-start gap-3">
									<span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
										<Icon className="size-5" />
									</span>
									<div className="grid gap-1">
										<h3 className="font-semibold">{part.name}</h3>
										<p className="text-muted-foreground text-xs">
											{part.format} · {part.pillar}
										</p>
									</div>
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">{part.what}</p>
								{arrives && (
									<p className="flex items-center gap-1.5 justify-self-start rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-900">
										<CalendarClock className="size-3.5" />
										Pre-sale: arrives by {fmtDay(arrives)}
									</p>
								)}
							</li>
						);
					})}
				</ul>
			</section>

			{/* How sharing works */}
			<section className="bg-muted/60 border-y">
				<div className="mx-auto grid max-w-6xl gap-8 px-4 py-16">
					<h2 className="text-3xl font-semibold tracking-tight">How sharing works</h2>
					<ol className="grid gap-4 md:grid-cols-3">
						{SHARING_STEPS.map((step, i) => (
							<li key={step.title} className="bg-card grid content-start gap-2 rounded-2xl border p-5">
								<span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-semibold">
									{i + 1}
								</span>
								<h3 className="font-semibold">{step.title}</h3>
								<p className="text-muted-foreground text-sm">{step.text}</p>
							</li>
						))}
					</ol>
					<p className="text-muted-foreground">{ONLY_CHILD_NOTE}</p>
				</div>
			</section>

			{/* Price anchor + guarantee + buy again */}
			<section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 md:grid-cols-[1.15fr_1fr]">
				<div className="grid gap-8">
					{binder && agreement && (
						<div className="grid gap-3">
							<h2 className="text-3xl font-semibold tracking-tight">One price for all four</h2>
							<p className="text-muted-foreground text-lg">
								The Medical Binder ({formatStorePrice(binder.price)}) and the Caregiver Agreement ({formatStorePrice(agreement.price)})
								bought separately cost {formatStorePrice(separately)}. The System adds the shared sheet and the meeting kit
								{difference > 0 ? ` for ${formatStorePrice(difference)} more` : " and still costs less"}
								{foundingActive && system.foundingPrice !== null
									? `, and at the founding price of ${formatStorePrice(system.foundingPrice)} it costs less than the two alone.`
									: "."}
							</p>
						</div>
					)}
					<div className="grid gap-3">
						<h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
							<ShieldCheck className="text-primary size-6" />
							14-day “if it doesn&apos;t help” guarantee
						</h2>
						<p className="text-muted-foreground text-lg">{GUARANTEE_TEXT}</p>
					</div>
				</div>
				{buyBox}
			</section>

			{/* FAQ */}
			<section className="bg-muted/60 border-y">
				<div className="mx-auto grid max-w-3xl gap-6 px-4 py-16">
					<h2 className="text-3xl font-semibold tracking-tight">Questions</h2>
					<div className="divide-y rounded-2xl border bg-card">
						{OFFER_FAQ.map((item) => (
							<details key={item.q} className="group p-5">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
									{item.q}
									<span className="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>
										+
									</span>
								</summary>
								<p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.a}</p>
							</details>
						))}
					</div>
					<div className="text-muted-foreground grid gap-1 text-xs">
						<p>{BINDER_LEGAL_LINE}</p>
						<p>{AGREEMENT_LEGAL_LINE}</p>
						<p>{SHEET_LEGAL_LINE}</p>
					</div>
				</div>
			</section>

			{/* Downsell + free list strips */}
			<section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 md:grid-cols-2">
				{binder?.status === "active" && (
					<Link
						href={PRODUCT_PATHS["medical-binder"]}
						className="group bg-card grid gap-1 rounded-2xl border p-6 transition-colors hover:border-primary"
					>
						<span className="text-lg font-semibold">Just need the binder?</span>
						<span className="text-muted-foreground text-sm">
							The Medical Binder for an Elderly Parent on its own, {formatStorePrice(binder.price)}.
						</span>
						<span className="text-primary mt-2 flex items-center gap-1 text-sm font-medium">
							See the Medical Binder <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</span>
					</Link>
				)}
				<Link
					href={FREE_LIST_PATH}
					className="group bg-card grid gap-1 rounded-2xl border p-6 transition-colors hover:border-primary"
				>
					<span className="text-lg font-semibold">Not ready yet?</span>
					<span className="text-muted-foreground text-sm">
						Start with our free printable Medication List & Daily Medication Chart.
					</span>
					<span className="text-primary mt-2 flex items-center gap-1 text-sm font-medium">
						Get the free list <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</span>
				</Link>
			</section>
		</main>
	);
}
