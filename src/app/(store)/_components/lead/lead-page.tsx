import { existsSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { VARIANT_COOKIE } from "@/lib/catalog";
import type { LeadMagnet } from "@/lib/lead-magnets";
import { cn } from "@/lib/utils";
import { needsOptIn } from "@/server/services/subscribers";
import { CopyBlock } from "../copy-block";
import { FaqList } from "../faq-list";
import { DocMockup } from "../home/doc-mockup";
import { InsideGrid } from "../inside-grid";
import { visitorCountry } from "../product-data";
import { container, eyebrow, media, sectionTitle } from "../ui";
import { LeadForm } from "./lead-form";

/** A page preview from public/files/previews, or a drawn sheet until it exists. */
function Preview({ file, title, tilt }: { file: string; title: string; tilt: number }) {
	const src = `/files/previews/${file}.png`;
	if (existsSync(path.join(process.cwd(), "public", src))) {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={src} alt={`${title} page`} style={{ rotate: `${tilt}deg` }} className="w-full rounded-md shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]" />;
	}
	return <DocMockup kind="list" title={title} tilt={tilt} />;
}

export async function LeadMagnetPage({ magnet, searchParams }: { magnet: LeadMagnet; searchParams: Record<string, string | string[] | undefined> }) {
	const variant = (await cookies()).get(VARIANT_COOKIE)?.value === "fairness" ? "fairness" : "one_place";
	const country = await visitorCountry(searchParams.country);
	// Dev only: ?country=GB previews what EU/UK visitors see (passed on to the API).
	const devCountry = process.env.NODE_ENV !== "production" && typeof searchParams.country === "string" ? country ?? undefined : undefined;
	const optIn = needsOptIn(country);
	const error = typeof searchParams.error === "string" ? searchParams.error : null;
	const tilts = [-5, 3, -2];

	return (
		<main className="flex-1">
			<section id="signup" className={`${container} scroll-mt-28 py-12 md:pb-[70px]`}>
				<div className="grid items-center gap-8 md:grid-cols-2 lg:gap-[60px]">
					<div className="grid gap-5">
						<p className={`${eyebrow} text-primary`}>Free printable</p>
						<h1 className="text-foreground text-[34px] leading-[1.1] font-semibold tracking-[-0.034em] md:text-[44px]">{magnet.h1}</h1>
						<p className="text-foreground text-[18px] leading-snug font-medium tracking-[-0.01em]">{magnet.subheads[variant]}</p>
						{magnet.intro && <p className="text-body text-[15px] leading-[1.714]">{magnet.intro}</p>}
						{error && (
							<p role="alert" className="bg-destructive/10 text-destructive rounded-[10px] p-3 text-sm">
								{error}
							</p>
						)}
						<LeadForm magnet={magnet} optIn={optIn} devCountry={devCountry} id="top" />
					</div>
					<div className="grid gap-4">
						<div className={`${media} bg-[#f5f5f5] px-[8%] py-12 md:py-16`}>
							<div className={cn("mx-auto grid max-w-[520px] items-center gap-4", magnet.previews.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
								{magnet.previews.map((p, i) => (
									<Preview key={p.file} file={p.file} title={p.title} tilt={tilts[i] ?? 0} />
								))}
							</div>
						</div>
						{magnet.previewLegal && <p className="text-body text-xs leading-relaxed">{magnet.previewLegal}</p>}
					</div>
				</div>
			</section>

			<InsideGrid title={magnet.inside.title} items={magnet.inside.items.map((i) => ({ name: i.title, text: i.text }))} />

			<section className={`${container} pb-12 md:pb-[70px]`}>
				<div className="mx-auto grid max-w-[860px] gap-10">
					{magnet.article.map((block) => (
						<CopyBlock key={block.title} block={block} />
					))}
				</div>
			</section>

			<section className={`${container} pb-12 md:pb-[70px]`}>
				<div className="mx-auto grid max-w-[860px] gap-8">
					<h2 className={`${sectionTitle} text-center`}>Questions</h2>
					<FaqList items={magnet.faq} />
					<p className="text-body text-xs leading-relaxed">{magnet.legal}</p>
				</div>
			</section>

			{/* Glozin's closing banner, with the second form */}
			<section className={`${container} pb-12 md:pb-[70px]`}>
				<div className={`${media} bg-deep flex min-h-[380px] items-center justify-center px-6 py-14 text-white md:min-h-[420px]`}>
					<span
						aria-hidden
						className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,color-mix(in_oklab,var(--brand)_60%,transparent)_0%,transparent_70%)]"
					/>
					<div className="grid w-full max-w-[600px] gap-5">
						<div className="grid gap-3 text-center">
							<p className={eyebrow}>Free printable</p>
							<h2 className="text-[30px] leading-[1.15] font-semibold tracking-[-0.034em] md:text-[38px]">{magnet.closingTitle}</h2>
						</div>
						<LeadForm magnet={magnet} optIn={optIn} devCountry={devCountry} id="bottom" tone="dark" />
					</div>
				</div>
			</section>
		</main>
	);
}
