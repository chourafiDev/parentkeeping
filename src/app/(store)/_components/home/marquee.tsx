import { Fragment } from "react";
import { container } from "../ui";

/** Glozin's scrolling text strip, with a ✦ between messages. Pauses on hover. */
export function Marquee({ messages }: { messages: string[] }) {
	// Repeat so one copy is wider than any screen, then render it twice for a seamless loop.
	const copy = Array.from({ length: Math.max(2, Math.ceil(10 / messages.length)) }, () => messages).flat();
	return (
		<section aria-label="Why Parentkeeping" className={container}>
			<div className="overflow-hidden border-b py-5 md:py-[22px]">
				<p className="sr-only">{messages.join(" · ")}</p>
				<div
					aria-hidden
					style={{ "--marquee-duration": `${copy.length * 3.3}s` } as React.CSSProperties}
					className="animate-marquee flex w-max hover:[animation-play-state:paused] motion-reduce:animate-none"
				>
					{[0, 1].map((half) => (
						<div key={half} className="flex shrink-0 items-center">
							{copy.map((m, i) => (
								<Fragment key={i}>
									<span className="text-foreground px-[25px] text-[15px] font-semibold whitespace-nowrap">{m}</span>
									<span className="text-primary text-lg">✦</span>
								</Fragment>
							))}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
