import { FileText, Handshake, ListChecks, MessagesSquare, Pill, Sheet } from "lucide-react";
import { cn } from "@/lib/utils";

export type DocKind = "binder" | "sheet" | "agreement" | "meeting" | "list" | "bundle";

const ICONS = { binder: FileText, sheet: Sheet, agreement: Handshake, meeting: MessagesSquare, list: Pill, bundle: ListChecks };

/**
 * Drawn stand-in for a product page (until real page images exist): a sheet
 * of paper with a header, a title and ruled lines; the sheet kind gets a grid.
 */
export function DocMockup({
	kind,
	title,
	className,
	tilt = 0,
}: {
	kind: DocKind;
	title: string;
	className?: string;
	tilt?: number;
}) {
	const Icon = ICONS[kind];
	return (
		<div
			aria-hidden
			style={{ rotate: `${tilt}deg` }}
			className={cn("grid aspect-[8.5/11] w-full content-start gap-2 rounded-md bg-white p-[8%] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]", className)}
		>
			<div className="flex items-center justify-between">
				<span className="text-primary text-[9px] font-bold tracking-wide uppercase">Parentkeeping</span>
				<Icon className="text-primary size-3.5" />
			</div>
			<span className="text-foreground line-clamp-2 text-[11px] leading-tight font-semibold">{title}</span>
			{kind === "sheet" ? (
				<div className="mt-1 grid grid-cols-4 gap-px overflow-hidden rounded-sm bg-black/10">
					{Array.from({ length: 24 }, (_, i) => (
						<span key={i} className={cn("h-3", i < 4 ? "bg-primary/25" : "bg-white")} />
					))}
				</div>
			) : (
				<div className="mt-1 grid gap-1.5">
					{Array.from({ length: 8 }, (_, i) => (
						<span key={i} className="flex items-center gap-1.5">
							{kind === "list" || kind === "meeting" ? <span className="border-primary/40 size-2 shrink-0 rounded-[2px] border" /> : null}
							<span className="bg-muted h-1.5 rounded-full" style={{ width: `${88 - (i % 3) * 16}%` }} />
						</span>
					))}
				</div>
			)}
		</div>
	);
}
