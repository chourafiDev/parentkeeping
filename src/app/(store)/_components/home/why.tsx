import { HandHeart, Layers, ShieldCheck, Smartphone } from "lucide-react";
import { WHY } from "@/lib/home";
import { container, eyebrow, section, sectionSubtitle, sectionTitle } from "../ui";

const ICONS = { "one-place": Layers, fair: HandHeart, "no-app": Smartphone, guarantee: ShieldCheck };

/** Glozin "Why choose us" + icon boxes → the three pillars and the guarantee. */
export function Why() {
	return (
		<section className={`${container} ${section}`}>
			<div className="mb-8 grid gap-2 text-center md:mb-12">
				<p className={`${eyebrow} text-primary`}>Why Parentkeeping</p>
				<h2 className={sectionTitle}>One place. Shared fairly. No new app.</h2>
				<p className={sectionSubtitle}>Built for the adult child who has become the default keeper of Mom or Dad&apos;s care.</p>
			</div>
			<ul className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
				{WHY.map((item) => {
					const Icon = ICONS[item.icon];
					return (
						<li key={item.title} className="grid content-start gap-3">
							<Icon className="text-foreground size-8" strokeWidth={1.5} />
							<h3 className="text-foreground mt-2 text-[17px] font-semibold tracking-[-0.02em]">{item.title}</h3>
							<p className="text-body text-[15px] leading-[1.714]">{item.text}</p>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
