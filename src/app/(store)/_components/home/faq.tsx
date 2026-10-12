import { Plus } from "lucide-react";
import { AGREEMENT_LEGAL_LINE, BINDER_LEGAL_LINE, SHEET_LEGAL_LINE } from "@/lib/legal";
import { OFFER_FAQ } from "@/lib/offer";
import { container, section, sectionTitle } from "../ui";

/** FAQ (spec) in Glozin's flat accordion style, with the product legal lines. */
export function Faq() {
	return (
		<section className={`${container} ${section}`}>
			<div className="mx-auto grid max-w-[860px] gap-8">
				<h2 className={`${sectionTitle} text-center`}>Questions</h2>
				<div className="border-t">
					{OFFER_FAQ.map((item) => (
						<details key={item.q} className="group border-b py-5">
							<summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
								{item.q}
								<Plus className="size-5 shrink-0 transition-transform group-open:rotate-45" />
							</summary>
							<p className="text-body mt-3 text-[15px] leading-[1.714]">{item.a}</p>
						</details>
					))}
				</div>
				<div className="text-body grid gap-1 text-xs">
					<p>{BINDER_LEGAL_LINE}</p>
					<p>{AGREEMENT_LEGAL_LINE}</p>
					<p>{SHEET_LEGAL_LINE}</p>
				</div>
			</div>
		</section>
	);
}
