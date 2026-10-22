import type { Metadata } from "next";
import { DEFAULT_SHARE_IMAGE } from "@/lib/share-image";
import Link from "next/link";
import { QUIZ_ARTICLE, QUIZ_INTRO, QUIZ_LINKS, QUIZ_PATH, QUIZ_SEO } from "@/lib/burnout-quiz";
import { GENERAL_INFO_LINE } from "@/lib/legal";
import { CopyBlock } from "../../_components/copy-block";
import { container, eyebrow, media } from "../../_components/ui";
import { BurnoutQuiz } from "./quiz";

export const metadata: Metadata = {
	title: { absolute: QUIZ_SEO.title },
	description: QUIZ_SEO.description,
	alternates: { canonical: QUIZ_PATH },
	openGraph: { title: QUIZ_SEO.title, description: QUIZ_SEO.description, url: QUIZ_PATH, images: [DEFAULT_SHARE_IMAGE] },
};

/**
 * Caregiver Burnout Quiz. Legal rules: scored in the browser, no answers
 * saved, and NO ad or analytics pixels on this page or its results (keep it
 * out of any tracking script added to the store later).
 */
export default function BurnoutQuizPage() {
	return (
		<main className="flex-1">
			<section className={`${container} pt-6 pb-12 md:pb-[70px]`}>
				<div className="mx-auto grid max-w-[860px] gap-8">
					<div className="grid justify-items-center gap-4 text-center">
						<p className={`${eyebrow} text-primary`}>Free self-check</p>
						<h1 className="text-foreground text-[34px] leading-[1.1] font-semibold tracking-[-0.034em] md:text-[44px]">{QUIZ_INTRO.h1}</h1>
						<p className="text-foreground max-w-[640px] text-[18px] leading-snug font-medium tracking-[-0.01em]">{QUIZ_INTRO.subhead}</p>
						<p className="text-body text-[15px] leading-[1.714]">{QUIZ_INTRO.text}</p>
					</div>
					<div className={`${media} bg-[#f5f5f5] p-6 md:p-10`}>
						<BurnoutQuiz />
					</div>
				</div>
			</section>

			<section className={`${container} border-t py-12 md:py-[70px]`}>
				<div className="mx-auto grid max-w-[860px] gap-10">
					{QUIZ_ARTICLE.map((block) => (
						<CopyBlock key={block.title} block={block} />
					))}
					<div className="grid gap-4 border-t pt-6">
						<p className="flex flex-wrap gap-x-6 gap-y-2">
							{QUIZ_LINKS.map((l) => (
								<Link key={l.href} href={l.href} className="text-foreground hover:text-primary text-[15px] font-semibold underline underline-offset-4">
									{l.label}
								</Link>
							))}
						</p>
						<p className="text-body text-xs leading-relaxed">{GENERAL_INFO_LINE}</p>
					</div>
				</div>
			</section>
		</main>
	);
}
