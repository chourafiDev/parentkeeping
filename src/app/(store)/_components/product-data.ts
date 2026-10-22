import "server-only";
import { headers } from "next/headers";

/** Visitor country from the edge; development can preview with ?country=GB. */
export async function visitorCountry(devParam: unknown) {
	if (process.env.NODE_ENV !== "production" && typeof devParam === "string") return devParam.toUpperCase();
	return (await headers()).get("x-vercel-ip-country");
}

/** Main English-speaking markets for Google's merchant listings (the store sells worldwide). */
const LISTING_COUNTRIES = ["US", "CA", "GB", "IE", "AU", "NZ"];

/** schema.org Product (name, price, USD, availability) for search engines. */
export function productJsonLd(p: {
	title: string;
	description: string;
	/** Price charged now, in cents. */
	price: number;
	url: string;
	/** Main image first (Google may show any of them). */
	image?: string | string[] | null;
	inStock: boolean;
	/** Published verified-buyer reviews (only passed once there are enough to summarize). */
	rating?: { average: number; count: number } | null;
}) {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: p.title,
		description: p.description,
		...(p.image?.length && { image: p.image }),
		brand: { "@type": "Brand", name: "Parentkeeping" },
		...(p.rating && {
			aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating.average.toFixed(1), reviewCount: p.rating.count, bestRating: 5, worstRating: 1 },
		}),
		offers: {
			"@type": "Offer",
			url: p.url,
			priceCurrency: "USD",
			price: (p.price / 100).toFixed(2),
			availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
			// Digital download: free, delivered instantly (not "doesNotShip", which means unavailable).
			shippingDetails: {
				"@type": "OfferShippingDetails",
				shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
				shippingDestination: LISTING_COUNTRIES.map((addressCountry) => ({ "@type": "DefinedRegion", addressCountry })),
				deliveryTime: {
					"@type": "ShippingDeliveryTime",
					handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
					transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
				},
			},
			// The 14-day "if it doesn't help" guarantee: refund by email, nothing to send back.
			hasMerchantReturnPolicy: {
				"@type": "MerchantReturnPolicy",
				applicableCountry: LISTING_COUNTRIES,
				returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
				merchantReturnDays: 14,
				returnFees: "https://schema.org/FreeReturn",
			},
		},
	};
}

/** JSON for a <script type="application/ld+json">: "<" escaped so data can't close the tag. */
export const jsonLdHtml = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
