import Link from "next/link";
import type { CopySection } from "@/lib/product-copy";
import { CopyBlock } from "./copy-block";
import { container, eyebrow } from "./ui";

/**
 * Shared layout for Terms, Privacy, Refund and Disclaimer: breadcrumb, H1,
 * "Last updated" line, then the sections as a narrow, top-to-bottom column
 * (read like an article, not the zig-zag product layout).
 */
export function LegalPage({
	eyebrowText,
	title,
	lastUpdated,
	intro,
	sections,
}: {
	eyebrowText: string;
	title: string;
	lastUpdated: string;
	intro?: string[];
	sections: CopySection[];
}) {
	return (
		<main className="flex-1">
			<div className={`${container} pt-6 pb-16 md:pb-[70px]`}>
				<nav aria-label="Breadcrumb" className="text-body mb-6 text-[13px]">
					<Link href="/" className="hover:text-foreground">
						Home
					</Link>
					<span className="mx-2">·</span>
					<span className="text-foreground">{title}</span>
				</nav>

				<div className="mx-auto grid max-w-[720px] gap-10">
					<div className="grid gap-3">
						<p className={`${eyebrow} text-primary`}>{eyebrowText}</p>
						<h1 className="text-foreground text-[32px] leading-[1.1] font-semibold tracking-[-0.034em] md:text-[40px]">{title}</h1>
						<p className="text-body text-[13px]">Last updated: {lastUpdated}</p>
						{intro?.map((p) => (
							<p key={p} className="text-body mt-2 text-[15px] leading-[1.714]">
								{p}
							</p>
						))}
					</div>

					<div className="grid gap-10 border-t pt-10">
						{sections.map((block) => (
							<CopyBlock key={block.title} block={block} />
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
