import Image from "next/image";
import { BUNDLE_SLUG } from "@/lib/catalog";
import type { ProductCopy } from "@/lib/product-copy";
import { cn } from "@/lib/utils";
import { type DocKind, DocMockup } from "../home/doc-mockup";
import { container, eyebrow, media, section, sectionTitle } from "../ui";

/**
 * Same order as the highlight rows (the System's are OFFER_PARTS). 4:3, like
 * the card. Without an alt, the row's title stands in.
 */
const HIGHLIGHT_IMAGES: Record<string, { src: string; alt?: string }[]> = {
	[BUNDLE_SLUG]: [
		{ src: "/images/inside/part-1-medical-binder.png" },
		{ src: "/images/inside/part-2-shared-family-care-sheet.png" },
		{ src: "/images/inside/part-3-caregiver-agreement.png" },
		{ src: "/images/inside/part-4-family-meeting-kit.png" },
	],
	"medical-binder": [
		{
			src: "/images/inside/medical-binder-1-medications.webp",
			alt: "Prescription medication list and changes log from the Medical Binder, ready for a pharmacist review",
		},
		{
			src: "/images/inside/medical-binder-2-appointments.webp",
			alt: "Visit prep and notes page and monthly calendar for an elderly parent's doctor appointments",
		},
		{
			src: "/images/inside/medical-binder-3-who-does-what.webp",
			alt: "Who does what page naming the sibling who handles refills, rides, bills and calls",
		},
		{
			src: "/images/inside/medical-binder-4-sunday-check-in.webp",
			alt: "Sunday check-in page: what changed, what's coming up and what needs a hand",
		},
	],
	"emergency-binder": [
		{
			src: "/images/inside/emergency-binder-1-paramedic-summary.webp",
			alt: "Emergency summary page for the paramedics: conditions, allergies, devices, wishes and who to call, on one page",
		},
		{
			src: "/images/inside/emergency-binder-2-fridge-sheet.webp",
			alt: "Emergency information fridge sheet with a big box for the local emergency number, plus wallet cards and door labels",
		},
		{
			src: "/images/inside/emergency-binder-3-legal-documents.webp",
			alt: "Legal documents locator showing where the advance directive and other originals are kept and who has copies",
		},
		{
			src: "/images/inside/emergency-binder-4-grab-and-go.webp",
			alt: "Grab-and-go checklist for the hospital bag, the first 24 hours page and a family phone tree",
		},
	],
	"caregiver-agreement": [
		{
			src: "/images/inside/caregiver-agreement-1-the-care.webp",
			alt: "Caregiver agreement page listing the care to be provided: rides, meals, medication pickups and bills",
		},
		{
			src: "/images/inside/caregiver-agreement-2-pay.webp",
			alt: "Caregiver agreement pay section: paid or unpaid, how the rate was chosen and how often it's paid",
		},
		{
			src: "/images/inside/caregiver-agreement-3-logs.webp",
			alt: "Time and task log and payment log pages from the family caregiver agreement template",
		},
		{
			src: "/images/inside/caregiver-agreement-4-questions.webp",
			alt: "Talk-first questions for the family and questions for the elder-law attorney before signing",
		},
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
										src={image.src}
										alt={image.alt ?? alt}
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
