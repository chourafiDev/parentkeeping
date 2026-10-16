import {
	ArrowRight,
	Check,
	Download,
	Zap,
	FileText,
	Printer,
	Scale,
	ShieldCheck,
	Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assetStatus } from "@/lib/assets";
import {
	BUNDLE_SLUG,
	BUY_LABELS,
	fileMatchesPart,
	PRODUCT_PATHS,
	SLUG_BY_HANDLE,
} from "@/lib/catalog";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { BUY_GUARANTEE_LINE } from "@/lib/legal";
import { formatStorePrice } from "@/lib/money";
import {
	OFFER_HEADLINES,
	OFFER_PARTS,
	ONE_PRICE_BADGE,
	PRICE_ANCHOR_TITLE,
	presaleNote,
} from "@/lib/offer";
import {
	type FactIcon,
	PRODUCT_COPY,
	type ProductCopy,
} from "@/lib/product-copy";
import { reviewsFor } from "@/lib/reviews";
import { siteUrl } from "@/lib/site-url";
import { formatStoreDay } from "@/lib/store-time";
import { cn } from "@/lib/utils";
import { getSettings } from "@/server/queries/settings";
import {
	getStoreProduct,
	type StoreProduct,
} from "@/server/queries/storefront";
import { CopyBlock } from "../../_components/copy-block";
import { type DocKind, DocMockup } from "../../_components/home/doc-mockup";
import { AskQuestionDialog } from "../../_components/product/ask-question-dialog";
import {
	type BuyDetail,
	BuyDetails,
	DeliveryAndRefunds,
	GuaranteeCard,
} from "../../_components/product/buy-details";
import { ProductClosingBanner } from "../../_components/product/closing-banner";
import {
	type CompareRow,
	ProductCompare,
} from "../../_components/product/compare";
import { ProductDownloadCard } from "../../_components/product/download-card";
import { ProductFaqBand } from "../../_components/product/faq-band";
import { ProductGallery } from "../../_components/product/gallery";
import { ProductHighlights } from "../../_components/product/highlights";
import { ProductReviews } from "../../_components/product/reviews";
import { ShareDialog } from "../../_components/product/share-dialog";
import { ProductSteps } from "../../_components/product/steps";
import { StickyBuyBar } from "../../_components/product/sticky-buy-bar";
import {
	jsonLdHtml,
	productJsonLd,
	visitorCountry,
} from "../../_components/product-data";
import { container, pillDark, pillLight, section } from "../../_components/ui";

export const dynamic = "force-dynamic";

const textOf = (html: string) =>
	html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();

const DOC_KIND: Record<string, DocKind> = {
	"family-care-system": "bundle",
	"medical-binder": "binder",
	"caregiver-agreement": "agreement",
	"emergency-binder": "binder",
};
/** Drawn pages for the "What it does" rows until real pictures exist. */
const HIGHLIGHT_KINDS: Record<string, DocKind[]> = {
	"family-care-system": ["binder", "sheet", "agreement", "meeting"],
	"medical-binder": ["list", "binder", "meeting", "binder"],
	"caregiver-agreement": ["agreement", "agreement", "sheet", "meeting"],
	"emergency-binder": ["binder", "agreement", "list", "binder"],
};
/** Short names for the comparison table's column. */
const SHORT_NAME: Record<string, string> = {
	"medical-binder": "Medical Binder",
	"caregiver-agreement": "Agreement Template",
};

const FACT_ICONS: Record<FactIcon, typeof Download> = {
	download: Download,
	format: FileText,
	family: Users,
	guarantee: ShieldCheck,
	print: Printer,
	attorney: Scale,
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
	return {
		title: product.seoTitle || copy.seo.title,
		description: product.seoDescription || copy.seo.description,
	};
}

export async function generateMetadata({
	params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
	const data = await load(params);
	const seo = seoOf(data);
	// The System's page repeats the home page: canonical to "/" so they don't compete.
	const canonical =
		data.product.slug === BUNDLE_SLUG ? "/" : PRODUCT_PATHS[data.product.slug];
	return {
		title: { absolute: seo.title },
		description: seo.description,
		alternates: { canonical },
		openGraph: {
			title: seo.title,
			description: seo.description,
			url: canonical,
			images: data.images[0] ? [{ url: data.images[0].url }] : undefined,
		},
	};
}

export default async function ProductPage({
	params,
	searchParams,
}: PageProps<"/products/[handle]">) {
	const [data, query] = await Promise.all([load(params), searchParams]);
	const [country, { contact }] = await Promise.all([
		visitorCountry(query.country),
		getSettings("contact"),
	]);
	const { product, images, assets, system, copy, pieces } = data;
	const usVisitor = !country || country === "US";
	const isBundle = product.slug === BUNDLE_SLUG;
	const discount = data.compareAt
		? Math.round((1 - data.price / data.compareAt) * 100)
		: 0;
	const presale = assets.some((a) => assetStatus(a) === "presale");
	const checkoutError =
		typeof query.checkout_error === "string" ? query.checkout_error : null;
	const url = `${siteUrl()}${isBundle ? "/" : PRODUCT_PATHS[product.slug]}`;
	const description =
		product.description && textOf(product.description)
			? product.description
			: null;
	const reviews = reviewsFor(product.slug);
	const facts = [
		...copy.facts,
		{
			icon: "download" as const,
			text:
				product.downloadLimit === null
					? "Download as many times as you need for a year"
					: `Download each file up to ${product.downloadLimit} times within a year`,
		},
	];

	const buyButton = (className: string) =>
		!usVisitor ? (
			<div className="bg-muted/70 grid gap-1 rounded-[10px] p-4 text-left text-sm">
				<p className="text-foreground font-medium">
					Available to US customers only for now.
				</p>
				<Link
					href={FREE_LIST_PATH}
					className="text-primary font-semibold underline-offset-2 hover:underline"
				>
					Join the list for the UK edition (and get the free Medication List)
				</Link>
			</div>
		) : data.sellable ? (
			<form action="/api/checkout" method="post">
				<input type="hidden" name="slug" value={product.slug} />
				<button type="submit" className={className}>
					{BUY_LABELS[product.slug] ?? "Buy now"}
					{presale ? " · Pre-order" : ""} · {formatStorePrice(data.price)}
				</button>
			</form>
		) : (
			<button
				type="button"
				disabled
				className={cn(className, "cursor-not-allowed opacity-50")}
			>
				Coming soon
			</button>
		);
	const fullWidthDark =
		"bg-foreground hover:bg-primary flex h-[50px] w-full items-center justify-center rounded-full text-[15px] font-semibold tracking-[-0.024em] text-white transition-colors";
	const underButton = (
		<>
			<p>{copy.underButton}</p>
			<p className="flex items-center justify-center gap-1.5">
				<ShieldCheck className="text-primary size-4 shrink-0" />
				{BUY_GUARANTEE_LINE}
			</p>
		</>
	);

	// "Everything in the download": pre-sale dates per item (System parts only).
	const arrivesBy = copy.inside.items.map((_, i) =>
		isBundle
			? (assets.find(
					(a) =>
						fileMatchesPart(a.label, OFFER_PARTS[i]?.fileLabel ?? "") &&
						a.availableAt,
				)?.availableAt ?? null)
			: null,
	);

	// Pre-order: the date the last file arrives.
	const lastArrival = assets
		.map((a) => a.availableAt)
		.filter((d): d is Date => !!d)
		.sort((a, b) => b.getTime() - a.getTime())[0];
	const presaleLine = !presale
		? null
		: isBundle && lastArrival
			? presaleNote(formatStoreDay(lastArrival))
			: lastArrival
				? `Pre-order: your files arrive by ${formatStoreDay(lastArrival)}. If we miss that date, you can have a full refund.`
				: null;

	const details: BuyDetail[] = [
		{
			title: "What it is",
			body: description ? (
				<div
					className="rich-text"
					dangerouslySetInnerHTML={{ __html: description }}
				/>
			) : (
				(copy.intro ?? [copy.subhead]).map((p) => <p key={p}>{p}</p>)
			),
		},
		{
			title: "What's inside",
			body: (
				<ul className="grid gap-2">
					{copy.inside.items.map((item) => (
						<li key={item.name} className="flex gap-2.5">
							<Check className="text-primary mt-1 size-3.5 shrink-0" />
							<span>
								<span className="text-foreground font-medium">{item.name}.</span>{" "}
								{item.text}
							</span>
						</li>
					))}
				</ul>
			),
		},
		{
			title: "How to use it",
			body: (
				<ol className="grid gap-2">
					{copy.steps.items.map((step, i) => (
						<li key={step.title} className="flex gap-2.5">
							<span className="text-foreground font-semibold tabular-nums">
								{i + 1}.
							</span>
							<span>
								<span className="text-foreground font-medium">{step.title}.</span>{" "}
								{step.text}
							</span>
						</li>
					))}
				</ol>
			),
		},
		{
			title: "Delivery & refunds",
			body: (
				<DeliveryAndRefunds
					presaleLine={presaleLine}
					supportEmail={contact.supportEmail}
				/>
			),
		},
	];

	// Comparison rows.
	const upgradeBy = system ? system.price - data.price : 0;
	const singleRows: CompareRow[] = OFFER_PARTS.map((part) => ({
		label: part.name,
		ours: { yes: true, text: "Included" },
		theirs: copy.parts.includes(part.fileLabel)
			? { yes: true, text: "Included" }
			: { yes: false, text: "Not included" },
	}));
	const separately =
		(pieces["medical-binder"] ?? 0) + (pieces["caregiver-agreement"] ?? 0);
	const pieceText: Record<string, string | undefined> = {
		"Medical Binder": pieces["medical-binder"]
			? `${formatStorePrice(pieces["medical-binder"])} on its own`
			: undefined,
		"Family Caregiver Agreement": pieces["caregiver-agreement"]
			? `${formatStorePrice(pieces["caregiver-agreement"])} on its own`
			: undefined,
	};
	const bundleRows: CompareRow[] = OFFER_PARTS.map((part) => ({
		label: part.name,
		ours: { yes: true, text: "Included" },
		theirs: pieceText[part.fileLabel]
			? { yes: true, text: pieceText[part.fileLabel]! }
			: { yes: false, text: "Only in the System" },
	}));

	return (
		<main className="flex-1">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={jsonLdHtml(
					productJsonLd({
						title: copy.schemaName ?? copy.h1,
						description: copy.seo.description,
						price: data.price,
						url,
						image: images[0]?.url,
						inStock: data.sellable,
					}),
				)}
			/>

			{/* Buy box */}
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
						<ProductGallery
							images={images}
							title={copy.h1}
							fallback={
								<DocMockup
									kind={DOC_KIND[product.slug] ?? "binder"}
									title={product.title}
								/>
							}
						/>
					</div>

					<div className="grid gap-6">
						<div className="grid gap-3">
							<div className="flex flex-wrap gap-1.5">
								<span className="text-foreground rounded-full border px-3 py-0.5 text-xs font-medium">
									Parentkeeping
								</span>
								{discount > 0 && (
									<span className="rounded-full bg-[#dc3545] px-2.5 py-0.5 text-xs font-semibold text-white">
										-{discount}%
									</span>
								)}
								{presale && (
									<span className="rounded-full bg-[#6c4cf1] px-2.5 py-0.5 text-xs font-semibold text-white">
										Pre-order
									</span>
								)}
							</div>
							<h1 className="text-foreground text-[28px] leading-tight font-semibold tracking-[-0.034em] md:text-[34px]">
								{copy.h1}
							</h1>
							<p className="flex flex-wrap items-baseline gap-x-2.5 tabular-nums">
								<span
									className={cn(
										"text-[30px] font-bold text-primary",
										data.compareAt && "text-[#dc3545]",
									)}
								>
									{formatStorePrice(data.price)}
								</span>
								{data.compareAt && (
									<span className="text-body text-[17px] line-through">
										{formatStorePrice(data.compareAt)}
									</span>
								)}
								{data.foundingEndsAt && (
									<span className="text-foreground text-[14px] font-medium">
										founding price until {formatStoreDay(data.foundingEndsAt)}
									</span>
								)}
							</p>
							<p className="text-primary text-[13px] font-medium">
								{ONE_PRICE_BADGE}
							</p>
						</div>

						<p className="text-foreground text-[18px] leading-snug font-semibold tracking-[-0.02em]">
							{copy.subhead}
						</p>

						<ul className="bg-primary/[0.07] grid gap-2.5 rounded-[10px] p-5">
							{facts.map((f) => {
								const Icon = FACT_ICONS[f.icon];
								return (
									<li
										key={f.text}
										className="text-foreground flex items-start gap-3 text-[14px]"
									>
										<Icon
											className="text-primary mt-0.5 size-4 shrink-0"
											strokeWidth={1.75}
										/>
										{f.text}
									</li>
								);
							})}
						</ul>

						<div id="buy-box" className="grid gap-3">
							{copy.aboveButton && (
								<p className="text-body text-[13px] leading-relaxed">
									{copy.aboveButton}
								</p>
							)}
							{checkoutError && (
								<p className="bg-destructive/10 text-destructive rounded-[10px] p-3 text-sm">
									{checkoutError}
								</p>
							)}
							{buyButton(fullWidthDark)}
							{usVisitor && data.sellable && (
								<p className="text-green flex items-center gap-1.5 text-[14px] font-medium">
									<Zap className="size-4 shrink-0 fill-current" />
									{presale
										? "Pre-order: each file downloads the moment it's ready"
										: "Instant download, ready the moment you pay"}
								</p>
							)}
							<div className="text-body grid gap-1 text-[13px] [&>p]:justify-start">
								{underButton}
							</div>
						</div>

						<GuaranteeCard supportEmail={contact.supportEmail} />

						<div className="grid justify-items-center gap-3 rounded-[10px] bg-[#f5f5f5] p-5">
							<p className="text-foreground text-[15px] font-semibold">
								Guaranteed safe checkout
							</p>
							<ul
								className="flex flex-wrap justify-center gap-1.5"
								aria-label="Accepted cards"
							>
								{["visa", "mastercard", "amex", "discover", "paypal"].map(
									(card) => (
										<li
											key={card}
											className="rounded-[4px] border bg-white p-0.5 text-[11px] font-bold tracking-wide text-[#1a1f36]"
										>
											<Image
												src={`/images/cards/${card}.png`}
												alt={card}
												width={35}
												height={20}
											/>
										</li>
									),
								)}
							</ul>
							<p className="text-body text-xs">
								Secure payment by Stripe. Sales tax is calculated at checkout.
							</p>
						</div>

						<BuyDetails items={details} />

						<div className="flex flex-wrap items-center gap-5">
							{contact.supportEmail && (
								<AskQuestionDialog productTitle={copy.h1} />
							)}
							<ShareDialog title={copy.h1} />
						</div>
					</div>
				</div>
			</div>

			{reviews.length > 0 && <ProductReviews reviews={reviews} />}
			<ProductSteps steps={copy.steps} />
			<ProductHighlights
				slug={product.slug}
				highlights={copy.highlights}
				kinds={HIGHLIGHT_KINDS[product.slug] ?? []}
			/>

			{copy.sections.length > 0 && (
				<section className={`${container} ${section} border-t`}>
					<div
						className={cn(
							"grid gap-10 md:gap-[60px]",
							copy.sections.length > 1 && "md:grid-cols-2",
						)}
					>
						{copy.sections.map((block) => (
							<CopyBlock key={block.title} block={block} />
						))}
					</div>
				</section>
			)}

			<ProductDownloadCard
				inside={copy.inside}
				arrivesBy={arrivesBy}
				assets={isBundle ? [] : assets}
				price={data.price}
				compareAt={data.compareAt}
				buy={buyButton(fullWidthDark)}
				smallPrint={underButton}
			/>

			{isBundle && separately > 0 && (
				<ProductCompare
					eyebrowText="One price"
					title={PRICE_ANCHOR_TITLE}
					text={`The Medical Binder (${formatStorePrice(pieces["medical-binder"])}) and the Caregiver Agreement (${formatStorePrice(pieces["caregiver-agreement"])}) cost ${formatStorePrice(separately)} on their own. The System adds the Shared Family Care Sheet and the Family Meeting Kit, for ${formatStorePrice(data.compareAt ?? data.price)}.${data.compareAt ? ` Founding buyers pay ${formatStorePrice(data.price)}.` : ""}`}
					columns={["Family Care System", "Bought separately"]}
					rows={[
						...bundleRows,
						{
							label: "Price",
							ours: {
								yes: true,
								text: `${formatStorePrice(data.price)} for all four`,
							},
							theirs: {
								yes: false,
								text: `${formatStorePrice(separately)}, without the Sheet or the Meeting Kit`,
							},
						},
					]}
				/>
			)}

			<ProductFaqBand
				items={copy.faq}
				supportEmail={contact.supportEmail}
				legal={copy.legal}
			/>

			{/* Closing block. Singles: the upgrade to the System (always last, per the copy rules). */}
			{copy.upgrade?.priceLine && system && upgradeBy > 0 && (
				<ProductCompare
					eyebrowText="Upgrade to the Family Care System"
					title={copy.upgrade.title}
					text={copy.upgrade.text}
					columns={["Family Care System", SHORT_NAME[product.slug] ?? copy.h1]}
					rows={[
						...singleRows,
						{
							label: "Price",
							ours: {
								yes: true,
								text: `${formatStorePrice(system.price)}${system.compareAt ? " founding price" : ""}`,
							},
							theirs: { yes: true, text: formatStorePrice(data.price) },
						},
					]}
					footer={
						<>
							<p className="text-foreground text-[18px] font-semibold">
								{system.compareAt
									? `Only ${formatStorePrice(upgradeBy)} more at the founding price (${formatStorePrice(system.price)}).`
									: `Only ${formatStorePrice(upgradeBy)} more (${formatStorePrice(system.price)}).`}
							</p>
							<Link href={copy.upgrade.href} className={`${pillDark} gap-2`}>
								{copy.upgrade.cta}
								<ArrowRight className="size-4" />
							</Link>
						</>
					}
				/>
			)}

			{/* The Emergency Binder's cross-sell. */}
			{copy.upgrade && !copy.upgrade.priceLine && (
				<ProductClosingBanner
					eyebrowText="The Family Care System"
					title={copy.upgrade.title}
					text={copy.upgrade.text}
				>
					<Link href={copy.upgrade.href} className={`${pillLight} gap-2`}>
						{copy.upgrade.cta}
						<ArrowRight className="size-4" />
					</Link>
				</ProductClosingBanner>
			)}

			{/* The System: one last Buy. */}
			{isBundle && (
				<ProductClosingBanner
					eyebrowText="The Parentkeeping Family Care System"
					title={OFFER_HEADLINES.fairness}
					text={ONE_PRICE_BADGE}
				>
					{buyButton(pillLight)}
					<div className="grid gap-1 text-xs text-white/75 [&_svg]:text-white">
						{underButton}
					</div>
				</ProductClosingBanner>
			)}

			{usVisitor && data.sellable && (
				<StickyBuyBar
					watchId="buy-box"
					title={copy.h1}
					price={formatStorePrice(data.price)}
					compareAt={data.compareAt ? formatStorePrice(data.compareAt) : null}
				>
					{buyButton(
						"bg-foreground hover:bg-primary flex h-11 w-full items-center justify-center rounded-full px-6 text-[14px] font-semibold text-white transition-colors",
					)}
				</StickyBuyBar>
			)}
		</main>
	);
}
