import type { ProductCopy } from "@/lib/product-copy";
import { cn } from "@/lib/utils";
import { MediaSlot } from "../home/media-slot";
import { container, eyebrow, media, section, sectionTitle } from "../ui";

/** Steps are usually three columns; two steps split the row in half instead of leaving a gap. */
const COLS = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" } as const;

/** Per product, same order as its steps: what public/images/products/<slug>-step-<n> shows. */
const STEP_IMAGE_ALTS: Record<string, string[]> = {
	"family-care-system": [
		"Family Meeting Kit agenda with a list of jobs agreed and a name on each job",
		"Medical Binder pages filled in on screen: About Mom or Dad and Who does what",
		"Shared care sheet job board showing each sibling's job, owner and status",
	],
	"medical-binder": [
		"Three printed copies of the Medical Binder, one for each sibling and one for Mom's house",
		"Who does what page from the Medical Binder, with a named sibling and a day for every job",
	],
	"caregiver-agreement": [
		"Talk-first page of the family caregiver agreement with a checklist of questions to agree as a family",
		"Family caregiver agreement template pages filled in, 17 sections in plain words, fillable PDF and Word",
		"List of questions to bring to an elder-law attorney before signing a caregiver agreement",
	],
};

/**
 * "How it works": solid step cards, picture on the left, text on a sage tint
 * (same look as the home page's sharing steps). Pictures come from
 * public/images/products/<slug>-step-<n>.webp|jpg|png; until then the step
 * number stands in.
 */
export function ProductSteps({ slug, steps }: { slug: string; steps: ProductCopy["steps"] }) {
	return (
		<section className={`${container} ${section}`}>
			<div className="mx-auto mb-10 grid max-w-[760px] gap-3 text-center md:mb-14">
				<p className={`${eyebrow} text-primary`}>How it works</p>
				<h2 className={sectionTitle}>{steps.title}</h2>
			</div>
			<ol className={cn("grid gap-5 lg:gap-[30px]", COLS[Math.min(steps.items.length, 4) as keyof typeof COLS] ?? COLS[3])}>
				{steps.items.map((step, i) => {
					const number = String(i + 1).padStart(2, "0");
					return (
						<li key={step.title} className="bg-accent grid grid-cols-[40%_1fr] overflow-hidden rounded-[10px]">
							<div className={`${media} from-deep to-primary min-h-[220px] rounded-none bg-gradient-to-br`}>
								{/* Portrait pictures on their own green: contain, so nothing is cut off. */}
								<MediaSlot
									dir="products"
									name={`${slug}-step-${i + 1}`}
									alt={STEP_IMAGE_ALTS[slug]?.[i] ?? step.title}
									sizes="(min-width: 768px) 15vw, 40vw"
									className="object-contain"
								>
									<span
										aria-hidden
										className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_30%_20%,rgb(255_255_255/0.18)_0%,transparent_70%)]"
									/>
									<span
										aria-hidden
										className="absolute inset-0 flex items-center justify-center text-[56px] leading-none font-semibold tracking-[-0.04em] text-white/90"
									>
										{number}
									</span>
								</MediaSlot>
							</div>
							<div className="grid content-start justify-items-start gap-3 p-5 lg:p-6">
								<span className="text-primary rounded-md bg-white px-3 py-1.5 text-[13px] font-bold tracking-[0.02em] uppercase">
									Step {i + 1}
								</span>
								<h3 className="text-foreground text-[19px] leading-tight font-semibold tracking-[-0.02em]">{step.title}</h3>
								<p className="text-body text-[15px] leading-[1.6]">{step.text}</p>
							</div>
						</li>
					);
				})}
			</ol>
			{steps.note && <p className="text-body mt-8 text-center text-[15px] leading-[1.714]">{steps.note}</p>}
		</section>
	);
}
