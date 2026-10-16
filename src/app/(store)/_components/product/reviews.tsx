"use client";

import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef } from "react";
import type { ReviewCard } from "@/lib/reviews";
import { averageLabel, MIN_REVIEWS_FOR_SUMMARY } from "@/lib/social-proof";
import { cn } from "@/lib/utils";
import { container, eyebrow, section, sectionTitle } from "../ui";

export function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
	return (
		<span className="flex gap-0.5" role="img" aria-label={`${averageLabel(rating)} out of 5 stars`}>
			{Array.from({ length: 5 }, (_, i) => {
				// Partial star for averages (4.6 → the fifth star 60% filled).
				const fill = Math.max(0, Math.min(1, rating - i));
				return (
					<span key={i} className={cn("relative", size === "md" ? "size-5" : "size-3.5")}>
						<Star className="absolute inset-0 size-full fill-[#e5e5e5] text-[#e5e5e5]" />
						<span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
							<Star className={cn("fill-[#f5a524] text-[#f5a524]", size === "md" ? "size-5" : "size-3.5")} />
						</span>
					</span>
				);
			})}
		</span>
	);
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "America/New_York" });

/** Verified-buyer reviews: summary (once there are enough), then a row of cards that scrolls sideways. */
export function ProductReviews({ reviews, count, average }: { reviews: ReviewCard[]; count: number; average: number | null }) {
	const rail = useRef<HTMLUListElement>(null);
	const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });
	const summary = average !== null && count >= MIN_REVIEWS_FOR_SUMMARY;

	return (
		<section id="reviews" className={`${container} ${section} scroll-mt-28 border-t`}>
			<div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
				<div className="grid gap-3">
					<p className={`${eyebrow} text-primary`}>From verified buyers</p>
					<h2 className={sectionTitle}>What families say</h2>
					{summary && (
						<p className="text-foreground flex items-center gap-2.5 text-[15px]">
							<Stars rating={average} size="md" />
							<span className="font-semibold">{averageLabel(average)} out of 5</span>
							<span className="text-body">
								· {count} review{count === 1 ? "" : "s"}
							</span>
						</p>
					)}
				</div>
				<div className="hidden shrink-0 gap-2 md:flex">
					<button type="button" onClick={() => scroll(-1)} aria-label="Previous reviews" className="hover:border-foreground grid size-9 place-items-center rounded-full border transition-colors">
						<ChevronLeft className="size-4" />
					</button>
					<button type="button" onClick={() => scroll(1)} aria-label="Next reviews" className="hover:border-foreground grid size-9 place-items-center rounded-full border transition-colors">
						<ChevronRight className="size-4" />
					</button>
				</div>
			</div>

			<ul ref={rail} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 md:gap-[30px]">
				{reviews.map((r) => (
					<li
						key={r.id}
						className="grid w-[85%] shrink-0 snap-start content-between gap-6 rounded-[10px] border bg-white p-6 sm:w-[calc(50%-8px)] lg:w-[calc((100%-60px)/3)]"
					>
						<div className="grid gap-3">
							{r.placeholder && (
								<span className="justify-self-start rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">Placeholder</span>
							)}
							<Stars rating={r.rating} />
							<p className="text-foreground text-[17px] leading-snug font-semibold tracking-[-0.02em]">{r.headline}</p>
							<p className="text-body text-[15px] leading-[1.714] whitespace-pre-line">{r.body}</p>
						</div>
						<div className="flex items-center gap-3 border-t pt-4">
							<span className="bg-muted text-foreground grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold">{r.name.charAt(0)}</span>
							<div className="grid gap-0.5">
								<p className="text-foreground text-[14px] font-semibold">{r.name}</p>
								<p className="text-body flex items-center gap-1 text-[12px]">
									<BadgeCheck className="text-primary size-3.5" />
									Verified buyer{r.placeholder ? "" : ` · ${fmtDate(r.date)}`}
								</p>
							</div>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}

/** Stars + count by the title, linking down to the reviews. Only with enough reviews. */
export function RatingSummary({ count, average }: { count: number; average: number | null }) {
	if (average === null || count < MIN_REVIEWS_FOR_SUMMARY) return null;
	return (
		<a href="#reviews" className="text-foreground flex w-fit items-center gap-2 text-[14px] hover:underline">
			<Stars rating={average} />
			<span className="font-semibold">{averageLabel(average)} / 5.0</span>
			<span className="text-body">
				({count} review{count === 1 ? "" : "s"})
			</span>
		</a>
	);
}
