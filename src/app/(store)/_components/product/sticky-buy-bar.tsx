"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { container } from "../ui";

/**
 * A slim bar pinned to the bottom of the screen once the main Buy button has
 * scrolled out of view above, so the button is always one tap away on long
 * product pages. Hides again when the main button (or the footer) is back.
 */

type Image = {
	url: string;
	alt: string;
	width: number | null;
	height: number | null;
};

export function StickyBuyBar({
	watchId,
	title,
	image,
	price,
	compareAt,
	children,
}: {
	/** id of the element holding the main Buy button. */
	watchId: string;
	title: string;
	/** First gallery image; a product can have none yet (the bar shows no thumbnail). */
	image?: Image;
	price: string;
	compareAt: string | null;
	/** The Buy button (a server-rendered form). */
	children: React.ReactNode;
}) {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const target = document.getElementById(watchId);
		const footer = document.querySelector("footer");
		if (!target) return;
		let pastButton = false;
		let footerVisible = false;
		const update = () => setShow(pastButton && !footerVisible);
		const observer = new IntersectionObserver((entries) => {
			for (const e of entries) {
				if (e.target === target)
					pastButton = !e.isIntersecting && e.boundingClientRect.top < 0;
				else footerVisible = e.isIntersecting;
			}
			update();
		});
		observer.observe(target);
		if (footer) observer.observe(footer);
		return () => observer.disconnect();
	}, [watchId]);

	return (
		<div
			aria-hidden={!show}
			inert={!show}
			className={cn(
				"bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur transition-transform duration-300",
				show ? "translate-y-0" : "translate-y-full",
			)}
		>
			<div className={`${container} flex items-center gap-4 py-3`}>
				<div className="min-w-0 flex-1 max-sm:hidden flex items-center gap-2">
					{image && (
						<img
							src={image.url}
							alt={image.alt || title}
							className="size-14 object-contain rounded-md"
						/>
					)}
					<div>
						<p className="text-foreground truncate text-md font-semibold">
							{title}
						</p>
						<p className="flex items-baseline gap-2 text-md tabular-nums">
							<span className="text-primary font-semibold">{price}</span>
							{compareAt && (
								<span className="text-body line-through">{compareAt}</span>
							)}
						</p>
					</div>
				</div>
				<div className="w-full sm:w-auto sm:min-w-[300px]">{children}</div>
			</div>
		</div>
	);
}
