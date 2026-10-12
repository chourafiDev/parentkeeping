import { existsSync } from "node:fs";
import path from "node:path";
import { inArray } from "drizzle-orm";
import { ArrowRight, Download, MailCheck } from "lucide-react";
import Link from "next/link";
import { PRODUCT_PATHS } from "@/lib/catalog";
import { BUY_GUARANTEE_LINE } from "@/lib/legal";
import type { LeadMagnet } from "@/lib/lead-magnets";
import { formatStorePrice } from "@/lib/money";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { getFoundingPrice } from "@/server/queries/settings";
import { DocMockup } from "../home/doc-mockup";
import { container, eyebrow, media, pillDark } from "../ui";

/**
 * Free download thank-you page: the PDF, then the $19 Medical Binder first
 * and the Family Care System as the bigger option (SEO plan).
 */
export async function LeadThanksPage({ magnet }: { magnet: LeadMagnet }) {
	const hasPdf = existsSync(path.join(process.cwd(), "public", magnet.pdf));
	const [rows, founding] = await Promise.all([
		db.select().from(products).where(inArray(products.slug, ["medical-binder", "family-care-system"])),
		getFoundingPrice(),
	]);
	const binder = rows.find((p) => p.slug === "medical-binder" && p.status === "active");
	const system = rows.find((p) => p.slug === "family-care-system" && p.status === "active");
	const systemFounding = !!system && founding.active && system.foundingPrice !== null && !!system.foundingPriceId;

	return (
		<main className="flex-1">
			<div className={`${container} grid gap-[30px] pt-6 pb-12 md:pb-[70px]`}>
				<section className={`${media} grid justify-items-center gap-5 bg-[#f5f5f5] px-6 py-14 text-center md:py-20`}>
					<MailCheck className="text-primary size-9" strokeWidth={1.5} />
					<h1 className="text-foreground text-[32px] leading-[1.1] font-semibold tracking-[-0.034em] md:text-[44px]">{magnet.thanks.h1}</h1>
					{hasPdf ? (
						<a href={magnet.pdf} download className={`${pillDark} gap-2`}>
							<Download className="size-4" />
							Download the PDF
						</a>
					) : process.env.NODE_ENV !== "production" ? (
						<p className="bg-destructive/10 text-destructive rounded-[10px] p-3 text-sm">
							Dev note: the PDF isn&apos;t uploaded yet. Add it to public{magnet.pdf}.
						</p>
					) : null}
					<p className="text-body max-w-[460px] text-[15px] leading-[1.714]">{magnet.thanks.line}</p>
				</section>

				{binder && (
					<section className="grid items-center gap-8 md:grid-cols-2 lg:gap-[60px]">
						<div className={`${media} bg-[#f5f5f5] px-[18%] py-12`}>
							<DocMockup kind="binder" title="Medical Binder for an Elderly Parent" tilt={-4} />
						</div>
						<div className="grid justify-items-start gap-4">
							<p className={`${eyebrow} text-primary`}>Next step</p>
							<h2 className="text-foreground text-[28px] leading-tight font-semibold tracking-[-0.034em] md:text-[35px]">
								Want everything else in one place too?
							</h2>
							<p className="text-body text-[15px] leading-[1.714]">
								The Medical Binder for an Elderly Parent picks up where this list stops: doctors, appointments, insurance, paperwork, a “Who does
								what” page for siblings and a weekly Sunday check-in. {formatStorePrice(binder.price)}.
							</p>
							<Link href={PRODUCT_PATHS[binder.slug]} className={`${pillDark} gap-2`}>
								See the Medical Binder
								<ArrowRight className="size-4" />
							</Link>
							{system && (
								<p className="text-body text-[14px] leading-relaxed">
									Or get the binder plus a shared Google Sheet, the Caregiver Agreement and a Family Meeting Kit in the Family Care System,{" "}
									{systemFounding ? `${formatStorePrice(system.foundingPrice!)} founding price` : formatStorePrice(system.price)}.{" "}
									<Link href={PRODUCT_PATHS[system.slug]} className="text-foreground hover:text-primary font-semibold underline underline-offset-2">
										See the System
									</Link>
								</p>
							)}
							<p className="text-body text-xs">{BUY_GUARANTEE_LINE}</p>
						</div>
					</section>
				)}
			</div>
		</main>
	);
}
