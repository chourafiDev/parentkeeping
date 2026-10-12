import { OFFER_FAQ } from "@/lib/offer";
import { formatStoreDay } from "@/lib/store-time";
import { FaqList } from "../faq-list";
import { container, section, sectionTitle } from "../ui";
import { deliveryDate, type HomeData } from "./types";

/** FAQ (spec) in Glozin's flat accordion style; the pre-sale answer names the date. */
export function Faq({ data }: { data: HomeData }) {
	const delivery = deliveryDate(data);
	const items = delivery
		? OFFER_FAQ.map((item) => ({ ...item, a: item.a.replace("By the date shown on the page.", `By ${formatStoreDay(delivery)}.`) }))
		: OFFER_FAQ;
	return (
		<section className={`${container} ${section}`}>
			<div className="mx-auto grid max-w-[860px] gap-8">
				<h2 className={`${sectionTitle} text-center`}>Questions</h2>
				<FaqList items={items} />
			</div>
		</section>
	);
}
