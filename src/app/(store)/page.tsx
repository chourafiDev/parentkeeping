import { and, eq, inArray, isNotNull } from "drizzle-orm";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BUMP_SLUG, BUNDLE_SLUG, PRODUCT_PATHS, VARIANT_COOKIE } from "@/lib/catalog";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { MARQUEE } from "@/lib/home";
import { HOME_SEO } from "@/lib/offer";
import { PRODUCT_COPY } from "@/lib/product-copy";
import { PREVIEWS_BY_PRODUCT } from "@/lib/page-previews";
import { siteUrl } from "@/lib/site-url";
import { MIN_REVIEWS_FOR_SUMMARY } from "@/lib/social-proof";
import { db } from "@/server/db";
import { files, productFiles, productImages, products } from "@/server/db/schema";
import { getProductReviews } from "@/server/queries/reviews";
import { getFoundingPrice, getSettings } from "@/server/queries/settings";
import { getSocialProof } from "@/server/queries/social-proof";
import { getPackageExtras } from "@/server/queries/storefront";
import { Bundle } from "./_components/home/bundle";
import { ClosingBanner } from "./_components/home/closing-banner";
import { ClosingStrips } from "./_components/home/closing-strips";
import { Faq } from "./_components/home/faq";
import { HomeHero } from "./_components/home/hero";
import { HowItWorks } from "./_components/home/how-it-works";
import { Marquee } from "./_components/home/marquee";
import { MomentBanner } from "./_components/home/moment-banner";
import { PartsHighlights } from "./_components/home/parts-highlights";
import { type ShopCard, ShopGrid } from "./_components/home/shop-grid";
import { SoundFamiliar } from "./_components/home/sound-familiar";
import type { HomeData, HomeProduct } from "./_components/home/types";
import { UsualWay } from "./_components/home/usual-way";
import { PagePreviews } from "./_components/page-previews";
import { ProblemTabs } from "./_components/problem-tabs";
import { jsonLdHtml, productJsonLd } from "./_components/product-data";

/** The System's main image is the home page's share image too (same content). */
const SYSTEM_COPY = PRODUCT_COPY[BUNDLE_SLUG];

export async function generateMetadata(): Promise<Metadata> {
	const [main] = await db
		.select({ url: productImages.url, alt: productImages.alt, width: productImages.width, height: productImages.height })
		.from(productImages)
		.innerJoin(products, eq(products.id, productImages.productId))
		.where(eq(products.slug, BUNDLE_SLUG))
		.orderBy(productImages.sortOrder)
		.limit(1);
	const images = main
		? [
				{
					url: main.url,
					alt: main.alt || SYSTEM_COPY.schemaName,
					...(main.width && main.height && { width: main.width, height: main.height }),
				},
			]
		: undefined;
	return {
		title: { absolute: HOME_SEO.title },
		description: HOME_SEO.description,
		alternates: { canonical: "/" },
		openGraph: {
			type: "website",
			siteName: "Parentkeeping",
			title: HOME_SEO.title,
			description: HOME_SEO.description,
			url: "/",
			images,
		},
		twitter: {
			card: main ? "summary_large_image" : "summary",
			title: HOME_SEO.title,
			description: HOME_SEO.description,
			images: images?.map((i) => i.url),
		},
	};
}
// Prices, the founding window and headline variant are per request.
export const dynamic = "force-dynamic";

async function loadHome(
	searchParams: Record<string, string | string[] | undefined>,
): Promise<HomeData> {
	const [rows, founding, jar, { contact }, extras, proof] =
		await Promise.all([
			db
				.select()
				.from(products)
				.where(
					inArray(products.slug, [
						BUNDLE_SLUG,
						"medical-binder",
						"caregiver-agreement",
						BUMP_SLUG,
					]),
				),
			getFoundingPrice(),
			cookies(),
			getSettings("contact"),
			getPackageExtras(),
			getSocialProof(),
		]);
	const presale = await db
		.select({
			productId: productFiles.productId,
			label: files.label,
			availableAt: files.availableAt,
		})
		.from(productFiles)
		.innerJoin(files, eq(files.id, productFiles.fileId))
		.where(
			and(
				inArray(
					productFiles.productId,
					rows.map((r) => r.id),
				),
				isNotNull(files.availableAt),
			),
		);
	const images = await db
		.select({ productId: productImages.productId, url: productImages.url })
		.from(productImages)
		.where(
			inArray(
				productImages.productId,
				rows.map((r) => r.id),
			),
		)
		.orderBy(productImages.sortOrder);
	const mainImage = (productId: string) =>
		images.find((i) => i.productId === productId)?.url ?? null;

	const toHome = (slug: string): HomeProduct | null => {
		const p = rows.find((r) => r.slug === slug);
		if (!p) return null;
		const foundingOn =
			founding.active && p.foundingPrice !== null && !!p.foundingPriceId;
		return {
			slug: p.slug,
			title: p.title,
			href: PRODUCT_PATHS[p.slug] ?? "/",
			price: foundingOn ? p.foundingPrice! : p.price,
			compareAt: foundingOn ? p.price : null,
			presale: presale.some((f) => f.productId === p.id),
			sellable:
				p.status === "active" &&
				!!(foundingOn ? p.foundingPriceId : p.stripePriceId),
			image: mainImage(p.id),
		};
	};
	const system = toHome(BUNDLE_SLUG);
	if (!system)
		throw new Error("Family Care System product is missing (run pnpm db:seed)");

	return {
		variant:
			jar.get(VARIANT_COOKIE)?.value === "fairness" ? "fairness" : "one_place",
		system,
		binder: toHome("medical-binder"),
		agreement: toHome("caregiver-agreement"),
		emergencyBinder: extras.emergency ? toHome(BUMP_SLUG) : null,
		foundingEndsAt: system.compareAt !== null ? founding.endsAt : null,
		presaleDates: presale.map((f) => ({
			label: f.label,
			availableAt: f.availableAt!,
		})),
		supportEmail: contact.supportEmail,
		emergency: extras.emergency,
		proof,
		checkoutError:
			typeof searchParams.checkout_error === "string"
				? searchParams.checkout_error
				: null,
	};
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
	const [data, systemReviews] = await Promise.all([
		loadHome(await searchParams),
		getProductReviews(BUNDLE_SLUG, 12),
	]);
	const showReviews = systemReviews.count >= MIN_REVIEWS_FOR_SUMMARY;
	const cards: ShopCard[] = [
		{
			product: data.system,
			kind: "bundle",
			title: data.system.title,
			href: data.system.href,
			tab: "bundle",
		},
		...(data.binder
			? [
					{
						product: data.binder,
						kind: "binder" as const,
						title: data.binder.title,
						href: data.binder.href,
						tab: "single" as const,
					},
				]
			: []),
		...(data.agreement
			? [
					{
						product: data.agreement,
						kind: "agreement" as const,
						title: data.agreement.title,
						href: data.agreement.href,
						tab: "single" as const,
					},
				]
			: []),
		...(data.emergencyBinder
			? [
					{
						product: data.emergencyBinder,
						kind: "binder" as const,
						title: data.emergencyBinder.title,
						href: data.emergencyBinder.href,
						tab: "single" as const,
					},
				]
			: []),
		{
			product: null,
			kind: "list",
			title: "Free Printable Medication List & Daily Medication Chart",
			href: FREE_LIST_PATH,
			tab: "free",
			image: "/images/home/shop-free-list.webp",
		},
	];
	const jsonLd = productJsonLd({
		title: SYSTEM_COPY.schemaName ?? data.system.title,
		description: SYSTEM_COPY.seo.description,
		price: data.system.price,
		url: `${siteUrl()}/`,
		image: data.system.image,
		inStock: data.system.sellable,
		rating:
			showReviews && systemReviews.average !== null
				? { average: systemReviews.average, count: systemReviews.count }
				: null,
	});

	return (
		<main className="flex-1">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={jsonLdHtml(jsonLd)}
			/>
			<HomeHero data={data} />
			<Marquee messages={MARQUEE} />
			<PartsHighlights data={data} />
			<MomentBanner />
			<ProblemTabs />
			<HowItWorks />
			<PagePreviews groupIds={PREVIEWS_BY_PRODUCT[BUNDLE_SLUG]} />
			<Bundle data={data} />
			<SoundFamiliar />
			<UsualWay />
			{/* The other products near the bottom, so the page stays about one offer. */}
			<ShopGrid cards={cards} />
			<Faq data={data} />
			<ClosingStrips data={data} />
			<ClosingBanner data={data} />
		</main>
	);
}
