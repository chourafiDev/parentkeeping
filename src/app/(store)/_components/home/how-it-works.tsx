import { ONLY_CHILD_NOTE, SHARING_STEPS, SHARING_TITLE } from "@/lib/offer";
import { container, eyebrow, section, sectionTitle } from "../ui";

/** How sharing works: three numbered steps (Glozin icon-box rhythm). */
export function HowItWorks() {
	return (
		<section id="how-it-works" className={`${container} ${section} scroll-mt-28`}>
			<div className="mb-8 grid gap-2 text-center md:mb-10">
				<p className={`${eyebrow} text-primary`}>How sharing works</p>
				<h2 className={sectionTitle}>{SHARING_TITLE}</h2>
			</div>
			<ol className="grid gap-[30px] md:grid-cols-3">
				{SHARING_STEPS.map((step, i) => (
					<li key={step.title} className="grid content-start gap-3">
						<span className="text-primary text-[44px] leading-none font-semibold tracking-[-0.04em]">0{i + 1}</span>
						<h3 className="text-foreground text-[18px] font-semibold tracking-[-0.02em]">{step.title}</h3>
						<p className="text-body text-[15px] leading-[1.714]">{step.text}</p>
					</li>
				))}
			</ol>
			<p className="bg-muted/70 text-body mt-10 rounded-[10px] p-5 text-center text-[15px]">{ONLY_CHILD_NOTE}</p>
		</section>
	);
}
