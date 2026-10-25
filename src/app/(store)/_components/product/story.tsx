import { ShieldCheck } from "lucide-react";
import { BUY_GUARANTEE_LINE } from "@/lib/legal";
import type { CopySection } from "@/lib/product-copy";
import { cn } from "@/lib/utils";
import { CopyBlock } from "../copy-block";
import { container, section } from "../ui";

/**
 * The page's copy sections in plain columns: the first (the story or the
 * "why") with a big heading and the buy button under it, the rest (formats,
 * what you get) beside it.
 */
export function ProductStory({ sections, buy }: { sections: CopySection[]; buy: React.ReactNode }) {
	const [lead, ...rest] = sections;
	if (!lead) return null;
	return (
		<section className={`${container} ${section}`}>
			<div className={cn("grid gap-12 lg:gap-[80px]", rest.length > 0 && "lg:grid-cols-[1.25fr_1fr]")}>
				<div className="grid content-start gap-8">
					<CopyBlock block={lead} large />
					<div className="grid justify-items-start gap-3">
						{buy}
						<p className="text-body flex items-center gap-1.5 text-[13px]">
							<ShieldCheck aria-hidden className="text-primary size-4 shrink-0" />
							{BUY_GUARANTEE_LINE}
						</p>
					</div>
				</div>
				{rest.length > 0 && (
					<div className="grid content-start gap-10">
						{rest.map((block) => (
							<CopyBlock key={block.title} block={block} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
