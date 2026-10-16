"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PreviewGroup } from "@/lib/page-previews";
import { cn } from "@/lib/utils";
import { DocMockup } from "./home/doc-mockup";

type Group = Omit<PreviewGroup, "pages"> & { pages: (PreviewGroup["pages"][number] & { image: string | null })[] };

const pad = (n: number) => String(n).padStart(2, "0");

export function PagePreviewsCarousel({ groups }: { groups: Group[] }) {
	const [active, setActive] = useState(0);
	const [edges, setEdges] = useState({ start: true, end: false });
	const track = useRef<HTMLUListElement>(null);
	const group = groups[active];

	// Whether the arrows can move.
	useEffect(() => {
		const el = track.current;
		if (!el) return;
		const onScroll = () => {
			setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
		};
		el.scrollTo({ left: 0 });
		onScroll();
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, [group]);

	const move = (dir: 1 | -1) => {
		const el = track.current;
		if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
	};

	return (
		<div className="grid gap-6">
			{groups.length > 1 && (
				<div role="tablist" aria-label="Parts" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:justify-center md:px-0">
					{groups.map((g, i) => (
						<button
							key={g.id}
							type="button"
							role="tab"
							aria-selected={i === active}
							onClick={() => setActive(i)}
							className={cn(
								"h-10 shrink-0 rounded-full border px-5 text-[14px] font-medium transition-colors",
								i === active ? "bg-foreground border-foreground text-white" : "text-foreground hover:border-foreground",
							)}
						>
							{g.label}
						</button>
					))}
				</div>
			)}

			<ul
				ref={track}
				aria-label={`${group.label} sections`}
				className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
			>
				{group.pages.map((page, i) => (
					<li key={page.slug} className="grid w-[78%] shrink-0 snap-start content-start gap-3 sm:w-[44%] lg:w-[calc((100%-48px)/4)]">
						<div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[10px] bg-[#f5f5f5]">
							{page.image ? (
								<Image src={page.image} alt={`${group.label}: ${page.name}`} fill sizes="(min-width: 1024px) 25vw, 80vw" className="object-contain p-4" />
							) : (
								<span className="w-[62%]">
									<DocMockup kind={group.kind} title={page.name} />
								</span>
							)}
						</div>
						<p className="text-primary text-xs font-bold tabular-nums">
							{pad(i + 1)} / {pad(group.pages.length)}
						</p>
						<p className="text-foreground text-[16px] leading-snug font-semibold">{page.name}</p>
						<p className="text-body text-[14px] leading-[1.6]">{page.text}</p>
					</li>
				))}
			</ul>

			<div className="flex items-center justify-end gap-4">
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => move(-1)}
						disabled={edges.start}
						aria-label="Previous"
						className="hover:bg-foreground flex size-10 items-center justify-center rounded-full border transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-30"
					>
						<ChevronLeft className="size-4" />
					</button>
					<button
						type="button"
						onClick={() => move(1)}
						disabled={edges.end}
						aria-label="Next"
						className="hover:bg-foreground flex size-10 items-center justify-center rounded-full border transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-30"
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
