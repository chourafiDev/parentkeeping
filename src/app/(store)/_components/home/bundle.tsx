import { Check, ShieldCheck } from "lucide-react";
import { PRODUCT_DISCLAIMER_SHORT } from "@/lib/legal";
import { formatStorePrice } from "@/lib/money";
import { OFFER_PARTS } from "@/lib/offer";
import { container, pillDark, section, sectionSubtitle, sectionTitle } from "../ui";
import { BuyForm } from "./buy-form";
import { DocMockup, type DocKind } from "./doc-mockup";
import type { HomeData } from "./types";

const KINDS: DocKind[] = ["binder", "sheet", "agreement", "meeting"];

/** Glozin "Bundle and Save" → one price for all four, with the spec's price anchor. */
export function Bundle({ data }: { data: HomeData }) {
	const { system, binder, agreement } = data;
	const separate = [binder?.compareAt ?? binder?.price ?? null, null, agreement?.compareAt ?? agreement?.price ?? null, null];
	const separately = (binder?.price ?? 0) + (agreement?.price ?? 0);
	const regular = system.compareAt ?? system.price;
	const difference = regular - separately;

	return (
		<section id="bundle" className={`${container} ${section} scroll-mt-28`}>
			<div className="mb-8 grid gap-2 text-center md:mb-10">
				<h2 className={sectionTitle}>One price for all four</h2>
				<p className={sectionSubtitle}>
					The Binder and the Agreement cost {formatStorePrice(separately)} bought separately. The System adds the shared sheet and the meeting kit
					{difference > 0 ? ` for ${formatStorePrice(difference)} more` : " for less"}.
				</p>
			</div>
			<ul className="grid grid-cols-2 gap-4 md:gap-[30px] lg:grid-cols-4">
				{OFFER_PARTS.map((part, i) => (
					<li key={part.name} className="grid content-start gap-3">
						<div className="relative aspect-square overflow-hidden rounded-[10px] bg-[#f5f5f5]">
							<span className="absolute inset-0 flex items-center justify-center px-[24%] py-[14%]">
								<DocMockup kind={KINDS[i]} title={part.name} />
							</span>
						</div>
						<p className="text-foreground text-[15px] leading-snug font-medium">{part.name}</p>
						<p className="text-body text-sm">{separate[i] !== null ? `${formatStorePrice(separate[i])} on its own` : "Only in the System"}</p>
						<p className="border-foreground text-foreground flex h-11 items-center justify-center gap-2 rounded-full border text-[15px] font-semibold">
							<Check className="size-4" /> Included
						</p>
					</li>
				))}
			</ul>

			{/* Glozin's "Bundle Contents" bar */}
			<div className="mt-10 grid items-center gap-5 rounded-[10px] bg-[#f5f5f5] p-6 md:grid-cols-[1fr_auto] md:p-8">
				<div className="grid gap-1">
					<p className="text-foreground text-[20px] font-semibold tracking-[-0.02em]">Family Care System · all four parts</p>
					<p className="text-body text-[15px]">
						Binder {binder ? formatStorePrice(binder.price) : ""} + Agreement {agreement ? formatStorePrice(agreement.price) : ""} ={" "}
						{formatStorePrice(separately)} separately · the Sheet and Meeting Kit come only with the System.
					</p>
				</div>
				<div className="grid justify-items-start gap-3 md:justify-items-end">
					<p className="flex items-baseline gap-2 tabular-nums">
						<span className="text-foreground text-[30px] font-semibold tracking-tight">{formatStorePrice(system.price)}</span>
						{system.compareAt && <span className="text-body text-lg line-through">{formatStorePrice(system.compareAt)}</span>}
					</p>
					<BuyForm product={system} usVisitor={data.usVisitor} className={pillDark} label={`Get all four · ${formatStorePrice(system.price)}`} />
					<p className="text-body flex items-center gap-1.5 text-xs">
						<ShieldCheck className="text-primary size-3.5" />
						{PRODUCT_DISCLAIMER_SHORT} 14-day guarantee.
					</p>
				</div>
			</div>
		</section>
	);
}
