import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Block } from "@/lib/blog";
import { pillDark } from "../ui";
import { Inline } from "./inline";

const text = "text-body text-[16px] leading-[1.75]";

/** A post's blocks with Glozin's article typography. */
export function PostBody({ blocks }: { blocks: Block[] }) {
	return (
		<div className="grid gap-5">
			{blocks.map((b, i) => {
				switch (b.type) {
					case "p":
						return (
							<p key={i} className={text}>
								<Inline text={b.text} />
							</p>
						);
					case "h2":
						return (
							<h2 key={i} className="text-foreground mt-6 text-[24px] leading-tight font-semibold tracking-[-0.03em] md:text-[28px]">
								{b.text}
							</h2>
						);
					case "h3":
						return (
							<h3 key={i} className="text-foreground mt-2 text-[19px] leading-snug font-semibold tracking-[-0.02em]">
								{b.text}
							</h3>
						);
					case "ul":
						return (
							<ul key={i} className="grid gap-2.5">
								{b.items.map((item) => (
									<li key={item} className={`${text} flex gap-3`}>
										<span aria-hidden className="bg-primary mt-[0.75em] size-1.5 shrink-0 rounded-full" />
										<span>
											<Inline text={item} />
										</span>
									</li>
								))}
							</ul>
						);
					case "ol":
						return (
							<ol key={i} className="grid gap-2.5">
								{b.items.map((item, n) => (
									<li key={item} className={`${text} flex gap-3`}>
										<span className="text-primary w-6 shrink-0 font-semibold tabular-nums">{(b.start ?? 1) + n}.</span>
										<span>
											<Inline text={item} />
										</span>
									</li>
								))}
							</ol>
						);
					case "table":
						return (
							<figure key={i} className="grid gap-2">
								<div className="overflow-x-auto rounded-[10px] border">
									<table className="w-full min-w-[520px] border-collapse text-left text-[15px]">
										<thead className="bg-[#f5f5f5]">
											<tr>
												{b.head.map((h) => (
													<th key={h} className="text-foreground px-4 py-3 font-semibold">
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{b.rows.map((row) => (
												<tr key={row[0]} className="border-t">
													{row.map((cell, c) => (
														<td key={c} className={c === 0 ? "text-foreground px-4 py-3" : "text-body px-4 py-3 tabular-nums"}>
															{cell}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{b.note && <figcaption className="text-body text-[13px] leading-relaxed">{b.note}</figcaption>}
							</figure>
						);
					case "cta":
						return (
							<aside key={i} className="mx-auto my-6 grid max-w-[600px] justify-items-center gap-3 rounded-[10px] bg-[#f5f5f5] px-6 py-8 text-center md:px-10">
								<p className="text-foreground text-[22px] leading-snug font-semibold tracking-[-0.03em]">{b.title}</p>
								{b.text.map((t) => (
									<p key={t} className="text-body text-[15px] leading-[1.7]">
										<Inline text={t} />
									</p>
								))}
								{b.button && (
									<Link href={b.button.href} className={`${pillDark} mt-2 gap-2`}>
										{b.button.label}
										<ArrowRight className="size-4" />
									</Link>
								)}
							</aside>
						);
					case "small":
						return (
							<p key={i} className="text-body text-[13px] leading-relaxed">
								{b.text}
							</p>
						);
				}
			})}
		</div>
	);
}
