import { ShieldCheck } from "lucide-react";
import { BUY_GUARANTEE_LINE, PRODUCT_DISCLAIMER_SHORT } from "@/lib/legal";
import { GUARANTEE_TITLE, guaranteeText } from "@/lib/offer";
import { container, eyebrow, media, pillLight } from "../ui";
import { BuyForm } from "./buy-form";
import { MediaSlot } from "./media-slot";
import type { HomeData } from "./types";

/** Glozin's closing media banner → the 14-day guarantee and one last Buy. */
export function ClosingBanner({ data }: { data: HomeData }) {
	return (
		<section className={`${container} pt-6 pb-12 md:pt-[30px] md:pb-[70px]`}>
			<div className={`${media} bg-deep flex min-h-[480px] items-center justify-center px-6 py-16 text-center text-white md:min-h-[560px]`}>
				<MediaSlot name="closing" alt="">
					<span aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,color-mix(in_oklab,var(--brand)_60%,transparent)_0%,transparent_70%)]" />
				</MediaSlot>
				<span aria-hidden className="absolute inset-0 -z-10 bg-black/20" />
				<div className="grid max-w-[560px] justify-items-center gap-4">
					<ShieldCheck className="size-9" strokeWidth={1.5} />
					<p className={eyebrow}>14-day “if it doesn&apos;t help” guarantee</p>
					<h2 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.034em] md:text-[40px]">{GUARANTEE_TITLE}</h2>
					<p className="text-[16px] leading-relaxed text-white/85">{guaranteeText(data.supportEmail)}</p>
					<div className="mt-3">
						<BuyForm product={data.system} className={pillLight} />
					</div>
					<div className="grid gap-1 text-xs text-white/70">
						<p>{PRODUCT_DISCLAIMER_SHORT}</p>
						<p>{BUY_GUARANTEE_LINE}</p>
					</div>
				</div>
			</div>
		</section>
	);
}
