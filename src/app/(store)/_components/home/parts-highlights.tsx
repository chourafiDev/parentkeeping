import { fileMatchesPart } from "@/lib/catalog";
import { OFFER_PARTS, PARTS_TITLE } from "@/lib/offer";
import { cn } from "@/lib/utils";
import {
	container,
	media,
	section,
	sectionSubtitle,
	sectionTitle,
} from "../ui";
import { type DocKind, DocMockup } from "./doc-mockup";
import { MediaSlot } from "./media-slot";
import type { HomeData } from "./types";

const KINDS: DocKind[] = ["binder", "sheet", "agreement", "meeting"];

// Fallback panel tones
const TONES = ["bg-[#dfe6df]", "bg-[#e8e4da]", "bg-[#dde3e6]", "bg-[#e9e1dc]"];

const fmtDay = (d: Date) =>
	d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "America/New_York",
	});

export function PartsHighlights({ data }: { data: HomeData }) {
	return (
		<section className={`${container} ${section}`}>
			{/* SECTION HEADER */}
			<div className="mb-8 grid gap-2 text-center md:mb-10">
				<h2 className={sectionTitle}>{PARTS_TITLE}</h2>

				<p className={sectionSubtitle}>
					One price, one promise: one place, shared fairly, no new app.
				</p>
			</div>

			{/* PRODUCT CARDS */}
			<ul
				className={cn(
					"-mx-4 flex snap-x snap-mandatory gap-4",
					"overflow-x-auto px-4 pb-2",
					"[scrollbar-width:none]",
					"sm:mx-0 sm:grid sm:grid-cols-2",
					"sm:gap-[20px] sm:overflow-visible",
					"sm:px-0 sm:pb-0",
					"lg:grid-cols-4",
				)}
			>
				{OFFER_PARTS.map((part, i) => {
					const arrives = data.presaleDates.find((d) =>
						fileMatchesPart(d.label, part.fileLabel),
					)?.availableAt;

					return (
						<li
							key={part.name}
							className="w-[78%] shrink-0 snap-start sm:w-auto"
						>
							<a
								href="#bundle"
								className={cn(
									media,
									"group relative isolate flex",
									"aspect-[4/5] items-end",
									"overflow-hidden text-white",
									TONES[i],
								)}
							>
								{/* BACKGROUND IMAGE WITH HOVER ZOOM */}
								<div
									aria-hidden="true"
									className={cn(
										"pointer-events-none",
										"absolute inset-0 z-0",
										"overflow-hidden",
									)}
								>
									<div
										className={cn(
											"relative h-full w-full",
											"transform-gpu",
											"transition-transform",
											"duration-700 ease-out",
											"motion-safe:group-hover:scale-125",
											"motion-safe:group-focus-visible:scale-125",
											"motion-reduce:transform-none",
										)}
									>
										<MediaSlot
											name={`part-${i + 1}`}
											sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
										>
											{/* FALLBACK MOCKUP */}
											<div
												aria-hidden="true"
												className={cn(
													"absolute inset-0",
													"flex items-start justify-center",
													"px-[18%] pt-[12%]",
												)}
											>
												<DocMockup
													kind={KINDS[i]}
													title={part.name}
													tilt={i % 2 ? 3 : -3}
												/>
											</div>
										</MediaSlot>
									</div>
								</div>

								{/* DARK GRADIENT - FIXED */}
								<span
									aria-hidden="true"
									className={cn(
										"pointer-events-none",
										"absolute inset-0 z-10",
										"bg-gradient-to-t",
										"from-black/65",
										"via-black/10",
										"to-transparent",
									)}
								/>

								{/* PRE-ORDER BADGE */}
								{arrives && (
									<span
										className={cn(
											"absolute top-4 left-4 z-20",
											"rounded-full",
											"bg-[#6c4cf1]",
											"px-3 py-1",
											"text-xs font-semibold",
										)}
									>
										Pre-order · {fmtDay(arrives)}
									</span>
								)}

								{/* CARD CONTENT - FIXED */}
								<span className={cn("relative z-20 grid gap-1", "w-full p-6")}>
									{/* PRODUCT TITLE */}
									<span className="ms-1 text-xs font-medium">0{i + 1}</span>

									<h3
										className={cn(
											"text-[22px] leading-tight mb-4",
											"font-semibold",
											"tracking-[-0.03em]",
										)}
									>
										{part.name}
									</h3>

									{/* PRODUCT DESCRIPTION */}
									<p className="text-sm text-white/85">
										{part.pillar} · {part.format}
									</p>
								</span>
							</a>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
