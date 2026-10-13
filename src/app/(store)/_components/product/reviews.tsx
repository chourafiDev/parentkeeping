"use client";

import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef, useState } from "react";
import type { Review } from "@/lib/reviews";
import { cn } from "@/lib/utils";
import { container, eyebrow, section, sectionSubtitle, sectionTitle } from "../ui";

function Stars({ rating }: { rating: number }) {
	return (
		<span className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
			{Array.from({ length: 5 }, (_, i) => (
				<Star key={i} className={cn("size-3.5", i < rating ? "fill-[#f5a524] text-[#f5a524]" : "fill-[#e5e5e5] text-[#e5e5e5]")} />
			))}
		</span>
	);
}

/** Slate's reviews block: topic tabs, then a row of review cards that scrolls sideways. */
export function ProductReviews({ reviews }: { reviews: Review[] }) {
	const topics = ["All", ...new Set(reviews.map((r) => r.topic))];
	const [topic, setTopic] = useState("All");
	const rail = useRef<HTMLUListElement>(null);
	const shown = topic === "All" ? reviews : reviews.filter((r) => r.topic === topic);
	const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });

	return (
		<section className={`${container} ${section} border-t`}>
			<div className="mx-auto mb-8 grid max-w-[760px] gap-3 text-center md:mb-10">
				<p className={`${eyebrow} text-primary`}>From families using it</p>
				<h2 className={sectionTitle}>What families say</h2>
				<p className={sectionSubtitle}>In their own words.</p>
			</div>

			<div className="mb-6 flex items-center justify-between gap-4">
				<div className="flex gap-2 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Review topics">
					{topics.map((t) => (
						<button
							key={t}
							type="button"
							role="tab"
							aria-selected={t === topic}
							onClick={() => setTopic(t)}
							className={cn(
								"shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors",
								t === topic ? "bg-foreground border-foreground text-white" : "text-foreground hover:border-foreground",
							)}
						>
							{t}
						</button>
					))}
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
				{shown.map((r, i) => (
					<li
						key={`${topic}-${i}`}
						className="grid w-[85%] shrink-0 snap-start content-between gap-6 rounded-[10px] border bg-white p-6 sm:w-[calc(50%-8px)] lg:w-[calc((100%-60px)/3)]"
					>
						<div className="grid gap-3">
							{r.placeholder && (
								<span className="justify-self-start rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">Placeholder</span>
							)}
							<p className="text-body text-[15px] leading-[1.714]">{r.text}</p>
						</div>
						<div className="flex items-center gap-3 border-t pt-4">
							<span className="bg-muted text-foreground grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold">{r.name.charAt(0)}</span>
							<div className="grid gap-0.5">
								<p className="text-foreground flex items-center gap-2 text-[14px] font-semibold">
									{r.name}
									<Stars rating={r.rating} />
								</p>
								{r.verified && (
									<p className="text-body flex items-center gap-1 text-[12px]">
										<BadgeCheck className="text-primary size-3.5" />
										Verified buyer
									</p>
								)}
							</div>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
