import { FileText, Handshake, Quote, Sheet } from "lucide-react";
import { PRODUCT_PATHS } from "@/lib/catalog";
import { SOUND_FAMILIAR } from "@/lib/home";
import { container, section, sectionSubtitle, sectionTitle } from "../ui";

const ICON = { "medical-binder": FileText, "family-care-system": Sheet, "caregiver-agreement": Handshake } as const;

/**
 * Glozin's testimonials layout, deliberately NOT reviews (the spec forbids
 * them until real): situations in the reader's voice, no names, no stars,
 * each pointing to the part that helps.
 */
export function SoundFamiliar() {
	return (
		<section className={`${container} ${section}`}>
			<div className="rounded-[10px] bg-[#f5f5f5] px-4 py-12 md:px-10 md:py-[60px]">
				<div className="mb-8 grid gap-2 text-center md:mb-10">
					<h2 className={sectionTitle}>Does this sound like you?</h2>
					<p className={sectionSubtitle}>If you&apos;re the one holding it all together, you&apos;re not alone. Here&apos;s where each part helps.</p>
				</div>
				<ul className="grid gap-[30px] md:grid-cols-3">
					{SOUND_FAMILIAR.map((item) => (
						<li key={item.part} className="grid content-between gap-6 rounded-[10px] bg-white p-6 md:p-[30px]">
							<div className="grid gap-4">
								<Quote className="text-primary size-6" />
								<p className="text-foreground text-[15px] leading-[1.714]">{item.text}</p>
							</div>
							<a href={PRODUCT_PATHS[item.slug] ?? "/"} className="group flex items-center gap-3 border-t pt-5">
								{(() => {
									const Icon = ICON[item.slug];
									return (
										<span className="text-primary flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5]">
											<Icon className="size-5" />
										</span>
									);
								})()}
								<span className="grid">
									<span className="text-body text-xs">What helps</span>
									<span className="text-foreground text-[15px] font-semibold group-hover:underline">{item.part}</span>
								</span>
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
