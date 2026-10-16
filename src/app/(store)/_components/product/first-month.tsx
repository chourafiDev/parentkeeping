import type { ProductCopy } from "@/lib/product-copy";
import { container, eyebrow, section, sectionSubtitle, sectionTitle } from "../ui";

/** "Your first month": a four-stop timeline, so the work looks as small as it is. */
export function ProductFirstMonth({ timeline }: { timeline: NonNullable<ProductCopy["firstMonth"]> }) {
	return (
		<section className={`${container} ${section} border-t`}>
			<div className="mx-auto mb-10 grid max-w-[760px] gap-3 text-center md:mb-14">
				<p className={`${eyebrow} text-primary`}>What to expect</p>
				<h2 className={sectionTitle}>{timeline.title}</h2>
				<p className={sectionSubtitle}>{timeline.text}</p>
			</div>
			<ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
				{/* The line joining the stops. */}
				<span aria-hidden className="bg-border absolute top-[11px] right-[12.5%] left-[12.5%] hidden h-px md:block" />
				<span aria-hidden className="bg-border absolute top-3 bottom-3 left-[11px] w-px md:hidden" />
				{timeline.items.map((item) => (
					<li key={item.when} className="relative grid content-start gap-2 ps-10 md:justify-items-center md:ps-0 md:text-center">
						<span className="bg-primary ring-background absolute top-0 left-0 size-[23px] rounded-full ring-[6px] md:static md:mb-2" />
						<p className={`${eyebrow} text-primary`}>{item.when}</p>
						<p className="text-foreground text-[17px] font-semibold tracking-[-0.02em]">{item.title}</p>
						<p className="text-body text-[15px] leading-[1.65]">{item.text}</p>
					</li>
				))}
			</ol>
		</section>
	);
}
