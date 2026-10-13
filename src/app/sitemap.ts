import type { MetadataRoute } from "next";
import { BLOG_PATH, POSTS, postPath } from "@/lib/blog";
import { QUIZ_PATH } from "@/lib/burnout-quiz";
import { BUMP_SLUG, PRODUCT_PATHS } from "@/lib/catalog";
import { LEAD_MAGNETS } from "@/lib/lead-magnets";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { productFiles, products } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/** Indexable store pages. The System's product URL canonicals to "/", so it's left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteUrl();
	const rows = await db.select({ id: products.id, slug: products.slug, status: products.status }).from(products);
	const live = await Promise.all(
		rows.map(async (p) => {
			if (p.status !== "active" || !PRODUCT_PATHS[p.slug] || p.slug === "family-care-system") return null;
			// The Emergency Binder page exists only once it has files.
			if (p.slug === BUMP_SLUG) {
				const [file] = await db.select({ id: productFiles.fileId }).from(productFiles).where(eq(productFiles.productId, p.id)).limit(1);
				if (!file) return null;
			}
			return PRODUCT_PATHS[p.slug];
		}),
	);
	const pages = [
		"/",
		...live.filter((p): p is string => !!p),
		...Object.values(LEAD_MAGNETS).map((m) => m.path),
		QUIZ_PATH,
		BLOG_PATH,
		"/pages/contact",
		"/pages/disclaimer",
		"/policies/terms-of-service",
		"/policies/privacy-policy",
		"/policies/refund-policy",
	];
	return [
		...pages.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.8 })),
		...POSTS.map((post) => ({ url: `${base}${postPath(post.slug)}`, lastModified: post.updatedAt ?? post.publishedAt, priority: 0.6 })),
	];
}
