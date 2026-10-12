import { ArrowRight, CalendarClock, CircleHelp, Download, FileArchive, FileText, Plus, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assetStatus, formatBytes } from "@/lib/assets";
import { BUNDLE_SLUG, BUY_LABELS, fileMatchesPart, PRODUCT_PATHS, SLUG_BY_HANDLE } from "@/lib/catalog";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { BUY_GUARANTEE_LINE } from "@/lib/legal";
import { formatStorePrice } from "@/lib/money";
import { guaranteeText, OFFER_PARTS, ONE_PRICE_BADGE } from "@/lib/offer";
import { PRODUCT_COPY, type ProductCopy } from "@/lib/product-copy";
import { siteUrl } from "@/lib/site-url";
import { formatStoreDay } from "@/lib/store-time";
import { cn } from "@/lib/utils";
import { getSettings } from "@/server/queries/settings";
import { getStoreProduct, type StoreProduct } from "@/server/queries/storefront";
import { CopyBlock } from "../../_components/copy-block";
import { FaqList } from "../../_components/faq-list";
import { InsideGrid } from "../../_components/inside-grid";
import { DocMockup, type DocKind } from "../../_components/home/doc-mockup";
import { ProductGallery } from "../../_components/product/gallery";
import { ShareButton } from "../../_components/product/share-button";
import { jsonLdHtml, productJsonLd, visitorCountry } from "../../_components/product-data";
import { container, eyebrow, media, pillLight, sectionTitle } from "../../_components/ui";

export const dynamic = "force-dynamic";

const textOf = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const DOC_KIND: Record<string, DocKind> = {
	"family-care-system": "bundle",
	"medical-binder": "binder",
	"caregiver-agreement": "agreement",
	"emergency-binder": "binder",
};

async function load(params: Promise<{ handle: string }>) {
	const slug = SLUG_BY_HANDLE[(await params).handle];
	const data = slug ? await getStoreProduct(slug) : null;
	const copy = slug ? PRODUCT_COPY[slug] : undefined;
	if (!data || !copy) notFound();
	return { ...data, copy };
}

/** Admin SEO fields win; the page copy is the default. */
function seoOf({ product, copy }: StoreProduct & { copy: ProductCopy }) {
	return { title: product.seoTitle || copy.seo.title, description: product.seoDescription || copy.seo.description };
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
	const data = await load(params);
	const seo = seoOf(data);
	// The System's page repeats the home page: canonical to "/" so they don't compete.
	const canonical = data.product.slug === BUNDLE_SLUG ? "/" : PRODUCT_PATHS[data.product.slug];
	return {
		title: { absolute: seo.title },
		description: seo.description,
		alternates: { canonical },
		openGraph: { title: seo.title, description: seo.description, url: canonical, images: data.images[0] ? [{ url: data.images[0].url }] : undefined },
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
 * right with the accordions, then the page copy full width (what's inside,
 * the copy sections, FAQ, legal lines) and the upgrade banner last.
 */
export default async function ProductPage({ params, searchParams }: PageProps<"/products/[handle]">) {
	const [data, query] = await Promise.all([load(params), searchParams]);
	const [country, { contact }] = await Promise.all([visitorCountry(query.country), getSettings("contact")]);
	const { product, images, assets, system, copy } = data;
	const usVisitor = !country || country === "US";
	const isBundle = product.slug === BUNDLE_SLUG;
	const discount = data.compareAt ? Math.round((1 - data.price / data.compareAt) * 100) : 0;
	const presale = assets.some((a) => assetStatus(a) === "presale");
	const checkoutError = typeof query.checkout_error === "string" ? query.checkout_error : null;
	const url = `${siteUrl()}${isBundle ? "/" : PRODUCT_PATHS[product.slug]}`;
	const upgradeBy = system ? system.price - data.price : 0;
	const description = product.description && textOf(product.description) ? product.description : null;

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
				{BUY_LABELS[product.slug] ?? "Buy now"}
				{presale ? " · Pre-order" : ""}
			</button>
		</form>
	) : (
		<button type="button" disabled className="bg-foreground/40 flex h-[50px] w-full items-center justify-center rounded-full text-[15px] font-semibold text-white">
			Coming soon
		</button>
	);

	return (
		<main className="flex-1">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={jsonLdHtml(
					productJsonLd({ title: copy.schemaName ?? copy.h1, description: copy.seo.description, price: data.price, url, image: images[0]?.url, inStock: data.sellable }),
				)}
			/>

			<div className={`${container} pt-6 pb-12 md:pb-[70px]`}>
				<nav aria-label="Breadcrumb" className="text-body mb-6 text-[13px]">
					<Link href="/" className="hover:text-foreground">
						Home
					</Link>
					<span className="mx-2">·</span>
					<span className="text-foreground">{copy.h1}</span>
				</nav>

				<div className="grid items-start gap-8 md:grid-cols-2 lg:gap-[60px]">
					<div className="md:sticky md:top-[130px]">
						<ProductGallery images={images} title={copy.h1} fallback={<DocMockup kind={DOC_KIND[product.slug] ?? "binder"} title={product.title} />} />
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
							<h1 className="text-foreground text-[26px] leading-tight font-semibold tracking-[-0.034em] md:text-[30px]">{copy.h1}</h1>
							<p className="flex flex-wrap items-baseline gap-x-2.5 tabular-nums">
								<span className={cn("text-[24px] font-semibold", data.compareAt && "text-[#dc3545]")}>{formatStorePrice(data.price)}</span>
								{data.compareAt && <span className="text-body text-[17px] line-through">{formatStorePrice(data.compareAt)}</span>}
								{data.foundingEndsAt && <span className="text-foreground text-[14px] font-medium">founding price until {formatStoreDay(data.foundingEndsAt)}</span>}
							</p>
							<p className="text-body text-[13px]">{ONE_PRICE_BADGE}</p>
							<p className="text-body text-[15px] leading-[1.714]">{copy.subhead}</p>
						</div>

						<div className="flex flex-wrap items-center gap-5 border-y py-4">
							{contact.supportEmail && (
								<a
									href={`mailto:${contact.supportEmail}?subject=${encodeURIComponent(`Question about ${copy.h1}`)}`}
									className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
								>
									<CircleHelp className="size-4" />
									Ask a question
								</a>
							)}
							<ShareButton title={copy.h1} />
						</div>

						<div className="grid gap-3">
							{copy.aboveButton && <p className="rounded-[10px] bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">{copy.aboveButton}</p>}
							{checkoutError && <p className="bg-destructive/10 text-destructive rounded-[10px] p-3 text-sm">{checkoutError}</p>}
							{buyButton}
							<div className="text-body grid gap-1 text-[13px]">
								<p>{copy.underButton}</p>
								<p className="flex items-center gap-1.5">
									<ShieldCheck className="text-primary size-4 shrink-0" />
									{BUY_GUARANTEE_LINE}
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

						<div className="border-t">
							<Panel title="Description" open>
								{description ? (
									<div className="rich-text" dangerouslySetInnerHTML={{ __html: description }} />
								) : (
									<div className="grid gap-3">
										{(copy.intro ?? [copy.subhead]).map((p) => (
											<p key={p}>{p}</p>
										))}
									</div>
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
														{part.format}
														{arrives ? ` · arrives by ${formatStoreDay(arrives)}` : ""}
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
													<span className="shrink-0 text-[13px]">{a.availableAt ? `Arrives by ${formatStoreDay(a.availableAt)}` : formatBytes(a.sizeBytes)}</span>
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
											Pre-sale parts arrive by email on their date at no extra cost. If we miss the date, you can have a full refund.
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
								<p>{guaranteeText(contact.supportEmail)}</p>
								<Link href="/policies/refund-policy" className="text-foreground mt-2 inline-block font-semibold underline-offset-2 hover:underline">
									Read the refund policy
								</Link>
							</Panel>
						</div>
					</div>
				</div>
			</div>

			<InsideGrid title={copy.inside.title} items={copy.inside.items} />

			{copy.sections.length > 0 && (
				<section className={`${container} pb-12 md:pb-[70px]`}>
					<div className={cn("grid gap-10 md:gap-[60px]", copy.sections.length > 1 && "md:grid-cols-2")}>
						{copy.sections.map((block) => (
							<CopyBlock key={block.title} block={block} />
						))}
					</div>
				</section>
			)}

			{/* FAQ: the home page's flat accordion */}
			<section className={`${container} pb-12 md:pb-[70px]`}>
				<div className="mx-auto grid max-w-[860px] gap-8">
					<h2 className={`${sectionTitle} text-center`}>Questions</h2>
					<FaqList items={copy.faq} />
					<div className="text-body grid gap-2 text-xs leading-relaxed">
						{copy.legal.map((line) => (
							<p key={line.text}>
								{line.label && <span className="text-foreground font-semibold">{line.label}: </span>}
								{line.text}
							</p>
						))}
					</div>
				</div>
			</section>

			{/* Every product page ends with the upgrade block (Glozin's closing banner). */}
			{copy.upgrade && system && (copy.upgrade.priceLine ? upgradeBy > 0 : true) && (
				<section className={`${container} pb-12 md:pb-[70px]`}>
					<div className={`${media} bg-deep flex min-h-[380px] items-center justify-center px-6 py-14 text-center text-white md:min-h-[440px]`}>
						<span
							aria-hidden
							className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,color-mix(in_oklab,var(--brand)_60%,transparent)_0%,transparent_70%)]"
						/>
						<div className="grid max-w-[640px] justify-items-center gap-4">
							<p className={eyebrow}>The Family Care System</p>
							<h2 className="text-[30px] leading-[1.15] font-semibold tracking-[-0.034em] md:text-[38px]">{copy.upgrade.title}</h2>
							<p className="text-[16px] leading-relaxed text-white/85">{copy.upgrade.text}</p>
							{copy.upgrade.priceLine && (
								<p className="text-[17px] font-semibold">
									{system.compareAt
										? `Only ${formatStorePrice(upgradeBy)} more at the founding price (${formatStorePrice(system.price)}).`
										: `Only ${formatStorePrice(upgradeBy)} more (${formatStorePrice(system.price)}).`}
								</p>
							)}
							<Link href={copy.upgrade.href} className={`${pillLight} mt-2 gap-2`}>
								{copy.upgrade.cta}
								<ArrowRight className="size-4" />
							</Link>
						</div>
					</div>
				</section>
			)}
		</main>
	);
}
