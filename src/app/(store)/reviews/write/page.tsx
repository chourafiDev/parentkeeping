import type { Metadata } from "next";
import { getReviewableOrder } from "@/server/services/reviews";
import { container } from "../../_components/ui";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = { title: "Write a review", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Reached only from the signed link in the review-request email. */
export default async function WriteReviewPage({ searchParams }: PageProps<"/reviews/write">) {
	const { o, sig } = await searchParams;
	const order = typeof o === "string" && typeof sig === "string" ? await getReviewableOrder(o, sig) : null;

	return (
		<main className={`${container} flex-1 py-12 md:py-16`}>
			<div className="mx-auto grid max-w-[640px] gap-8">
				{!order ? (
					<div className="grid gap-2 text-center">
						<h1 className="text-foreground text-[28px] font-semibold tracking-[-0.034em]">This link doesn&apos;t work</h1>
						<p className="text-body">Use the “Write a review” button in your email from us. It&apos;s tied to your order.</p>
					</div>
				) : order.products.every((p) => p.reviewed) ? (
					<div className="grid gap-2 text-center">
						<h1 className="text-foreground text-[28px] font-semibold tracking-[-0.034em]">Thank you</h1>
						<p className="text-body">You&apos;ve already reviewed everything on order #{order.orderNumber}.</p>
					</div>
				) : (
					<>
						<div className="grid gap-2 text-center">
							<h1 className="text-foreground text-[30px] leading-tight font-semibold tracking-[-0.034em]">How is it going?</h1>
							<p className="text-body text-[15px] leading-[1.7]">
								Your review helps the next family decide. Good or bad, write it the way you&apos;d tell a friend. We publish honest
								reviews and never edit your words.
							</p>
						</div>
						<ReviewForm
							orderId={o as string}
							sig={sig as string}
							suggestedName={order.suggestedName}
							products={order.products.filter((p) => !p.reviewed).map(({ productId, title }) => ({ productId, title }))}
						/>
					</>
				)}
			</div>
		</main>
	);
}
