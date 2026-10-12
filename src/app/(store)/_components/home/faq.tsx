import { Plus } from "lucide-react";
import { OFFER_FAQ } from "@/lib/offer";
import { formatStoreDay } from "@/lib/store-time";
import { container, section, sectionTitle } from "../ui";
import { deliveryDate, type HomeData } from "./types";

/** FAQ (spec) in Glozin's flat accordion style. */
export function Faq({ data }: { data: HomeData }) {
	const delivery = deliveryDate(data);
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
							<p className="text-body mt-3 text-[15px] leading-[1.714]">
								{delivery ? item.a.replace("By the date shown on the page.", `By ${formatStoreDay(delivery)}.`) : item.a}
								{item.link && (
									<>
										{" "}
										<a href={item.link.href} className="text-foreground font-semibold underline underline-offset-2 hover:text-primary">
											{item.link.label}
										</a>
									</>
								)}
							</p>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
