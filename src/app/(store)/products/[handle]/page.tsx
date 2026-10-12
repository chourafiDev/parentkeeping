import { ArrowRight, CalendarClock, CircleHelp, Download, FileArchive, FileText, Plus, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assetStatus, formatBytes } from "@/lib/assets";
import { fileMatchesPart, PRODUCT_PATHS, SLUG_BY_HANDLE } from "@/lib/catalog";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { AGREEMENT_LEGAL_LINE, BINDER_LEGAL_LINE, PRODUCT_DISCLAIMER_SHORT, SHEET_LEGAL_LINE } from "@/lib/legal";
import { formatStorePrice } from "@/lib/money";
import { GUARANTEE_TEXT, OFFER_FAQ, OFFER_PARTS, OFFER_SUBHEAD } from "@/lib/offer";
import { siteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { getSettings } from "@/server/queries/settings";
import { getStoreProduct, type StoreProduct } from "@/server/queries/storefront";
import { DocMockup, type DocKind } from "../../_components/home/doc-mockup";
import { ProductGallery } from "../../_components/product/gallery";
import { ShareButton } from "../../_components/product/share-button";
import { jsonLdHtml, productJsonLd, visitorCountry } from "../../_components/product-data";
import { container } from "../../_components/ui";

export const dynamic = "force-dynamic";

const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });
const textOf = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const DOC_KIND: Record<string, DocKind> = { "family-care-system": "bundle", "medical-binder": "binder", "caregiver-agreement": "agreement" };

/** The product's own legal lines (the System shows all three). */
const LEGAL_LINES: Record<string, string[]> = {
	"family-care-system": [BINDER_LEGAL_LINE, AGREEMENT_LEGAL_LINE, SHEET_LEGAL_LINE],
	"medical-binder": [BINDER_LEGAL_LINE],
	"caregiver-agreement": [AGREEMENT_LEGAL_LINE],
};

async function load(params: Promise<{ handle: string }>) {
	const slug = SLUG_BY_HANDLE[(await params).handle];
	const data = slug ? await getStoreProduct(slug) : null;
	if (!data) notFound();
	return data;
}

/** Short text under the price: SEO description, else the description's first paragraph. */
function shortText({ product }: StoreProduct) {
	if (product.seoDescription) return product.seoDescription;
	const first = product.description.match(/<p>(.*?)<\/p>/)?.[1];
	if (first && textOf(first)) return textOf(first);
	return product.kind === "bundle" ? OFFER_SUBHEAD : "";
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
	const data = await load(params);
	const { product } = data;
	return {
		title: product.seoTitle ? { absolute: product.seoTitle } : product.title,
		description: shortText(data) || undefined,
		alternates: { canonical: PRODUCT_PATHS[product.slug] },
		openGraph: data.images[0] ? { images: [{ url: data.images[0].url }] } : undefined,
	};
}

/** Accordion row (Glozin: Description / Shipping and Returns / Return Policies). */
function Panel({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
	return (
		<details className="group border-b" open={open}>
			<summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
				{title}
				<Plus className="size-4 shrink-0 transition-transform group-open:rotate-45" />
			</summary>
			<div className="text-body pb-5 text-[15px] leading-[1.714]">{children}</div>
		</details>
	);
}

/**
 * Store product page in the Glozin product layout: gallery left, buy column
 * right, accordions under the buy box. Same template for the System, the
 * Medical Binder and the Caregiver Agreement (spec routes).
 */
export default async function ProductPage({ params, searchParams }: PageProps<"/products/[handle]">) {
	const [data, query] = await Promise.all([load(params), searchParams]);
	const [country, { contact }] = await Promise.all([visitorCountry(query.country), getSettings("contact")]);
	const { product, images, assets, system } = data;
	const usVisitor = !country || country === "US";
	const isBundle = product.kind === "bundle";
	const isAgreement = product.slug === "caregiver-agreement";
	const discount = data.compareAt ? Math.round((1 - data.price / data.compareAt) * 100) : 0;
	const presale = assets.some((a) => assetStatus(a) === "presale");
	const checkoutError = typeof query.checkout_error === "string" ? query.checkout_error : null;
	const short = shortText(data);
	const url = `${siteUrl()}${PRODUCT_PATHS[product.slug]}`;
	const upgradeBy = system ? system.price - data.price : 0;

	const buyButton = !usVisitor ? (
		<div className="bg-muted/70 grid gap-1 rounded-[10px] p-4 text-sm">
			<p className="text-foreground font-medium">Available to US customers only for now.</p>
			<Link href={FREE_LIST_PATH} className="text-primary font-semibold underline-offset-2 hover:underline">
				Join the list for the UK edition (and get the free Medication List)
			</Link>
		</div>
	) : data.sellable ? (
		<form action="/api/checkout" method="post">
			<input type="hidden" name="slug" value={product.slug} />
			<button
				type="submit"
				className="bg-foreground hover:bg-primary flex h-[50px] w-full items-center justify-center rounded-full text-[15px] font-semibold tracking-[-0.024em] text-white transition-colors"
			>
				{presale ? "Pre-order" : "Buy now"} · {formatStorePrice(data.price)}
			</button>
		</form>
	) : (
		<button type="button" disabled className="bg-foreground/40 flex h-[50px] w-full items-center justify-center rounded-full text-[15px] font-semibold text-white">
			Coming soon
		</button>
	);

	return (
		<main className="flex-1">
			<script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(productJsonLd({ title: product.title, description: short || product.title, price: data.price, url, image: images[0]?.url, inStock: data.sellable }))} />

			<div className={`${container} pt-6 pb-16 md:pb-[70px]`}>
				<nav aria-label="Breadcrumb" className="text-body mb-6 text-[13px]">
					<Link href="/" className="hover:text-foreground">
						Home
					</Link>
					<span className="mx-2">·</span>
					<span className="text-foreground">{product.title}</span>
				</nav>

				<div className="grid items-start gap-8 md:grid-cols-2 lg:gap-[60px]">
					<div className="md:sticky md:top-[130px]">
						<ProductGallery images={images} title={product.title} fallback={<DocMockup kind={DOC_KIND[product.slug] ?? "binder"} title={product.title} />} />
					</div>

					<div className="grid gap-6">
						<div className="grid gap-3">
							{(discount > 0 || presale) && (
								<div className="flex gap-1.5">
									{discount > 0 && <span className="rounded-full bg-[#dc3545] px-2.5 py-0.5 text-xs font-semibold text-white">-{discount}%</span>}
									{presale && <span className="rounded-full bg-[#6c4cf1] px-2.5 py-0.5 text-xs font-semibold text-white">Pre-order</span>}
								</div>
							)}
							<p className="text-body text-[13px]">Parentkeeping</p>
							<h1 className="text-foreground text-[26px] leading-tight font-semibold tracking-[-0.034em] md:text-[30px]">{product.title}</h1>
							<p className="flex flex-wrap items-baseline gap-x-2.5 tabular-nums">
								<span className={cn("text-[24px] font-semibold", data.compareAt && "text-[#dc3545]")}>{formatStorePrice(data.price)}</span>
								{data.compareAt && <span className="text-body text-[17px] line-through">{formatStorePrice(data.compareAt)}</span>}
								<span className="text-body text-[13px]">USD · Available to US customers</span>
							</p>
							{data.foundingEndsAt && (
								<p className="text-[14px]">
									<span className="font-semibold">Founding price</span> until {fmtDay(data.foundingEndsAt)}. Then {formatStorePrice(data.compareAt!)}.
								</p>
							)}
							{short && <p className="text-body text-[15px] leading-[1.714]">{short}</p>}
						</div>

						<div className="flex flex-wrap items-center gap-5 border-y py-4">
							{contact.supportEmail && (
								<a href={`mailto:${contact.supportEmail}?subject=${encodeURIComponent(`Question about ${product.title}`)}`} className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors">
									<CircleHelp className="size-4" />
									Ask a question
								</a>
							)}
							<ShareButton title={product.title} />
						</div>

						<div className="grid gap-3">
							{isAgreement && <p className="rounded-[10px] bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">{AGREEMENT_LEGAL_LINE}</p>}
							{checkoutError && <p className="bg-destructive/10 text-destructive rounded-[10px] p-3 text-sm">{checkoutError}</p>}
							{buyButton}
							<div className="text-body grid gap-1 text-[13px]">
								<p>{PRODUCT_DISCLAIMER_SHORT}</p>
								<p className="flex items-center gap-1.5">
									<ShieldCheck className="text-primary size-4" />
									14-day “if it doesn&apos;t help” guarantee
								</p>
							</div>
						</div>

						{/* Glozin's delivery / returns boxes, for a digital product */}
						<div className="grid grid-cols-2 divide-x rounded-[10px] border text-center text-[13px]">
							<div className="grid justify-items-center gap-2 p-4">
								<Zap className="size-5" strokeWidth={1.5} />
								<p className="text-body">
									<span className="text-foreground font-semibold">Instant download</span> after payment, on screen and by email.
								</p>
							</div>
							<div className="grid justify-items-center gap-2 p-4">
								<ShieldCheck className="size-5" strokeWidth={1.5} />
								<p className="text-body">
									<span className="text-foreground font-semibold">14-day guarantee:</span> if it doesn&apos;t help, full refund.
								</p>
							</div>
						</div>

						<div className="grid justify-items-center gap-3 rounded-[10px] bg-[#f5f5f5] p-5">
							<p className="text-foreground text-[15px] font-semibold">Guaranteed safe checkout</p>
							<ul className="flex flex-wrap justify-center gap-1.5" aria-label="Accepted cards">
								{["Visa", "Mastercard", "Amex", "Discover"].map((card) => (
									<li key={card} className="rounded-[4px] border bg-white px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#1a1f36]">
										{card}
									</li>
								))}
							</ul>
							<p className="text-body text-xs">Secure payment by Stripe. Sales tax is calculated at checkout.</p>
						</div>

						{system && upgradeBy > 0 && (
							<Link href={PRODUCT_PATHS["family-care-system"]} className="group hover:border-foreground grid gap-1 rounded-[10px] border p-5 transition-colors">
								<span className="text-primary text-xs font-bold tracking-[0.02em] uppercase">Upgrade to the Family Care System</span>
								<span className="text-foreground text-[17px] font-semibold tracking-[-0.02em]">
									Get this plus the shared sheet, agreement and meeting kit for {formatStorePrice(upgradeBy)} more
								</span>
								<span className="text-foreground mt-1 flex items-center gap-1 text-sm font-semibold">
									See the System · {formatStorePrice(system.price)}
									<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
								</span>
							</Link>
						)}

						<div className="border-t">
							<Panel title="Description" open>
								{product.description ? (
									<div className="rich-text" dangerouslySetInnerHTML={{ __html: product.description }} />
								) : (
									<p>{short || "Details coming soon."}</p>
								)}
							</Panel>

							<Panel title="What's included">
								{isBundle ? (
									<ul className="grid gap-3">
										{OFFER_PARTS.map((part) => {
											const arrives = assets.find((a) => fileMatchesPart(a.label, part.fileLabel) && a.availableAt)?.availableAt;
											return (
												<li key={part.name} className="grid gap-0.5">
													<span className="text-foreground font-semibold">{part.name}</span>
													<span className="text-[14px]">
														{part.format} · {part.pillar}
														{arrives ? ` · arrives by ${fmtDay(arrives)}` : ""}
													</span>
												</li>
											);
										})}
									</ul>
								) : assets.length > 0 ? (
									<ul className="grid gap-2">
										{assets.map((a) => {
											const Icon = a.kind === "pdf" ? FileText : FileArchive;
											return (
												<li key={a.id} className="flex items-center gap-2.5">
													<Icon className="text-foreground size-4 shrink-0" />
													<span className="text-foreground min-w-0 flex-1">{a.fileName ?? a.label}</span>
													<span className="shrink-0 text-[13px]">
														{a.availableAt ? `Arrives by ${fmtDay(a.availableAt)}` : formatBytes(a.sizeBytes)}
													</span>
												</li>
											);
										})}
									</ul>
								) : (
									<p>The full list of files is coming soon.</p>
								)}
							</Panel>

							<Panel title="Delivery & downloads">
								<ul className="grid gap-2">
									<li className="flex gap-2.5">
										<Download className="text-foreground mt-1 size-4 shrink-0" />
										Instant download after payment: on the thank-you page and in your order email.
									</li>
									<li className="flex gap-2.5">
										<FileArchive className="text-foreground mt-1 size-4 shrink-0" />
										Files come as a ZIP folder that opens with a double-click on Mac and Windows. Fillable PDFs work best in Adobe Acrobat Reader.
									</li>
									{presale && (
										<li className="flex gap-2.5">
											<CalendarClock className="text-foreground mt-1 size-4 shrink-0" />
											Pre-sale parts arrive by email on their date at no extra cost. If a date is missed, you can ask for a full refund.
										</li>
									)}
									<li className="flex gap-2.5">
										<ShieldCheck className="text-foreground mt-1 size-4 shrink-0" />
										{product.downloadLimit === null
											? "Download as many times as you need for a year."
											: `Download each file up to ${product.downloadLimit} times within a year. Need more? Just write to us.`}
									</li>
								</ul>
							</Panel>

							<Panel title="Refund policy">
								<p>{GUARANTEE_TEXT}</p>
								<Link href="/policies/refund-policy" className="text-foreground mt-2 inline-block font-semibold underline-offset-2 hover:underline">
									Read the refund policy
								</Link>
							</Panel>

							<Panel title="Questions">
								<dl className="grid gap-4">
									{OFFER_FAQ.map((item) => (
										<div key={item.q} className="grid gap-1">
											<dt className="text-foreground font-semibold">{item.q}</dt>
											<dd>{item.a}</dd>
										</div>
									))}
								</dl>
							</Panel>
						</div>

						<div className="text-body grid gap-1 text-xs">
							{(LEGAL_LINES[product.slug] ?? []).map((line) => (
								<p key={line}>{line}</p>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
