"use client";

import { Maximize, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { container, eyebrow, section, sectionTitle } from "./ui";

/** When each part starts in public/videos/care-sheet-demo.mp4, in seconds. Re-time these if the video is re-recorded. */
const CHAPTERS = [
	{ start: 0, title: "Dashboard", text: "What's overdue, what's coming up and what care cost this month." },
	{ start: 4.25, title: "Job Board", text: "Every job has an owner, a backup and a due date." },
	{ start: 8.5, title: "Fair Share", text: "Who has paid what, and who pays whom to even up." },
	{ start: 13.75, title: "Share it", text: "Add your siblings by email. Everyone sees the same sheet." },
];
const DURATION = 18;

/**
 * The Care Sheet working, on the sample family's data: a green card with labels
 * that follow the video and jump to their part. It loads and plays only while
 * it's on screen; visitors who ask for less motion start it themselves. Never
 * link the sample sheet itself: anyone could copy it.
 */
export function CareSheetDemo() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const pausedByVisitor = useRef(false);
	const [playing, setPlaying] = useState(false);
	const [time, setTime] = useState(0);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			pausedByVisitor.current = true;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) video.pause();
				else if (!pausedByVisitor.current) video.play().catch(() => {});
			},
			{ threshold: 0.3 },
		);
		observer.observe(video);
		return () => observer.disconnect();
	}, []);

	const active = CHAPTERS.findLastIndex((c) => time >= c.start);

	const jumpTo = (start: number) => {
		const video = videoRef.current;
		if (!video) return;
		video.currentTime = start;
		setTime(start);
		pausedByVisitor.current = false;
		video.play().catch(() => {});
	};

	const toggle = () => {
		const video = videoRef.current;
		if (!video) return;
		pausedByVisitor.current = !video.paused;
		if (video.paused) video.play().catch(() => {});
		else video.pause();
	};

	// iPhones only do full screen on the video element itself.
	const fullScreen = () => {
		const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
		if (!video) return;
		if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
		else video.webkitEnterFullscreen?.();
	};

	return (
		<section className={`${container} ${section}`}>
			<div className="from-deep to-primary grid items-center gap-8 overflow-hidden rounded-[10px] bg-gradient-to-br p-5 text-white md:p-10 lg:grid-cols-[1fr_1.9fr] lg:gap-12 lg:p-12">
				<div className="grid content-start gap-3 lg:gap-6">
					<div className="grid gap-3">
						<p className={`${eyebrow} text-white/60`}>See it working</p>
						<h2 className={cn(sectionTitle, "text-white")}>One sheet the whole family can see</h2>
					</div>
					{/* Desktop: the labels, in reading order next to the video. */}
					<Labels active={active} time={time} onSelect={jumpTo} className="hidden lg:grid" withText />
				</div>

				<div className="grid min-w-0 gap-4">
					<div className="relative overflow-hidden rounded-[10px] bg-white/10 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.6)]">
						<video
							ref={videoRef}
							className="block aspect-video h-auto w-full"
							src="/videos/care-sheet-demo.mp4"
							poster="/images/home/care-sheet-demo-poster.webp"
							muted
							loop
							playsInline
							preload="none"
							onPlay={() => setPlaying(true)}
							onPause={() => setPlaying(false)}
							onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
							aria-label="Screen recording of a sample Care Sheet: the dashboard, the job board, who pays whom to even up, and sharing the sheet with siblings"
						/>
						<div className="absolute right-2 bottom-2 flex gap-1.5 sm:right-3 sm:bottom-3 sm:gap-2">
							<button type="button" onClick={fullScreen} aria-label="Watch full screen" className={iconButton}>
								<Maximize className="size-4" />
							</button>
							<button type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className={iconButton}>
								{playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
							</button>
						</div>
					</div>
					{/* Phones and tablets: short labels under the video, so it stays in view; the current one's line below. */}
					<Labels active={active} time={time} onSelect={jumpTo} className="grid-cols-2 sm:grid-cols-4 lg:hidden" />
					<p className="text-[15px] leading-[1.6] text-white/80 lg:hidden">{CHAPTERS[active]?.text}</p>
				</div>
			</div>
		</section>
	);
}

const iconButton =
	"grid size-8 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 sm:size-10";

function Labels({
	active,
	time,
	onSelect,
	className,
	withText = false,
}: {
	active: number;
	time: number;
	onSelect: (start: number) => void;
	className?: string;
	withText?: boolean;
}) {
	return (
		<div className={cn("grid gap-2", className)}>
			{CHAPTERS.map((chapter, i) => {
				const end = CHAPTERS[i + 1]?.start ?? DURATION;
				const progress = i === active ? Math.min((time - chapter.start) / (end - chapter.start), 1) : 0;
				return (
					<button
						key={chapter.title}
						type="button"
						onClick={() => onSelect(chapter.start)}
						aria-current={i === active ? "true" : undefined}
						className={cn(
							"relative grid gap-1 overflow-hidden rounded-md px-4 py-3 text-start transition-colors",
							i === active ? "bg-white/15" : "bg-white/[0.05] hover:bg-white/10",
						)}
					>
						<span className={cn("text-[15px] font-semibold", i === active ? "text-white" : "text-white/70")}>{chapter.title}</span>
						{withText && <span className="text-[14px] leading-[1.5] text-white/70">{chapter.text}</span>}
						<span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-white" style={{ transform: `scaleX(${progress})` }} />
					</button>
				);
			})}
		</div>
	);
}
