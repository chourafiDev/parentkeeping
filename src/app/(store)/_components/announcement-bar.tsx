"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export type Announcement = { text: string; link?: { href: string; label: string } };

/** Glozin's dark top bar: one message at a time, arrows, auto-advance every 5 s. */
export function AnnouncementBar({ messages }: { messages: Announcement[] }) {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const count = messages.length;

	useEffect(() => {
		if (paused || count < 2) return;
		const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
		return () => clearInterval(t);
	}, [paused, count]);

	if (count === 0) return null;
	const message = messages[index];
	return (
		<div
			className="bg-deep text-white"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
		>
			<div className="mx-auto flex h-10 max-w-[640px] items-center justify-between gap-2 px-2 text-[13px] sm:text-sm">
				{count > 1 && (
					<button type="button" aria-label="Previous message" onClick={() => setIndex((index - 1 + count) % count)} className="rounded-full p-1.5 opacity-70 hover:opacity-100">
						<ChevronLeft className="size-4" />
					</button>
				)}
				<p aria-live="polite" className="min-w-0 flex-1 truncate text-center">
					{message.text}
					{message.link && (
						<>
							{" "}
							<Link href={message.link.href} className="font-semibold underline-offset-2 hover:underline">
								{message.link.label}
							</Link>
						</>
					)}
				</p>
				{count > 1 && (
					<button type="button" aria-label="Next message" onClick={() => setIndex((index + 1) % count)} className="rounded-full p-1.5 opacity-70 hover:opacity-100">
						<ChevronRight className="size-4" />
					</button>
				)}
			</div>
		</div>
	);
}
