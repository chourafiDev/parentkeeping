import { BUMP_SLUG, BUNDLE_SLUG, BUY_LABELS } from "./catalog";
import { formatStorePrice } from "./money";

type Offer = { price: number } | null;

/**
 * The System's package picker. DRAFT labels, awaiting approval. The badge
 * says "Recommended", never "Most popular" or "Best value": there are no
 * sales numbers yet, and the add-on isn't discounted.
 */
export function packageOptions({
	system,
	binder,
	emergency,
	presale,
}: {
	system: { price: number; compareAt: number | null };
	binder: Offer;
	emergency: Offer;
	/** The System has pre-sale files. */
	presale: boolean;
}) {
	const systemCta = `${BUY_LABELS[BUNDLE_SLUG]}${presale ? " · Pre-order" : ""}`;
	return [
		...(binder
			? [
					{
						id: "binder",
						slug: "medical-binder",
						title: "Medical Binder",
						note: "The binder on its own",
						price: binder.price,
						cta: BUY_LABELS["medical-binder"],
					},
				]
			: []),
		{
			id: "system",
			slug: BUNDLE_SLUG,
			title: "Family Care System",
			note: "All four parts: binder, shared sheet, agreement, meeting kit",
			price: system.price,
			compareAt: system.compareAt,
			badge: "Recommended",
			cta: systemCta,
		},
		...(emergency
			? [
					{
						id: "system-emergency",
						slug: BUNDLE_SLUG,
						addon: BUMP_SLUG,
						title: "System + Emergency Binder",
						note: "Adds the grab-and-go binder for the ER",
						price: system.price + emergency.price,
						cta: systemCta,
					},
				]
			: []),
	];
}

export const DEFAULT_PACKAGE = "system";

/**
 * Medical Binder / Caregiver Agreement pages: the item the visitor came
 * for, plus the System as a second choice. Defaults to the single item
 * (never pre-selects the pricier option) — the System only earns the
 * click if the visitor picks it.
 */
export function singleUpgradeOptions({
	product,
	system,
}: {
	product: { slug: string; title: string; price: number; compareAt: number | null; presale: boolean };
	system: { price: number; compareAt: number | null };
}) {
	const diff = system.price - product.price;
	return [
		{
			id: "single",
			slug: product.slug,
			title: product.title,
			note: "Just this one",
			price: product.price,
			compareAt: product.compareAt,
			cta: `${BUY_LABELS[product.slug] ?? "Buy now"}${product.presale ? " · Pre-order" : ""}`,
		},
		{
			id: "system",
			slug: BUNDLE_SLUG,
			title: "Family Care System",
			note: diff > 0 ? `All four parts, for ${formatStorePrice(diff)} more` : "All four parts, same price",
			price: system.price,
			compareAt: system.compareAt,
			badge: "All four parts",
			cta: BUY_LABELS[BUNDLE_SLUG],
		},
	];
}

export const DEFAULT_SINGLE_PACKAGE = "single";
