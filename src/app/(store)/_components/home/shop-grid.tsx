"use client";

import { useState } from "react";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { formatStorePrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import { container, section, sectionTitle } from "../ui";
import { DocMockup, type DocKind } from "./doc-mockup";
import type { HomeProduct } from "./types";

export type ShopCard = {
	product: HomeProduct | null; // null = the free list
	kind: DocKind;
	title: string;
	href: string;
	tab: "bundle" | "single" | "free";
};

const TABS = [
	{ id: "all", label: "All" },
	{ id: "bundle", label: "Bundle" },
	{ id: "single", label: "Single products" },
	{ id: "free", label: "Free" },
] as const;

// Card buttons: pill look, but no 180px minimum (two cards share a phone row).
const action =
	"inline-flex h-11 w-full items-center justify-center rounded-full border border-foreground px-4 text-[15px] font-semibold tracking-[-0.024em] text-foreground transition-colors hover:bg-foreground hover:text-white";

/** Glozin "Best Selling": tabs, light-grey media, sale / pre-order badges, price. */
export function ShopGrid({ cards, usVisitor }: { cards: ShopCard[]; usVisitor: boolean }) {
	const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
	const shown = cards.filter((c) => tab === "all" || c.tab === tab);

	return (
		<section className={`${container} ${section}`}>
			<h2 className={`${sectionTitle} text-center`}>Shop Parentkeeping</h2>
			<div role="tablist" aria-label="Filter products" className="mx-auto mt-6 mb-8 flex max-w-full justify-center gap-1 overflow-x-auto md:mb-10">
				{TABS.map((t) => (
					<button
						key={t.id}
						role="tab"
						type="button"
						aria-selected={tab === t.id}
						onClick={() => setTab(t.id)}
						className={cn(
							"shrink-0 border-b-2 px-4 pb-2.5 text-[15px] font-semibold transition-colors",
							tab === t.id ? "border-foreground text-foreground" : "text-body hover:text-foreground border-transparent",
						)}
					>
						{t.label}
					</button>
				))}
			</div>
			<ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-[30px] lg:grid-cols-4">
				{shown.map((card) => {
					const p = card.product;
					const discount = p?.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
					return (
						<li key={card.title} className="grid content-start gap-3">
							<a href={card.href} className="group relative block aspect-square overflow-hidden rounded-[10px] bg-[#f5f5f5]">
								<span className="absolute inset-0 flex items-center justify-center px-[24%] py-[14%] transition-transform duration-500 group-hover:scale-[1.05]">
									<DocMockup kind={card.kind} title={card.title} />
								</span>
								<span className="absolute top-3 left-3 grid justify-items-start gap-1.5">
									{discount > 0 && <span className="rounded-full bg-[#dc3545] px-2.5 py-0.5 text-xs font-semibold text-white">-{discount}%</span>}
									{p?.presale && <span className="rounded-full bg-[#6c4cf1] px-2.5 py-0.5 text-xs font-semibold text-white">Pre-order</span>}
									{!p && <span className="bg-primary rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">Free</span>}
								</span>
							</a>
							<a href={card.href} className="text-foreground line-clamp-2 min-h-[2.75em] text-[15px] leading-snug font-medium hover:underline">
								{card.title}
							</a>
							<p className="text-[15px] font-semibold tabular-nums">
								{p ? (
									<>
										<span className={cn(p.compareAt && "text-[#dc3545]")}>{formatStorePrice(p.price)}</span>
										{p.compareAt && <span className="text-body ms-2 font-normal line-through">{formatStorePrice(p.compareAt)}</span>}
									</>
								) : (
									"Free"
								)}
							</p>
							{p ? (
								!usVisitor ? (
									<a href={FREE_LIST_PATH} className={action}>
										US only for now
									</a>
								) : p.sellable ? (
									<form action="/api/checkout" method="post">
										<input type="hidden" name="slug" value={p.slug} />
										<button type="submit" className={action}>
											Buy now
										</button>
									</form>
								) : (
									<a href={card.href} className={action}>
										See details
									</a>
								)
							) : (
								<a href={FREE_LIST_PATH} className={action}>
									Get it free
								</a>
							)}
						</li>
					);
				})}
			</ul>
			<p className="text-body mt-8 text-center text-xs">
				Paid products available to US customers · An organizing tool, not medical or legal advice · 14-day “if it doesn&apos;t help” guarantee
			</p>
		</section>
	);
}
