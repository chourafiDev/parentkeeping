import { Check, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { BUY_LABELS } from "@/lib/catalog";
import { AGREEMENT_LEGAL_LINE, BINDER_LEGAL_LINE, BUY_GUARANTEE_LINE, PRODUCT_DISCLAIMER_SHORT, SHEET_LEGAL_LINE } from "@/lib/legal";
import { formatStorePrice } from "@/lib/money";
import { OFFER_PARTS, PRICE_ANCHOR_TITLE, presaleNote } from "@/lib/offer";
import { formatStoreDay } from "@/lib/store-time";
import { cn } from "@/lib/utils";
import { GuaranteeCard } from "../product/buy-details";
import { container, pillDark, section, sectionSubtitle, sectionTitle } from "../ui";
import { BuyForm } from "./buy-form";
import { DocMockup, type DocKind } from "./doc-mockup";
import { deliveryDate, type HomeData } from "./types";

const KINDS: DocKind[] = ["binder", "sheet", "agreement", "meeting"];

/** Glozin "Bundle and Save" → the spec's price anchor ("Less than buying the pieces"). */
export function Bundle({ data }: { data: HomeData }) {
	const { system, binder, agreement } = data;
	const separate = [binder?.compareAt ?? binder?.price ?? null, null, agreement?.compareAt ?? agreement?.price ?? null, null];
	const separately = (binder?.price ?? 0) + (agreement?.price ?? 0);
	const regular = system.compareAt ?? system.price;
	const delivery = deliveryDate(data);

	return (
		<section id="bundle" className={`${container} ${section} scroll-mt-28`}>
			<div className="mb-8 grid gap-2 text-center md:mb-10">
				<h2 className={sectionTitle}>{PRICE_ANCHOR_TITLE}</h2>
				<p className={`${sectionSubtitle} mx-auto max-w-[720px]`}>
					{binder && agreement
						? `The Medical Binder (${formatStorePrice(binder.price)}) and the Caregiver Agreement (${formatStorePrice(agreement.price)}) cost ${formatStorePrice(separately)} on their own. `
						: ""}
					The System adds the Shared Family Care Sheet and the Family Meeting Kit, for {formatStorePrice(regular)}.
					{system.compareAt ? ` Founding buyers pay ${formatStorePrice(system.price)}.` : ""}
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

			{/* Buy box: everything needed to decide, right where the price is. */}
			<div className="mt-10 grid gap-8 rounded-[10px] bg-[#f5f5f5] p-6 md:grid-cols-2 md:p-10 lg:gap-[60px]">
				<div className="grid content-start gap-4">
					<p className="text-foreground text-[24px] leading-tight font-semibold tracking-[-0.03em]">Family Care System · all four parts</p>
					<ul className="grid gap-2.5">
						{OFFER_PARTS.map((part) => (
							<li key={part.name} className="text-foreground flex items-start gap-3 text-[15px]">
								<Check className="text-primary mt-0.5 size-4 shrink-0" strokeWidth={2.25} />
								<span>
									<span className="font-medium">{part.name}</span>
									<span className="text-body"> · {part.format}</span>
								</span>
							</li>
						))}
					</ul>
					<p className="text-body text-[14px]">
						{binder && agreement
							? `Binder ${formatStorePrice(binder.price)} + Agreement ${formatStorePrice(agreement.price)} = ${formatStorePrice(separately)} separately. `
							: ""}
						The Sheet and Meeting Kit come only with the System. One purchase covers relatives caring for the same parent.
					</p>
				</div>

				<div className="grid content-start gap-3">
					<p className="flex items-baseline gap-2.5 tabular-nums">
						<span className={cn("text-primary text-[34px] font-bold tracking-tight", system.compareAt && "text-[#dc3545]")}>
							{formatStorePrice(system.price)}
						</span>
						{system.compareAt && <span className="text-body text-lg line-through">{formatStorePrice(system.compareAt)}</span>}
						{data.foundingEndsAt && (
							<span className="text-foreground text-[14px] font-medium">founding price until {formatStoreDay(data.foundingEndsAt)}</span>
						)}
					</p>
					<BuyForm
						product={system}
						usVisitor={data.usVisitor}
						className={`${pillDark} w-full`}
						label={`${BUY_LABELS[system.slug] ?? "Buy now"}${system.presale ? " · Pre-order" : ""} · ${formatStorePrice(system.price)}`}
					/>
					{data.usVisitor && system.sellable && (
						<p className="text-green flex items-center gap-1.5 text-[14px] font-medium">
							<Zap className="size-4 shrink-0 fill-current" />
							{delivery ? "Pre-order: each file downloads the moment it's ready" : "Instant download, ready the moment you pay"}
						</p>
					)}
					<div className="text-body grid gap-1 text-xs">
						<p>{PRODUCT_DISCLAIMER_SHORT}</p>
						<p className="flex items-center gap-1.5">
							<ShieldCheck className="text-primary size-3.5 shrink-0" />
							{BUY_GUARANTEE_LINE}
						</p>
					</div>
					<div className="bg-background mt-2 rounded-[10px]">
						<GuaranteeCard supportEmail={data.supportEmail} />
					</div>
					<ul className="flex flex-wrap items-center gap-1.5" aria-label="Accepted cards">
						{["visa", "mastercard", "amex", "discover", "paypal"].map((card) => (
							<li key={card} className="rounded-[4px] border bg-white p-0.5">
								<Image src={`/images/cards/${card}.png`} alt={card} width={35} height={20} />
							</li>
						))}
						<li className="text-body ms-1 text-xs">Secure payment by Stripe</li>
					</ul>
				</div>
			</div>

			{delivery && (
				<p className="mt-4 rounded-[10px] border border-[#6c4cf1]/25 bg-[#6c4cf1]/5 p-4 text-[14px] leading-relaxed text-foreground">
					<span className="mr-2 rounded-full bg-[#6c4cf1] px-2.5 py-0.5 text-xs font-semibold text-white">Pre-order</span>
					{presaleNote(formatStoreDay(delivery))}
				</p>
			)}

			{/* Product legal lines, in small type near "What's inside" (Legal doc). */}
			<div className="text-body mt-6 grid gap-2 text-xs leading-relaxed">
				<p>
					<span className="text-foreground font-semibold">Medical Binder: </span>
					{BINDER_LEGAL_LINE}
				</p>
				<p>
					<span className="text-foreground font-semibold">Shared Family Care Sheet: </span>
					{SHEET_LEGAL_LINE}
				</p>
				<p>
					<span className="text-foreground font-semibold">Caregiver Agreement: </span>
					{AGREEMENT_LEGAL_LINE}
				</p>
			</div>
		</section>
	);
}
