import { ShieldCheck } from "lucide-react";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { PRODUCT_DISCLAIMER_SHORT } from "@/lib/legal";
import { formatStorePrice } from "@/lib/money";
import { OFFER_HEADLINES, OFFER_SUBHEAD, ONE_PRICE_BADGE } from "@/lib/offer";
import { container, eyebrow, media, pillButton, pillLight } from "../ui";
import { BuyForm } from "./buy-form";
import { DocMockup } from "./doc-mockup";
import { MediaSlot } from "./media-slot";
import type { HomeData } from "./types";

const fmtDay = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });

/** Glozin's media hero: rounded full-width frame, text bottom-left, pill buttons. */
export function HomeHero({ data }: { data: HomeData }) {
	const { system } = data;
	return (
		<section className={`${container} pt-3`}>
			<div className={`${media} bg-deep flex min-h-[620px] items-end text-white md:min-h-[650px]`}>
				<MediaSlot name="hero" priority alt="">
					{/* Until a photo exists: the four parts, laid out like papers on a table. */}
					<div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
						<div className="absolute -top-10 right-[-60px] grid w-[520px] grid-cols-2 gap-5 opacity-95 max-md:right-[-170px] max-md:w-[380px] max-md:opacity-[0.18] md:top-[60px] lg:right-[40px] lg:w-[560px]">
							<DocMockup kind="binder" title="Medical Binder for an Elderly Parent" tilt={-6} />
							<DocMockup kind="sheet" title="Shared Family Care Sheet" tilt={4} className="mt-12" />
							<DocMockup kind="agreement" title="Family Caregiver Agreement" tilt={3} className="-mt-6" />
							<DocMockup kind="meeting" title="Family Meeting Kit" tilt={-4} className="mt-6" />
						</div>
						<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent md:bg-gradient-to-r md:from-black/35 md:via-transparent md:via-50% md:to-transparent" />
					</div>
				</MediaSlot>

				<div className="grid max-w-[620px] gap-5 p-6 sm:p-10 md:p-12">
					<p className={eyebrow}>The Parentkeeping Family Care System</p>
					<h1 className="text-[38px] leading-[1.1] font-semibold tracking-[-0.034em] sm:text-[48px] lg:text-[56px]">
						{OFFER_HEADLINES[data.variant]}
					</h1>
					<p className="text-[17px] leading-relaxed text-white/85">{OFFER_SUBHEAD}</p>
					<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<span className="text-[34px] font-semibold tracking-tight tabular-nums">{formatStorePrice(system.price)}</span>
						{system.compareAt !== null && (
							<span className="text-xl text-white/60 tabular-nums line-through">{formatStorePrice(system.compareAt)}</span>
						)}
						<span className="text-sm text-white/75">
							{data.foundingEndsAt ? `Founding price until ${fmtDay(data.foundingEndsAt)} · ` : ""}
							{ONE_PRICE_BADGE}
						</span>
					</div>
					{data.checkoutError && <p className="rounded-lg bg-white/15 p-3 text-sm">{data.checkoutError}</p>}
					<div className="flex flex-wrap gap-3">
						<BuyForm product={system} usVisitor={data.usVisitor} className={pillLight} />
						<a href={FREE_LIST_PATH} className={`${pillButton} border border-white/60 text-white hover:bg-white hover:text-foreground`}>
							Free Medication List
						</a>
					</div>
					<div className="grid gap-1 text-xs text-white/75">
						<p>{data.usVisitor ? "Available to US customers. " : "Paid products are US-only for now. "}{PRODUCT_DISCLAIMER_SHORT}</p>
						<p className="flex items-center gap-1.5">
							<ShieldCheck className="size-3.5" />
							14-day “if it doesn&apos;t help” guarantee
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
