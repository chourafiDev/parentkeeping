import { ShieldCheck } from "lucide-react";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { PRODUCT_DISCLAIMER_SHORT } from "@/lib/legal";
import { OFFER_HEADLINES, OFFER_SUBHEAD } from "@/lib/offer";
import { container, eyebrow, media, pillLight } from "../ui";
import { BuyForm } from "./buy-form";
import { DocMockup } from "./doc-mockup";
import { MediaSlot } from "./media-slot";
import type { HomeData } from "./types";

export function HomeHero({ data }: { data: HomeData }) {
	const { system } = data;

	return (
		<section className={`${container} pt-3`}>
			<div
				className={`
                    ${media}
                    relative isolate flex
                    min-h-[620px] items-end
                    overflow-hidden text-white
                    md:min-h-[650px]
                `}
			>
				{/* HERO BACKGROUND */}
				<div className="absolute inset-0 z-0 overflow-hidden">
					<MediaSlot name="hero" priority alt="">
						{/* Fallback document mockups */}
						<div
							aria-hidden="true"
							className="absolute inset-0 -z-10 overflow-hidden"
						>
							<div
								className="
                                    absolute -top-10 right-[-60px]
                                    grid w-[520px] grid-cols-2 gap-5
                                    opacity-95
                                    max-md:right-[-170px]
                                    max-md:w-[380px]
                                    max-md:opacity-[0.18]
                                    md:top-[60px]
                                    lg:right-[40px]
                                    lg:w-[560px]
                                "
							>
								<DocMockup
									kind="binder"
									title="Medical Binder for an Elderly Parent"
									tilt={-6}
								/>

								<DocMockup
									kind="sheet"
									title="Shared Family Care Sheet"
									tilt={4}
									className="mt-12"
								/>

								<DocMockup
									kind="agreement"
									title="Family Caregiver Agreement"
									tilt={3}
									className="-mt-6"
								/>

								<DocMockup
									kind="meeting"
									title="Family Meeting Kit"
									tilt={-4}
									className="mt-6"
								/>
							</div>
						</div>
					</MediaSlot>
				</div>

				{/* BASE COLOR OVERLAY */}
				<div
					aria-hidden="true"
					className="
                        pointer-events-none
                        absolute inset-0 z-10
                        bg-black/10
                    "
				/>

				{/* PREMIUM GRADIENT OVERLAY */}
				<div
					aria-hidden="true"
					className="
                        pointer-events-none
                        absolute inset-0 z-10

                        bg-gradient-to-t
                        from-deep
                        via-deep/80
                        to-deep/20

                        md:bg-gradient-to-r
                        md:from-deep
                        md:via-deep/70
                        md:to-transparent
                    "
				/>

				{/* HERO CONTENT */}
				<div
					className="
                        relative z-20
                        grid max-w-[780px] gap-5
                        p-6 sm:p-10 md:p-12
                    "
				>
					{/* EYEBROW */}
					<p className={eyebrow}>The Parentkeeping Family Care System</p>

					{/* HEADLINE */}
					<h1
						className="
                            text-[38px] leading-[1.1]
                            font-semibold
                            tracking-[-0.034em]
                            sm:text-[48px]
                            lg:text-[56px]
                        "
					>
						{OFFER_HEADLINES[data.variant]}
					</h1>

					{/* DESCRIPTION */}
					<p
						className="
                            mb-10
                            text-[17px] leading-relaxed
                            text-white/90
                        "
					>
						{OFFER_SUBHEAD}
					</p>

					{/* CHECKOUT ERROR */}
					{data.checkoutError && (
						<p className="rounded-lg bg-white/15 p-3 text-sm">
							{data.checkoutError}
						</p>
					)}

					{/* CTA: one main button; the free list is a quieter text link. */}
					<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
						<BuyForm
							product={system}
							className={pillLight}
						/>

						<a
							href={FREE_LIST_PATH}
							className="text-[15px] font-medium text-white/90 underline underline-offset-4 transition-colors hover:text-white"
						>
							Or start with the free Medication List
						</a>
					</div>

					{/* DISCLAIMERS */}
					<div className="space-y-2 text-xs text-white/80">
						<p>
							{PRODUCT_DISCLAIMER_SHORT}
						</p>

						<div className="bg-primary/30 rounded-md p-2 inline-flex">
							<p className="flex items-center gap-1.5">
								<ShieldCheck className="size-3.5" />
								14-day “if it doesn&apos;t help” guarantee
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
