"use client";

import { useEffect, useState } from "react";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type Image = { url: string; alt: string; width: number | null; height: number | null };

/** Glozin product gallery: large image on a light-grey panel, thumbnails under it. */
export function ProductGallery({
	images,
	title,
	fallback,
	badges = [],
}: {
	images: Image[];
	title: string;
	fallback: React.ReactNode;
	/** Chips over the first image only (later slides are infographics with their own text). */
	badges?: string[];
}) {
	const [api, setApi] = useState<CarouselApi>();
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (!api) return;
		const onSelect = () => setIndex(api.selectedScrollSnap());
		onSelect();
		api.on("select", onSelect);
		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	if (!images.length) {
		return (
			<div className="relative aspect-square overflow-hidden rounded-[10px] bg-[#f5f5f5]">
				<div className="flex size-full items-center justify-center px-[26%] py-[12%]">{fallback}</div>
			</div>
		);
	}

	return (
		<div className="grid gap-3">
			<Carousel setApi={setApi} opts={{ loop: false }} className="group/gallery relative">
				<CarouselContent>
					{images.map((img, i) => (
						<CarouselItem key={img.url}>
							<div className="relative aspect-square overflow-hidden rounded-[10px] bg-[#f5f5f5]">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={img.url} alt={img.alt || title} className="size-full object-cover" />
								{i === 0 && badges.length > 0 && (
									<ul className="absolute top-3 left-3 flex flex-wrap gap-1.5 pe-3" aria-label="Format">
										{badges.map((b) => (
											<li key={b} className="text-foreground rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold shadow-sm">
												{b}
											</li>
										))}
									</ul>
								)}
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				{images.length > 1 && (
					<>
						<CarouselPrevious className="left-3 opacity-0 transition-opacity group-hover/gallery:opacity-100" />
						<CarouselNext className="right-3 opacity-0 transition-opacity group-hover/gallery:opacity-100" />
					</>
				)}
			</Carousel>
			{images.length > 1 && (
				<ul className="grid grid-cols-5 gap-3" aria-label="Product images">
					{images.map((img, i) => (
						<li key={img.url}>
							<button
								type="button"
								onClick={() => api?.scrollTo(i)}
								aria-label={`Show image ${i + 1}`}
								aria-current={i === index}
								className={cn(
									"block aspect-square w-full overflow-hidden rounded-[8px] border-2 bg-[#f5f5f5] transition-colors",
									i === index ? "border-foreground" : "border-transparent hover:border-black/20",
								)}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={img.url} alt="" className="size-full object-cover" />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
