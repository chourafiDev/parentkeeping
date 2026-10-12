"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Image = { url: string; alt: string; width: number | null; height: number | null };

/** Glozin product gallery: large image on a light-grey panel, thumbnails under it. */
export function ProductGallery({ images, title, fallback }: { images: Image[]; title: string; fallback: React.ReactNode }) {
	const [index, setIndex] = useState(0);
	const current = images[index];

	return (
		<div className="grid gap-3">
			<div className="relative aspect-square overflow-hidden rounded-[10px] bg-[#f5f5f5]">
				{current ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={current.url} alt={current.alt || title} className="size-full object-cover" />
				) : (
					<div className="flex size-full items-center justify-center px-[26%] py-[12%]">{fallback}</div>
				)}
			</div>
			{images.length > 1 && (
				<ul className="grid grid-cols-5 gap-3" aria-label="Product images">
					{images.map((img, i) => (
						<li key={img.url}>
							<button
								type="button"
								onClick={() => setIndex(i)}
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
