import type { ProductCopy } from "@/lib/product-copy";
import { container, eyebrow, section, sectionTitle } from "../ui";

/** "How it works": three steps under an accent rule (Slate's three columns). */
export function ProductSteps({ steps }: { steps: ProductCopy["steps"] }) {
	return (
		<section className={`${container} ${section}`}>
			<div className="mx-auto mb-10 grid max-w-[760px] gap-3 text-center md:mb-14">
				<p className={`${eyebrow} text-primary`}>How it works</p>
				<h2 className={sectionTitle}>{steps.title}</h2>
			</div>
			<ol className="grid gap-10 md:grid-cols-3 md:gap-[30px]">
				{steps.items.map((step, i) => (
					<li key={step.title} className="border-primary grid content-start gap-3 border-t-2 pt-6">
						<span className="text-primary text-[13px] font-semibold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
						<h3 className="text-foreground text-[18px] leading-snug font-semibold tracking-[-0.02em]">{step.title}</h3>
						<p className="text-body text-[15px] leading-[1.714]">{step.text}</p>
					</li>
				))}
			</ol>
			{steps.note && <p className="text-body mt-10 rounded-[10px] bg-[#f5f5f5] p-5 text-center text-[15px]">{steps.note}</p>}
		</section>
	);
}
