"use client";

import Image from "next/image";
import { useState } from "react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { PreviewGroup } from "@/lib/page-previews";
import { cn } from "@/lib/utils";
import { DocMockup } from "./home/doc-mockup";

type Group = Omit<PreviewGroup, "pages"> & {
	pages: (PreviewGroup["pages"][number] & { image: string | null })[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export function PagePreviewsCarousel({ groups }: { groups: Group[] }) {
	const [active, setActive] = useState(0);
	const group = groups[active];

	return (
		<div className="grid gap-6">
			{groups.length > 1 && (
				<div
					role="tablist"
					aria-label="Parts"
					className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:justify-center md:px-0"
				>
					{groups.map((g, i) => (
						<button
							key={g.id}
							type="button"
							role="tab"
							aria-selected={i === active}
							onClick={() => setActive(i)}
							className={cn(
								"h-10 shrink-0 rounded-full border px-5 text-[14px] font-medium transition-colors",
								i === active
									? "bg-foreground border-foreground text-white"
									: "text-foreground hover:border-foreground",
							)}
						>
							{g.label}
						</button>
					))}
				</div>
			)}

			<Carousel
				key={group.id}
				opts={{ align: "start", containScroll: "trimSnaps", loop: false }}
				className="w-full"
			>
				<CarouselContent className="-ml-4" aria-label={`${group.label} sections`}>
					{group.pages.map((page, i) => (
						<CarouselItem
							key={page.slug}
							className="basis-[78%] pl-4 sm:basis-1/2 lg:basis-1/4"
						>
							<div className="grid content-start gap-3">
								<div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[10px] bg-[#f5f5f5]">
									{page.image ? (
										<Image
											src={page.image}
											alt={`${group.label}: ${page.name}`}
											fill
											sizes="(min-width: 1024px) 25vw, 80vw"
											className="object-contain p-4"
										/>
									) : (
										<span className="w-[62%]">
											<DocMockup kind={group.kind} title={page.name} />
										</span>
									)}
								</div>
								<p className="text-primary text-xs font-bold tabular-nums">
									{pad(i + 1)} / {pad(group.pages.length)}
								</p>
								<p className="text-foreground text-[16px] leading-snug font-semibold">
									{page.name}
								</p>
								<p className="text-body text-[14px] leading-[1.6]">{page.text}</p>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>

				<div className="mt-5 flex items-center justify-end gap-2">
					<CarouselPrevious
						className={cn("static translate-y-0!", "size-10 rounded-full")}
					/>
					<CarouselNext
						className={cn("static translate-y-0!", "size-10 rounded-full")}
					/>
				</div>
			</Carousel>

			{group.pages.length > 1 && (
				<p className="text-body -mt-2 text-center text-xs md:hidden">
					Swipe to explore more →
				</p>
			)}
		</div>
	);
}
