import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { container, eyebrow, section, sectionSubtitle, sectionTitle } from "../ui";

export type CompareCell = { yes: boolean; text: string };
export type CompareRow = { label: string; ours: CompareCell; theirs: CompareCell };

/**
 * Slate's comparison table: the highlighted column is a dark card running
 * down the table, the other column is plain. Used for "the System vs buying
 * the pieces" and for a single product's upgrade to the System.
 */
export function ProductCompare({
	eyebrowText,
	title,
	text,
	columns,
	rows,
	footer,
}: {
	eyebrowText: string;
	title: string;
	text: string;
	/** [highlighted column, other column] */
	columns: [string, string];
	rows: CompareRow[];
	footer?: React.ReactNode;
}) {
	const cell = (c: CompareCell, dark: boolean) => (
		<span className="flex items-start gap-1.5 md:gap-2">
			{c.yes ? (
				<Check className={cn("mt-0.5 size-3.5 shrink-0 md:size-4", dark ? "text-white" : "text-primary")} strokeWidth={2.5} />
			) : (
				<Minus className={cn("mt-0.5 size-3.5 shrink-0 md:size-4", dark ? "text-white/50" : "text-[#dc3545]")} strokeWidth={2.5} />
			)}
			<span>{c.text}</span>
		</span>
	);
	return (
		<section className={`${container} ${section} border-t`}>
			<div className="mx-auto mb-10 grid max-w-[760px] gap-3 text-center md:mb-14">
				<p className={`${eyebrow} text-primary`}>{eyebrowText}</p>
				<h2 className={sectionTitle}>{title}</h2>
				<p className={sectionSubtitle}>{text}</p>
			</div>
			<div className="mx-auto max-w-[1020px]">
				<div role="table" className="grid grid-cols-[1.15fr_1fr_1fr] text-[13px] md:grid-cols-[1.1fr_1.2fr_1fr] md:text-[15px]">
					<div role="row" className="contents">
						<span role="columnheader" />
						<span role="columnheader" className="bg-deep rounded-t-[10px] px-3 pt-5 pb-3 text-[14px] leading-snug font-semibold text-white md:px-5 md:pt-6 md:pb-4 md:text-[16px]">
							{columns[0]}
						</span>
						<span role="columnheader" className="text-foreground px-3 pt-5 pb-3 text-[14px] leading-snug font-semibold md:px-5 md:pt-6 md:pb-4 md:text-[16px]">
							{columns[1]}
						</span>
					</div>
					{rows.map((row, i) => {
						const last = i === rows.length - 1;
						return (
							<div role="row" key={row.label} className="contents">
								<span role="rowheader" className={cn("text-foreground py-4 pr-3 leading-snug font-medium md:pr-4", !last && "border-b")}>
									{row.label}
								</span>
								<span role="cell" className={cn("bg-deep px-3 py-4 leading-snug text-white/90 md:px-5", !last && "border-b border-white/10", last && "rounded-b-[10px] pb-6")}>
									{cell(row.ours, true)}
								</span>
								<span role="cell" className={cn("text-body px-3 py-4 leading-snug md:px-5", !last && "border-b")}>
									{cell(row.theirs, false)}
								</span>
							</div>
						);
					})}
				</div>
			</div>
			{footer && <div className="mt-10 grid justify-items-center gap-3 text-center">{footer}</div>}
		</section>
	);
}
