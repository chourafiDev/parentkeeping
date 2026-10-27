"use client";

import { Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { BUY_GUARANTEE_LINE } from "@/lib/legal";
import type { ProductCopy } from "@/lib/product-copy";
import { cn } from "@/lib/utils";
import { container, eyebrow, section, sectionTitle } from "../ui";

/**
 * "What to expect" (Aurivita's timeline band): a dark panel, one tab per
 * milestone on the left with the buy button under it, and the whole path on
 * the right, ticked up to the chosen milestone.
 */
export function ProductFirstMonth({
	timeline,
	buy,
}: {
	timeline: NonNullable<ProductCopy["firstMonth"]>;
	buy: React.ReactNode;
}) {
	const [active, setActive] = useState(0);
	const items = timeline.items;
	const progress = ((active + 1) / items.length) * 100;

	return (
		<section className={`${container} ${section}`}>
			<div className="bg-deep grid gap-10 overflow-hidden rounded-[10px] p-6 text-white md:p-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:p-14">
				<div className="grid content-start gap-6">
					<div className="grid gap-3">
						<p className={`${eyebrow} text-white/60`}>What to expect</p>
						<h2 className={cn(sectionTitle, "text-white")}>{timeline.title}</h2>
						<p className="text-[15px] leading-[1.714] text-white/75">
							{timeline.text}
						</p>
					</div>

					<div
						role="tablist"
						aria-label={timeline.title}
						className="grid grid-cols-2 gap-2"
					>
						{items.map((item, i) => (
							<button
								key={item.when}
								type="button"
								role="tab"
								id={`first-month-tab-${i}`}
								aria-selected={i === active}
								aria-controls={`first-month-panel-${i}`}
								onClick={() => setActive(i)}
								className={cn(
									"h-11 rounded-md px-3 text-[14px] font-semibold transition-colors",
									i === active
										? "bg-primary text-white"
										: "bg-white/[0.07] text-white/75 hover:bg-white/15 hover:text-white",
								)}
							>
								{item.when}
							</button>
						))}
					</div>

					{items.map((item, i) => (
						<div
							key={item.when}
							role="tabpanel"
							id={`first-month-panel-${i}`}
							aria-labelledby={`first-month-tab-${i}`}
							hidden={i !== active}
							className="grid min-h-[120px] content-start gap-2"
						>
							<h3 className="text-[20px] leading-tight font-semibold tracking-[-0.02em]">
								{item.title}
							</h3>
							<p className="text-[15px] leading-[1.714] text-white/75">
								{item.text}
							</p>
						</div>
					))}

					<div className="grid justify-items-start gap-3">
						{buy}
						<p className="flex items-center gap-1.5 text-[13px] text-white/60">
							<ShieldCheck
								aria-hidden
								className="size-4 shrink-0 text-white/70"
							/>
							{BUY_GUARANTEE_LINE}
						</p>
					</div>
				</div>

				{/* The whole path, ticked up to the chosen milestone. */}
				<div className="grid content-start gap-6 rounded-[10px] bg-white/[0.05] p-5 ring-1 ring-white/10 md:p-8 lg:self-center">
					<div className="grid gap-2">
						<div className="flex items-baseline justify-between gap-4 text-[13px]">
							<span className="font-semibold">{items[active]?.when}</span>
							<span className="text-white/60 tabular-nums">
								{active + 1} of {items.length}
							</span>
						</div>
						<div className="h-1.5 overflow-hidden rounded-full bg-white/10">
							<div
								className="h-full rounded-full bg-white transition-[width] duration-500"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
					<ol className="relative grid gap-1">
						<span
							aria-hidden
							className="absolute top-5 bottom-5 left-[27px] w-px bg-white/5"
						/>
						{items.map((item, i) => {
							const done = i <= active;
							return (
								<li key={item.when}>
									<button
										type="button"
										onClick={() => setActive(i)}
										className={cn(
											"relative px-2 grid w-full grid-cols-[40px_1fr] items-center gap-4 rounded-md py-3 pe-3 text-start transition-colors",
											i === active
												? "bg-white/[0.07]"
												: "hover:bg-white/[0.04]",
										)}
									>
										<span
											className={cn(
												"bg-deep relative grid size-10 place-items-center rounded-full ring-1 transition-colors",
												done
													? "bg-primary text-white ring-primary"
													: "text-white/50 ring-white/25",
											)}
										>
											{done ? (
												<Check
													aria-hidden
													className="size-4"
													strokeWidth={2.5}
												/>
											) : (
												<span className="text-[13px] font-semibold tabular-nums">
													{i + 1}
												</span>
											)}
										</span>
										<span className="grid gap-0.5">
											<span
												className={cn(
													eyebrow,
													done ? "text-white/70" : "text-white/45",
												)}
											>
												{item.when}
											</span>
											<span
												className={cn(
													"text-[16px] font-semibold tracking-[-0.02em]",
													done ? "text-white" : "text-white/60",
												)}
											>
												{item.title}
											</span>
										</span>
									</button>
								</li>
							);
						})}
					</ol>
				</div>
			</div>
		</section>
	);
}
