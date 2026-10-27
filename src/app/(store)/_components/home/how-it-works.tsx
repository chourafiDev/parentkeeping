import { Copy, Scale, UserPlus } from "lucide-react";
import { ONLY_CHILD_NOTE, SHARING_STEPS, SHARING_TITLE } from "@/lib/offer";
import { container, eyebrow, media, section, sectionTitle } from "../ui";
import { MediaSlot } from "./media-slot";

/** Same order as SHARING_STEPS; shown until public/images/home/sharing-<n> exists. */
const STEP_ICONS = [Copy, UserPlus, Scale];

/** Same order as SHARING_STEPS: what public/images/home/sharing-<n> shows. */
const STEP_IMAGE_ALTS = [
	"Make a copy of the Shared Family Care Sheet into your own Google account in one click",
	"Share the care sheet with siblings as editors, on a phone or laptop",
	"Care sheet showing each sibling's hours this month and who pays whom to even up the costs",
];

/** How sharing works: three solid step cards, picture on the left, text on a sage tint. */
export function HowItWorks() {
	return (
		<section id="how-it-works" className={`${container} ${section} scroll-mt-28`}>
			<div className="mb-8 text-center grid gap-2 md:mb-10">
				<p className={`${eyebrow} text-primary`}>How sharing works</p>
				<h2 className={sectionTitle}>{SHARING_TITLE}</h2>
			</div>
			<ol className="grid gap-5 md:grid-cols-3 lg:gap-[30px]">
				{SHARING_STEPS.map((step, i) => {
					const Icon = STEP_ICONS[i] ?? Copy;
					return (
						<li key={step.title} className="bg-accent grid grid-cols-[40%_1fr] overflow-hidden rounded-[10px]">
							<div className={`${media} from-deep to-primary min-h-[220px] rounded-none bg-gradient-to-br`}>
								{/* Portrait pictures on their own green: contain, so nothing is cut off. */}
								<MediaSlot
									name={`sharing-${i + 1}`}
									alt={STEP_IMAGE_ALTS[i] ?? step.title}
									sizes="(min-width: 768px) 15vw, 40vw"
									className="object-contain"
								>
									<span
										aria-hidden
										className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_30%_20%,rgb(255_255_255/0.18)_0%,transparent_70%)]"
									/>
									<div className="absolute inset-0 flex items-center justify-center">
										<span className="grid size-16 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25">
											<Icon aria-hidden className="size-7" strokeWidth={1.6} />
										</span>
									</div>
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
			<p className="text-body text-center mt-8 text-[15px] leading-[1.714]">{ONLY_CHILD_NOTE}</p>
		</section>
	);
}
