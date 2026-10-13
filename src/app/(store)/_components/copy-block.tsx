import Link from "next/link";
import type { CopySection } from "@/lib/product-copy";
import { Inline } from "./blog/inline";
import { eyebrow } from "./ui";

const body = "text-body text-[15px] leading-[1.714]";

/** One block of page copy: heading, then steps, paragraphs, lists, a sample and a link. */
export function CopyBlock({ block }: { block: CopySection }) {
	return (
		<div className="grid content-start gap-4">
			<h2 className="text-foreground text-[22px] leading-tight font-semibold tracking-[-0.03em] md:text-[24px]">{block.title}</h2>
			{block.steps && (
				<ol className="grid gap-5">
					{block.steps.map((step, i) => (
						<li key={step.title} className="grid grid-cols-[auto_1fr] gap-x-4">
							<span className="text-primary text-[28px] leading-none font-semibold tracking-[-0.04em]">0{i + 1}</span>
							<div className="grid gap-1">
								<h3 className="text-foreground text-[16px] font-semibold">{step.title}</h3>
								<p className={body}>{step.text}</p>
							</div>
						</li>
					))}
				</ol>
			)}
			{block.paragraphs?.map((p) => (
				<p key={p} className={body}>
					<Inline text={p} />
				</p>
			))}
			{block.numbered && (
				<ol className="grid gap-2">
					{block.numbered.map((item, i) => (
						<li key={item} className={`${body} flex gap-3`}>
							<span className="text-primary w-5 shrink-0 font-semibold tabular-nums">{i + 1}.</span>
							<Inline text={item} />
						</li>
					))}
				</ol>
			)}
			{block.bullets && (
				<ul className="grid gap-3">
					{block.bullets.map((b) => (
						<li key={b.text} className={`${body} flex gap-3`}>
							<span aria-hidden className="bg-primary mt-[0.7em] size-1.5 shrink-0 rounded-full" />
							<span>
								{b.lead && <strong className="text-foreground font-semibold">{b.lead} </strong>}
								<Inline text={b.text} />
							</span>
						</li>
					))}
				</ul>
			)}
			{block.after?.map((p) => (
				<p key={p} className={body}>
					<Inline text={p} />
				</p>
			))}
			{block.sample && (
				<figure className="grid gap-2 rounded-[10px] bg-[#f5f5f5] p-5 md:p-6">
					<figcaption className={`${eyebrow} text-body`}>{block.sample.label}</figcaption>
					<blockquote className="text-foreground text-[16px] leading-[1.7] italic">{block.sample.text}</blockquote>
				</figure>
			)}
			{block.link && (
				<Link href={block.link.href} className="text-foreground hover:text-primary justify-self-start text-[15px] font-semibold underline underline-offset-4">
					{block.link.label}
				</Link>
			)}
		</div>
	);
}
