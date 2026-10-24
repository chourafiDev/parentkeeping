import Image from "next/image";
import { BUNDLE_SLUG } from "@/lib/catalog";
import type { ProductCopy } from "@/lib/product-copy";
import { cn } from "@/lib/utils";
import { type DocKind, DocMockup } from "../home/doc-mockup";
import { container, eyebrow, media, section, sectionTitle } from "../ui";

/** Same order as the highlight rows (the System's are OFFER_PARTS). 4:3, like the card. */
const HIGHLIGHT_IMAGES: Record<string, string[]> = {
	[BUNDLE_SLUG]: [
		"/images/inside/part-1-medical-binder.png",
		"/images/inside/part-2-shared-family-care-sheet.png",
		"/images/inside/part-3-caregiver-agreement.png",
		"/images/inside/part-4-family-meeting-kit.png",
	],
};

/**
 * "What it does": zig-zag rows, picture on a sage gradient card, two-tone
 * title. Pictures come from HIGHLIGHT_IMAGES; without one a drawn page
 * stands in.
 */
export function ProductHighlights({
	slug,
	highlights,
	kinds,
}: {
	slug: string;
	highlights: ProductCopy["highlights"];
	kinds: DocKind[];
}) {
	const images = HIGHLIGHT_IMAGES[slug] ?? [];
	return (
		<section className={`${container} ${section} border-t`}>
			<div className="mx-auto mb-10 grid max-w-[760px] gap-3 text-center md:mb-14">
				<p className={`${eyebrow} text-primary`}>What&apos;s inside</p>
				<h2 className={sectionTitle}>{highlights.title}</h2>
			</div>
			<div className="grid gap-14 md:gap-[70px]">
				{highlights.items.map((item, i) => {
					const alt = item.title.filter(Boolean).join(" ");
					const image = images[i];
					return (
						<div
							key={`${i}-${item.tag}`}
							className="grid items-center gap-8 md:grid-cols-2 lg:gap-[60px]"
						>
							<div
								className={cn(
									media,
									"from-deep to-primary aspect-[4/3] bg-gradient-to-br",
									i % 2 === 1 && "md:order-2",
								)}
							>
								{image ? (
									<Image
										src={image}
										alt={alt}
										fill
										sizes="(min-width: 768px) 50vw, 100vw"
										className="object-cover"
									/>
								) : (
									<>
										<span
											aria-hidden
											className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_30%_20%,rgb(255_255_255/0.16)_0%,transparent_70%)]"
										/>
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="w-[38%] max-w-[230px]">
												<DocMockup
													kind={kinds[i] ?? kinds[0] ?? "binder"}
													title={alt}
													tilt={i % 2 ? 4 : -4}
												/>
											</div>
										</div>
									</>
								)}
							</div>
							<div className="grid content-start justify-items-start gap-4">
								<span className="text-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[13px]">
									<span
										aria-hidden
										className="bg-primary size-1.5 rounded-full"
									/>
									{item.tag}
								</span>
								<h3 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.034em] md:text-[35px]">
									<span className="text-foreground block">{item.title[0]}</span>
									{item.title[1] && (
										<span className="text-primary block">{item.title[1]}</span>
									)}
								</h3>
								<p className="text-body text-[16px] leading-[1.714]">
									{item.text}
								</p>
								{item.meta && (
									<p className="text-foreground text-[14px] font-semibold">
										{item.meta}
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
