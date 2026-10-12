import { OFFER_MOMENT } from "@/lib/offer";
import { container, eyebrow, media, pillLight } from "../ui";
import { MediaSlot } from "./media-slot";

/** Glozin's big centered banner → the sibling moment (the hook). */
export function MomentBanner() {
	return (
		<section className={`${container} py-6 md:py-[30px]`}>
			<div className={`${media} bg-deep flex min-h-[520px] items-center justify-center px-6 py-16 text-center text-white md:min-h-[600px]`}>
				<MediaSlot name="moment" alt="">
					{/* Fallback: soft sage light instead of a photo. */}
					<span aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,color-mix(in_oklab,var(--brand)_55%,transparent)_0%,transparent_70%)]" />
				</MediaSlot>
				<span aria-hidden className="absolute inset-0 -z-10 bg-black/25" />
				<div className="grid max-w-[640px] justify-items-center gap-4">
					<p className={eyebrow}>The moment it all lands on you</p>
					<h2 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.034em] md:text-[44px]">{OFFER_MOMENT.title}</h2>
					{OFFER_MOMENT.paragraphs.map((p) => (
						<p key={p} className="text-[16px] leading-relaxed text-white/85 md:text-[17px]">
							{p}
						</p>
					))}
					<a href="#how-it-works" className={`${pillLight} mt-3`}>
						See how sharing works
					</a>
				</div>
			</div>
		</section>
	);
}
