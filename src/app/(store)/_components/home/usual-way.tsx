import { Check, Minus, X } from "lucide-react";
import { USUAL_WAY, USUAL_WAY_COLUMNS, type UsualWayCell } from "@/lib/home";
import { cn } from "@/lib/utils";
import { container, eyebrow, section, sectionSubtitle, sectionTitle } from "../ui";

const ICON = { yes: Check, no: X, some: Minus };

function Cell({ cell, dark }: { cell: UsualWayCell; dark: boolean }) {
	const Icon = ICON[cell.mark];
	const label = { yes: "Yes", no: "No", some: "Partly" }[cell.mark];
	return (
		<span className="flex flex-col items-center gap-1 text-center">
			<span
				className={cn(
					"flex size-7 items-center justify-center rounded-full",
					cell.mark === "yes" && (dark ? "bg-white text-deep" : "bg-primary/15 text-primary"),
					cell.mark === "no" && "bg-[#dc3545]/10 text-[#dc3545]",
					cell.mark === "some" && "bg-[#e9a23b]/15 text-[#b57414]",
				)}
			>
				<Icon className="size-4" strokeWidth={2.5} aria-label={label} />
			</span>
			{cell.text && <span className={cn("text-[12px] leading-tight md:text-[13px]", dark ? "text-white/80" : "text-body")}>{cell.text}</span>}
		</span>
	);
}

/** "Parentkeeping vs. the usual way": the no-new-app point, made concrete. */
export function UsualWay() {
	return (
		<section className={`${container} ${section}`}>
			<div className="mx-auto mb-8 grid max-w-[760px] gap-3 text-center md:mb-12">
				<p className={`${eyebrow} text-primary`}>Why Parentkeeping</p>
				<h2 className={sectionTitle}>One place. Shared fairly. No new app.</h2>
				<p className={sectionSubtitle}>How it compares with what most families do now.</p>
			</div>
			<div className="mx-auto max-w-[1020px] overflow-x-auto">
				<div role="table" className="grid min-w-[560px] grid-cols-[1.4fr_1fr_1fr_1fr] text-[14px] md:text-[15px]">
					<div role="row" className="contents">
						<span role="columnheader" />
						{USUAL_WAY_COLUMNS.map((col, i) => (
							<span
								key={col}
								role="columnheader"
								className={cn(
									"px-2 pt-5 pb-3 text-center leading-snug font-semibold md:px-4",
									i === 0 ? "bg-deep rounded-t-[10px] text-white" : "text-foreground",
								)}
							>
								{col}
							</span>
						))}
					</div>
					{USUAL_WAY.map((row, r) => {
						const last = r === USUAL_WAY.length - 1;
						return (
							<div role="row" key={row.label} className="contents">
								<span role="rowheader" className={cn("text-foreground py-4 pr-3 leading-snug font-medium", !last && "border-b")}>
									{row.label}
								</span>
								{row.cells.map((cell, i) => (
									<span
										key={USUAL_WAY_COLUMNS[i]}
										role="cell"
										className={cn(
											"flex items-center justify-center px-2 py-4 md:px-4",
											i === 0 ? "bg-deep" : "",
											i === 0 && !last && "border-b border-white/10",
											i !== 0 && !last && "border-b",
											i === 0 && last && "rounded-b-[10px] pb-6",
										)}
									>
										<Cell cell={cell} dark={i === 0} />
									</span>
								))}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
