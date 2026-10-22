"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { PROBLEM_SUBTITLE, PROBLEM_TABS, PROBLEM_TITLE } from "@/lib/problem-stats";
import { cn } from "@/lib/utils";
import { container, eyebrow, section, sectionSubtitle, sectionTitle } from "./ui";

/** "The problem" in sourced numbers, one tab per pain, each with Parentkeeping's answer. */
export function ProblemTabs() {
	const [active, setActive] = useState(0);
	const tab = PROBLEM_TABS[active];

	return (
		<section className={`${container} ${section}`}>
			<div className="mx-auto mb-8 grid max-w-[800px] gap-3 text-center md:mb-10">
				<p className={`${eyebrow} text-primary`}>Why it feels this heavy</p>
				<h2 className={sectionTitle}>{PROBLEM_TITLE}</h2>
				<p className={sectionSubtitle}>{PROBLEM_SUBTITLE}</p>
			</div>

			<div role="tablist" aria-label="Caregiving problems" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:justify-center md:px-0">
				{PROBLEM_TABS.map((t, i) => (
					<button
						key={t.tab}
						type="button"
						role="tab"
						id={`problem-tab-${i}`}
						aria-selected={i === active}
						aria-controls="problem-panel"
						onClick={() => setActive(i)}
						className={cn(
							"h-10 shrink-0 rounded-full border px-5 text-[14px] font-medium transition-colors",
							i === active ? "bg-foreground border-foreground text-white" : "text-foreground hover:border-foreground",
						)}
					>
						{t.tab}
					</button>
				))}
			</div>

			<div
				role="tabpanel"
				id="problem-panel"
				aria-labelledby={`problem-tab-${active}`}
				className="mx-auto grid max-w-[1020px] overflow-hidden rounded-[10px] md:grid-cols-[1.1fr_1fr]"
			>
				<div className="bg-deep grid content-center gap-3 p-7 text-white md:p-10">
					<p className="text-[52px] leading-none font-semibold tracking-[-0.04em] md:text-[64px]">{tab.stat}</p>
					<p className="text-[17px] leading-relaxed text-white/90">{tab.text}</p>
					<p className="text-xs text-white/60">
						Source:{" "}
						<a href={tab.source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
							{tab.source.label}
						</a>
					</p>
				</div>
				<div className="grid content-center gap-3 bg-[#f5f5f5] p-7 md:p-10">
					<p className={`${eyebrow} text-primary`}>What changes with Parentkeeping</p>
					<p className="text-foreground flex gap-2.5 text-[17px] leading-relaxed font-medium">
						<ArrowRight className="text-primary mt-1 size-4 shrink-0" />
						{tab.answer}
					</p>
				</div>
			</div>
		</section>
	);
}
