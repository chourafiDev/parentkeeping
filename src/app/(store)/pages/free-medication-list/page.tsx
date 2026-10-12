import { existsSync } from "node:fs";
import path from "node:path";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { VARIANT_COOKIE } from "@/lib/catalog";
import { FREE_LIST_CONTENTS, FREE_LIST_HEADLINE, FREE_LIST_SUBHEADS } from "@/lib/free-list";
import { MEDICATION_LEGAL_LINE } from "@/lib/legal";
import { SITE } from "@/lib/site";
import { needsOptIn } from "@/server/services/subscribers";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
	title: "Free Printable Medication List & Daily Medication Chart",
	description:
		"A free printable medication list for an aging parent: prescriptions, over-the-counter meds, a daily medication chart, a changes log and wallet cards.",
};
export const dynamic = "force-dynamic";

const PREVIEWS = ["page-1", "page-2", "page-3"];

/** Real page previews once they exist in public/files/previews, sketches until then. */
function Preview({ name, index }: { name: string; index: number }) {
	const file = `/files/previews/${name}.png`;
	if (existsSync(path.join(process.cwd(), "public", file))) {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={file} alt={`Page ${index + 1} of the free medication list`} className="w-full rounded-lg border shadow-sm" />;
	}
	const titles = ["Prescription Medication List", "Daily Medication Chart", "Wallet cards"];
	return (
		<div aria-hidden className="bg-card grid aspect-[8.5/11] content-start gap-2 overflow-hidden rounded-lg border p-3 shadow-sm">
			<span className="text-primary text-[10px] font-semibold tracking-wide uppercase">{SITE.name}</span>
			<span className="line-clamp-2 min-h-10 text-sm font-semibold">{titles[index]}</span>
			{Array.from({ length: 9 }, (_, i) => (
				<span key={i} className="bg-muted h-3 rounded" style={{ width: `${90 - (i % 3) * 15}%` }} />
			))}
		</div>
	);
}

export default async function FreeMedicationListPage({ searchParams }: PageProps<"/pages/free-medication-list">) {
	const params = await searchParams;
	const variant = (await cookies()).get(VARIANT_COOKIE)?.value === "fairness" ? "fairness" : "one_place";
	// Dev only: ?country=GB previews what EU/UK visitors see.
	const devCountry =
		process.env.NODE_ENV !== "production" && typeof params.country === "string" ? params.country.toUpperCase() : undefined;
	const country = devCountry ?? (await headers()).get("x-vercel-ip-country");
	const optIn = needsOptIn(country);
	const error = typeof params.error === "string" ? params.error : null;

	return (
		<main className="flex-1">

			<section id="signup" className="mx-auto grid max-w-5xl items-center gap-10 px-4 pt-6 pb-16 md:grid-cols-[1.1fr_1fr]">
				<div className="grid gap-5">
					<p className="text-primary text-sm font-semibold tracking-wide uppercase">Free printable</p>
					<h1 className="text-4xl leading-tight font-semibold tracking-tight md:text-5xl">{FREE_LIST_HEADLINE}</h1>
					<p className="text-muted-foreground text-lg">{FREE_LIST_SUBHEADS[variant]}</p>
					{error && (
						<p role="alert" className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
							{error}
						</p>
					)}
					<SignupForm id="top" optIn={optIn} devCountry={devCountry} />
				</div>
				<div className="grid grid-cols-3 gap-3">
					{PREVIEWS.map((p, i) => (
						<Preview key={p} name={p} index={i} />
					))}
				</div>
			</section>

			<section className="bg-muted/60 border-y">
				<div className="mx-auto max-w-5xl px-4 py-16">
					<h2 className="text-2xl font-semibold tracking-tight">What&apos;s inside</h2>
					<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{FREE_LIST_CONTENTS.map((item) => (
							<li key={item.title} className="bg-card flex gap-3 rounded-xl border p-4">
								<CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" />
								<span className="grid gap-0.5">
									<span className="font-medium">{item.title}</span>
									<span className="text-muted-foreground text-sm">{item.text}</span>
								</span>
							</li>
						))}
					</ul>
					<p className="text-muted-foreground mt-6 text-sm">{MEDICATION_LEGAL_LINE}</p>
				</div>
			</section>

			<section className="mx-auto grid max-w-2xl gap-5 px-4 py-16 text-center">
				<h2 className="text-2xl font-semibold tracking-tight">Get the free list</h2>
				<p className="text-muted-foreground">Print it today, fill it in once, and keep a copy in your wallet.</p>
				<div className="text-start">
					<SignupForm id="bottom" optIn={optIn} devCountry={devCountry} />
				</div>
			</section>
		</main>
	);
}
