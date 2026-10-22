import { existsSync } from "node:fs";
import path from "node:path";
import { asc, eq, inArray } from "drizzle-orm";
import { ArrowRight, Check, Download, MailCheck } from "lucide-react";
import Link from "next/link";
import { PRODUCT_PATHS } from "@/lib/catalog";
import { BUY_GUARANTEE_LINE } from "@/lib/legal";
import type { LeadMagnet } from "@/lib/lead-magnets";
import { formatStorePrice } from "@/lib/money";
import { db } from "@/server/db";
import { productImages, products } from "@/server/db/schema";
import { getFoundingPrice } from "@/server/queries/settings";
import { DocMockup } from "../home/doc-mockup";
import { container, eyebrow, media, pillDark } from "../ui";

/** The four parts in the same short lines as the free PDFs' last page. */
const SYSTEM_PARTS = [
	{ name: "Medical Binder for an Elderly Parent", text: "64 pages for medications, doctors, appointments, insurance and paperwork." },
	{ name: "Shared Family Care Sheet", text: "One Google Sheet with a job board, a rota and a cost tracker showing each sibling's share." },
	{ name: "Family Meeting Kit", text: "An agenda and what to say for the first sibling conversation." },
	{ name: "Family Caregiver Agreement Template", text: "To write down paid or unpaid care, then take to an elder-law attorney." },
];

/**
 * Free download thank-you page: the PDF, then the Family Care System (matching
 * the free PDFs' last page), with the $19 Medical Binder as the smaller option.
 */
export async function LeadThanksPage({ magnet }: { magnet: LeadMagnet }) {
	const hasPdf = existsSync(path.join(process.cwd(), "public", magnet.pdf));
	const hasA4 = !!magnet.pdfA4 && existsSync(path.join(process.cwd(), "public", magnet.pdfA4));
	const [rows, founding, [systemImage]] = await Promise.all([
		db.select().from(products).where(inArray(products.slug, ["medical-binder", "family-care-system"])),
		getFoundingPrice(),
		db
			.select({ url: productImages.url, alt: productImages.alt })
			.from(productImages)
			.innerJoin(products, eq(products.id, productImages.productId))
			.where(eq(products.slug, "family-care-system"))
			.orderBy(asc(productImages.sortOrder))
			.limit(1),
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
						<div className="grid justify-items-center gap-2">
							<a href={magnet.pdf} download className={`${pillDark} gap-2`}>
								<Download className="size-4" />
								Download the PDF
							</a>
							{hasA4 && (
								<a href={magnet.pdfA4} download className="text-body hover:text-foreground text-[13px] underline underline-offset-2">
									Prefer A4? Download that version
								</a>
							)}
						</div>
					) : process.env.NODE_ENV !== "production" ? (
						<p className="bg-destructive/10 text-destructive rounded-[10px] p-3 text-sm">
							Dev note: the PDF isn&apos;t uploaded yet. Add it to public{magnet.pdf}.
						</p>
					) : null}
					<p className="text-body max-w-[460px] text-[15px] leading-[1.714]">{magnet.thanks.line}</p>
				</section>

				{system && (
					<section className="grid items-center gap-8 md:grid-cols-2 lg:gap-[60px]">
						<div className={`${media} aspect-square bg-[#f5f5f5]`}>
							{systemImage ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={systemImage.url} alt={systemImage.alt || "The Parentkeeping Family Care System"} className="size-full object-cover" />
							) : (
								<span className="flex size-full items-center justify-center px-[18%] py-12">
									<DocMockup kind="bundle" title="Family Care System" tilt={-4} />
								</span>
							)}
						</div>
						<div className="grid justify-items-start gap-4">
							<p className={`${eyebrow} text-primary`}>What comes next</p>
							<h2 className="text-foreground text-[28px] leading-tight font-semibold tracking-[-0.034em] md:text-[35px]">{magnet.thanks.next.title}</h2>
							<p className="text-body text-[15px] leading-[1.714]">{magnet.thanks.next.text}</p>
							<ul className="grid gap-2.5">
								{SYSTEM_PARTS.map((part) => (
									<li key={part.name} className="flex items-start gap-3 text-[15px]">
										<Check className="text-primary mt-1 size-4 shrink-0" strokeWidth={2.25} />
										<span>
											<span className="text-foreground font-medium">{part.name}.</span> <span className="text-body">{part.text}</span>
										</span>
									</li>
								))}
							</ul>
							<p className="flex flex-wrap items-baseline gap-x-2.5 tabular-nums">
								<span className="text-primary text-[26px] font-bold">{formatStorePrice(systemFounding ? system.foundingPrice! : system.price)}</span>
								{systemFounding && <span className="text-body text-[16px] line-through">{formatStorePrice(system.price)}</span>}
								<span className="text-foreground text-[14px] font-medium">
									{systemFounding ? "founding price · " : ""}one price, no subscription
								</span>
							</p>
							<Link href={PRODUCT_PATHS[system.slug]} className={`${pillDark} gap-2`}>
								See the Family Care System
								<ArrowRight className="size-4" />
							</Link>
							<p className="text-body text-xs">{BUY_GUARANTEE_LINE}</p>
							{binder && (
								<p className="text-body text-[14px] leading-relaxed">
									Just need the binder? The Medical Binder for an Elderly Parent is {formatStorePrice(binder.price)} on its own.{" "}
									<Link href={PRODUCT_PATHS[binder.slug]} className="text-foreground hover:text-primary font-semibold underline underline-offset-2">
										See the Medical Binder
									</Link>
								</p>
							)}
						</div>
					</section>
				)}
			</div>
		</main>
	);
}
