import type { FaqItem } from "@/lib/offer";
import { FaqList } from "../faq-list";
import { container, eyebrow, sectionTitle } from "../ui";

/** Slate's FAQ: grey band, title on the left, white accordion card on the right, legal lines under it. */
export function ProductFaqBand({ items, supportEmail, legal }: { items: FaqItem[]; supportEmail: string | null; legal: { label?: string; text: string }[] }) {
	return (
		<section className="bg-[#f5f5f5] py-12 md:py-[70px]">
			<div className={`${container} grid gap-8 md:grid-cols-[1fr_2fr] md:gap-[60px]`}>
				<div className="grid content-start gap-3">
					{/* DRAFT eyebrow */}
					<p className={`${eyebrow} text-primary`}>Before you buy</p>
					<h2 className={sectionTitle}>Questions</h2>
					{supportEmail && (
						<p className="text-body text-[15px] leading-[1.714]">
							Something else? Email{" "}
							<a href={`mailto:${supportEmail}`} className="text-foreground font-semibold underline underline-offset-4">
								{supportEmail}
							</a>
							.
						</p>
					)}
				</div>
				<div className="grid gap-6">
					<div className="rounded-[10px] bg-white px-6 md:px-8 [&>div]:border-t-0 [&_details:last-child]:border-b-0">
						<FaqList items={items} />
					</div>
					<div className="text-body grid gap-2 text-xs leading-relaxed">
						{legal.map((line) => (
							<p key={line.text}>
								{line.label && <span className="text-foreground font-semibold">{line.label}: </span>}
								{line.text}
							</p>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
