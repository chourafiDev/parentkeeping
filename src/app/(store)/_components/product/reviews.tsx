"use client";

import { BadgeCheck, Star } from "lucide-react";
import { useState } from "react";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { REVIEW_TABS, type ReviewCard } from "@/lib/reviews";

import { averageLabel, MIN_REVIEWS_FOR_SUMMARY } from "@/lib/social-proof";

import { cn } from "@/lib/utils";

import { container, eyebrow, section, sectionTitle } from "../ui";

// ==========================================
// STAR RATING
// ==========================================

export function Stars({
	rating,
	size = "sm",
}: {
	rating: number;
	size?: "sm" | "md";
}) {
	const value = Math.max(0, Math.min(5, rating));

	return (
		<span
			className="flex gap-0.5"
			role="img"
			aria-label={`${value.toFixed(1)} out of 5 stars`}
		>
			{Array.from({ length: 5 }, (_, i) => {
				const fill = Math.max(0, Math.min(1, value - i));

				return (
					<span
						key={i}
						className={cn(
							"relative shrink-0",
							size === "md" ? "size-5" : "size-3.5",
						)}
					>
						<Star className="absolute inset-0 size-full fill-[#e5e5e5] text-[#e5e5e5]" />

						<span
							className="absolute inset-0 overflow-hidden"
							style={{ width: `${fill * 100}%` }}
						>
							<Star
								className={cn(
									"fill-[#f5a524] text-[#f5a524]",
									size === "md" ? "size-5" : "size-3.5",
								)}
							/>
						</span>
					</span>
				);
			})}
		</span>
	);
}

// ==========================================
// DATE FORMAT
// ==========================================

const fmtDate = (iso: string) =>
	new Date(iso).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "America/New_York",
	});

// ==========================================
// REVIEW CARD
// ==========================================

function ReviewItem({ review }: { review: ReviewCard }) {
	return (
		<article
			className={cn(
				"flex h-full min-h-[330px] w-full flex-col justify-between",
				"rounded-[18px] border border-[#E5E7E3]",
				"bg-white p-5",
				"transition-colors duration-200",
				"hover:border-[#C8D4C9]",
			)}
		>
			{/* CARD CONTENT */}
			<div className="flex flex-col gap-4">
				{/* RATING */}
				<div className="flex items-center gap-2">
					<Stars rating={review.rating} />

					<span className="text-foreground text-xs font-semibold">
						({review.rating.toFixed(1)})
					</span>
				</div>

				{/* HEADLINE */}
				<h4 className="text-[21px] font-semibold leading-[1.25] tracking-[-0.03em] text-[#1F2A24] sm:text-[23px]">
					{review.headline}
				</h4>

				{/* BODY */}
				<p className="whitespace-pre-line text-[15px] leading-[1.85] text-[#56615B] sm:text-[16px]">
					{review.body}
				</p>
			</div>

			{/* CARD FOOTER */}
			<div className="mt-8 border-t border-[#E5E7E3] pt-5">
				<div className="flex items-center gap-3">
					{/* AVATAR */}
					<span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F3F3F0] text-[16px] font-semibold text-[#1F2A24]">
						{review.name.trim().charAt(0).toUpperCase() || "?"}
					</span>

					{/* NAME + STATUS */}
					<div className="grid gap-1">
						<p className="text-[14px] font-semibold text-[#1F2A24]">
							{review.name}
						</p>

						<p className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#5E6A63]">
							<span>Verified Buyer</span>
							<BadgeCheck className="size-4 text-[#5D7D68]" />
						</p>
					</div>
				</div>
			</div>
		</article>
	);
}

// ==========================================
// PRODUCT REVIEWS
// STATIC DATA + SHADCN TABS + CAROUSEL
// ==========================================

export function ProductReviews() {
	const [activeTabId, setActiveTabId] = useState(REVIEW_TABS[0].id);

	const activeTab =
		REVIEW_TABS.find((tab) => tab.id === activeTabId) ?? REVIEW_TABS[0];

	return (
		<section
			id="reviews"
			className={`${container} ${section} scroll-mt-28 border-t`}
		>
			{/* SECTION HEADER */}
			<div className="mb-8 grid gap-3">
				<p className={`${eyebrow} text-primary`}>MADE FOR FAMILY CAREGIVERS</p>

				<h2 className={sectionTitle}>What matters to families</h2>

				<p className="text-body max-w-2xl text-[14px] leading-relaxed">
					Explore common caregiving concerns, from managing medications and
					organizing paperwork to sharing responsibilities with family.
				</p>
			</div>

			{/* CATEGORY TABS */}
			<Tabs
				value={activeTabId}
				onValueChange={setActiveTabId}
				className="w-full"
			>
				<div className="-mx-4 mb-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
					<TabsList
						className={cn(
							"flex h-auto w-max min-w-full",
							"justify-start gap-2 bg-transparent p-0",
						)}
					>
						{REVIEW_TABS.map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								className={cn(
									"shrink-0 rounded-full border",
									"border-[#DDE3DC]",
									"bg-white px-5 py-3",
									"text-[13px] font-semibold",
									"text-[#53665A]",
									"transition-all duration-200",
									"hover:border-[#4F6F5A]",
									"data-[state=active]:border-[#24332B]",
									"data-[state=active]:bg-[#24332B]",
									"data-[state=active]:text-white",
									"data-[state=active]:shadow-sm",
								)}
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				{/* CAROUSEL FOR SELECTED CATEGORY */}
				<TabsContent value={activeTab.id} className="mt-0 outline-none">
					<Carousel
						key={activeTab.id}
						opts={{
							align: "start",
							containScroll: "trimSnaps",
							loop: false,
						}}
						className="w-full"
					>
						{/* FIVE STATIC CARDS */}
						<CarouselContent className="-ml-4 items-stretch">
							{activeTab.reviews.map((review) => (
								<CarouselItem
									key={review.id}
									className={cn(
										"flex pl-4",
										"basis-[88%]",
										"sm:basis-1/2",
										"lg:basis-1/3",
									)}
								>
									<ReviewItem review={review} />
								</CarouselItem>
							))}
						</CarouselContent>

						{/* CAROUSEL ARROWS */}
						<div className="mt-5 flex items-center justify-center gap-2">
							<CarouselPrevious
								className={cn(
									"!static !translate-y-0",
									"size-10 rounded-full",
									"border-[#DDE3DC]",
									"bg-white text-[#24332B]",
									"hover:bg-[#F1F5F0]",
								)}
							/>

							<CarouselNext
								className={cn(
									"!static !translate-y-0",
									"size-10 rounded-full",
									"border-[#DDE3DC]",
									"bg-white text-[#24332B]",
									"hover:bg-[#F1F5F0]",
								)}
							/>
						</div>

						{/* MOBILE SWIPE HINT */}
						{activeTab.reviews.length > 1 && (
							<p className="mt-4 text-center text-xs text-[#758177] md:hidden">
								Swipe to explore more →
							</p>
						)}
					</Carousel>
				</TabsContent>
			</Tabs>
		</section>
	);
}

// ==========================================
// RATING SUMMARY
// FOR GENUINE CUSTOMER RATINGS ONLY
// ==========================================

export function RatingSummary({
	count,
	average,
}: {
	count: number;
	average: number | null;
}) {
	if (average === null || count < MIN_REVIEWS_FOR_SUMMARY) {
		return null;
	}

	return (
		<a
			href="#reviews"
			className="text-foreground flex w-fit items-center gap-2 text-[14px] hover:underline"
		>
			<Stars rating={average} />

			<span className="font-semibold">{averageLabel(average)} / 5.0</span>

			<span className="text-body">
				({count} review{count === 1 ? "" : "s"})
			</span>
		</a>
	);
}
