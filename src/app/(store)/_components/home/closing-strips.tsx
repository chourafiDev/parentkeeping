import { ArrowRight, FileText, Pill } from "lucide-react";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { formatStorePrice } from "@/lib/money";
import { DOWNSELL_STRIP, FREE_LIST_STRIP } from "@/lib/offer";
import { container } from "../ui";
import type { HomeData } from "./types";

/** The spec's downsell and free-list strips: Glozin's slim grey info bars. */
export function ClosingStrips({ data }: { data: HomeData }) {
	const strips = [
		...(data.binder
			? [
					{
						kind: "binder" as const,
						text: `${DOWNSELL_STRIP.text} ${formatStorePrice(data.binder.price)}.`,
						cta: DOWNSELL_STRIP.cta,
						href: data.binder.href,
					},
				]
			: []),
		{ kind: "list" as const, text: FREE_LIST_STRIP.text, cta: FREE_LIST_STRIP.cta, href: FREE_LIST_PATH },
	];
	return (
		<section className={`${container} grid gap-4 pb-6 md:pb-[30px]`}>
			{strips.map((s) => (
				<div key={s.kind} className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-[10px] bg-[#f5f5f5] p-5 md:flex-nowrap md:px-8">
					<span aria-hidden className="text-primary hidden size-12 shrink-0 place-items-center rounded-full bg-white sm:grid">
						{s.kind === "binder" ? <FileText className="size-5" /> : <Pill className="size-5" />}
					</span>
					<p className="text-foreground min-w-0 flex-1 text-[16px] leading-snug font-medium tracking-[-0.01em]">{s.text}</p>
					<a
						href={s.href}
						className="text-foreground hover:text-primary inline-flex shrink-0 items-center gap-2 text-[15px] font-semibold underline-offset-4 hover:underline"
					>
						{s.cta}
						<ArrowRight className="size-4" />
					</a>
				</div>
			))}
		</section>
	);
}
