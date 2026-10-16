import { existsSync } from "node:fs";
import path from "node:path";
import { PREVIEW_GROUPS } from "@/lib/page-previews";
import { container, eyebrow, section, sectionSubtitle, sectionTitle } from "./ui";
import { PagePreviewsCarousel } from "./page-previews-carousel";

const EXTENSIONS = ["webp", "jpg", "png"];

/** public/images/pages/<group>/<page>.<ext>, when it's there. */
function previewImage(group: string, page: string) {
	const ext = EXTENSIONS.find((e) => existsSync(path.join(process.cwd(), "public/images/pages", group, `${page}.${e}`)));
	return ext ? `/images/pages/${group}/${page}.${ext}` : null;
}

/**
 * "See every page": people can't flip through a PDF before buying, so show
 * them each page and why it's there. Real page images when they exist,
 * drawn pages until then.
 */
export function PagePreviews({ groupIds, bordered = false }: { groupIds: string[]; bordered?: boolean }) {
	const groups = groupIds
		.map((id) => PREVIEW_GROUPS[id])
		.filter(Boolean)
		.map((g) => ({ ...g, pages: g.pages.map((p) => ({ ...p, image: previewImage(g.id, p.slug) })) }));
	if (groups.length === 0) return null;

	return (
		<section className={`${container} ${section} ${bordered ? "border-t" : ""}`}>
			<div className="mx-auto mb-8 grid max-w-[760px] gap-3 text-center md:mb-10">
				<p className={`${eyebrow} text-primary`}>Look inside</p>
				<h2 className={sectionTitle}>Know exactly what you&apos;re getting</h2>
				<p className={sectionSubtitle}>
					Every section of the download, and what each one is for.
				</p>
			</div>
			<PagePreviewsCarousel groups={groups} />
		</section>
	);
}
