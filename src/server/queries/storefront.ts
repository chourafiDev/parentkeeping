import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { BUNDLE_SLUG } from "@/lib/catalog";
import { db } from "@/server/db";
import { files, productFiles, productImages, products } from "@/server/db/schema";
import { getFoundingPrice } from "./settings";

/** Has at least one file (uploaded or on pre-sale). */
export async function hasFiles(productId: string) {
	const [row] = await db.select({ id: productFiles.fileId }).from(productFiles).where(eq(productFiles.productId, productId)).limit(1);
	return !!row;
}

/**
 * A product as the store shows it: only active products with a page (the
 * bump only once it has files: the spec holds its page back until the
 * product exists), the price charged now (founding price while the window is
 * open), gallery, files with their pre-sale dates, and the System for the
 * upgrade block on single-product pages.
 */
export async function getStoreProduct(slug: string) {
	const [product] = await db
		.select()
		.from(products)
		.where(and(eq(products.slug, slug), eq(products.status, "active")));
	if (!product || (product.kind === "bump" && !(await hasFiles(product.id)))) return null;

	const [images, assets, founding, [system]] = await Promise.all([
		db
			.select({ url: productImages.url, alt: productImages.alt, width: productImages.width, height: productImages.height })
			.from(productImages)
			.where(eq(productImages.productId, product.id))
			.orderBy(asc(productImages.sortOrder)),
		db
			.select({
				id: files.id,
				label: files.label,
				kind: files.kind,
				fileName: files.fileName,
				sizeBytes: files.sizeBytes,
				storageKey: files.storageKey,
				url: files.url,
				availableAt: files.availableAt,
			})
			.from(productFiles)
			.innerJoin(files, eq(files.id, productFiles.fileId))
			.where(eq(productFiles.productId, product.id))
			.orderBy(asc(productFiles.sortOrder)),
		getFoundingPrice(),
		product.slug === BUNDLE_SLUG
			? Promise.resolve([])
			: db.select().from(products).where(and(inArray(products.slug, [BUNDLE_SLUG]), eq(products.status, "active"))),
	]);

	const priceNow = (p: typeof product) => {
		const foundingOn = founding.active && p.foundingPrice !== null && !!p.foundingPriceId;
		return {
			price: foundingOn ? p.foundingPrice! : p.price,
			compareAt: foundingOn ? p.price : null,
			sellable: p.status === "active" && !!(foundingOn ? p.foundingPriceId : p.stripePriceId),
		};
	};

	return {
		product,
		...priceNow(product),
		foundingEndsAt: priceNow(product).compareAt !== null ? founding.endsAt : null,
		images,
		assets,
		system: system ? { title: system.title, ...priceNow(system) } : null,
	};
}

export type StoreProduct = NonNullable<Awaited<ReturnType<typeof getStoreProduct>>>;
