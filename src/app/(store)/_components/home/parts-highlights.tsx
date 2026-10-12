import { OFFER_PARTS } from "@/lib/offer";
import { cn } from "@/lib/utils";
import { container, media, section, sectionSubtitle, sectionTitle } from "../ui";
import { DocMockup, type DocKind } from "./doc-mockup";
import { MediaSlot } from "./media-slot";
import type { HomeData } from "./types";

const KINDS: DocKind[] = ["binder", "sheet", "agreement", "meeting"];
// Fallback panel tones (sage family) so the four cards read as a set.
const TONES = ["bg-[#dfe6df]", "bg-[#e8e4da]", "bg-[#dde3e6]", "bg-[#e9e1dc]"];

const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

/** Glozin "Category Highlights" → the four parts of the System. */
export function PartsHighlights({ data }: { data: HomeData }) {
	return (
		<section className={`${container} ${section}`}>
			<div className="mb-8 grid gap-2 text-center md:mb-10">
				<h2 className={sectionTitle}>What&apos;s inside</h2>
				<p className={sectionSubtitle}>Four parts, one price, one promise: one place, shared fairly, no new app.</p>
			</div>
			{/* Phones: a swipeable row (like Glozin's collection slider); grid from small tablets up. */}
			<ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-[30px] sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
				{OFFER_PARTS.map((part, i) => {
					const arrives = data.presaleDates.find((d) => d.label.startsWith(part.fileLabel))?.availableAt;
					return (
						<li key={part.name} className="w-[78%] shrink-0 snap-start sm:w-auto">
							<a href="#bundle" className={cn(media, "group flex aspect-[4/5] items-end text-white", TONES[i])}>
								<MediaSlot name={`part-${i + 1}`} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw">
									<div aria-hidden className="absolute inset-0 -z-10 flex items-start justify-center px-[18%] pt-[12%] transition-transform duration-500 group-hover:scale-[1.04]">
										<DocMockup kind={KINDS[i]} title={part.name} tilt={i % 2 ? 3 : -3} />
									</div>
								</MediaSlot>
								<span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
								{arrives && (
									<span className="absolute top-4 left-4 rounded-full bg-[#6c4cf1] px-3 py-1 text-xs font-semibold">
										Pre-order · {fmtDay(arrives)}
									</span>
								)}
								<span className="grid gap-1 p-6">
									<span className="text-[22px] leading-tight font-semibold tracking-[-0.03em]">
										{part.name}
										<sup className="ms-1 text-xs font-medium">0{i + 1}</sup>
									</span>
									<span className="text-sm text-white/85">
										{part.pillar} · {part.format}
									</span>
								</span>
							</a>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
