import { existsSync } from "node:fs";
import path from "node:path";
import { inArray } from "drizzle-orm";
import { Download, MailCheck } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PRODUCT_PATHS } from "@/lib/catalog";
import { FREE_LIST_PDF } from "@/lib/free-list";
import { formatPrice } from "@/lib/money";
import { SITE } from "@/lib/site";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { getFoundingPrice } from "@/server/queries/settings";

export const metadata: Metadata = { title: "Your free list", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function FreeListThanksPage() {
	const hasPdf = existsSync(path.join(process.cwd(), "public", FREE_LIST_PDF));
	const [rows, founding] = await Promise.all([
		db.select().from(products).where(inArray(products.slug, ["medical-binder", "family-care-system"])),
		getFoundingPrice(),
	]);
	const binder = rows.find((p) => p.slug === "medical-binder");
	const system = rows.find((p) => p.slug === "family-care-system");
	const systemPrice = system && (founding.active && system.foundingPrice !== null ? system.foundingPrice : system.price);

	return (
		<main className="flex-1">
			<header className="mx-auto flex max-w-3xl items-center px-4 py-5">
				<span className="text-lg font-semibold tracking-tight">{SITE.name}</span>
			</header>
			<div className="mx-auto grid max-w-3xl gap-8 px-4 pt-6 pb-16">
				<section className="bg-card grid gap-4 rounded-2xl border p-6 text-center sm:p-8">
					<h1 className="text-3xl font-semibold tracking-tight">Here&apos;s your free list</h1>
					{hasPdf ? (
						<Button asChild size="lg" className="h-12 justify-self-center px-8 text-base">
							<a href={FREE_LIST_PDF} download>
								<Download />
								Download the Medication List (PDF)
							</a>
						</Button>
					) : process.env.NODE_ENV !== "production" ? (
						<p className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
							Dev note: the PDF isn&apos;t uploaded yet. Add it to public{FREE_LIST_PDF}.
						</p>
					) : (
						<p className="text-muted-foreground">Your list is on its way to your inbox.</p>
					)}
					<p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
						<MailCheck className="size-4" />
						Check your inbox too: we emailed you a copy.
					</p>
				</section>

				{binder?.status === "active" && (
					<section className="grid gap-4 rounded-2xl border p-6 sm:p-8">
						<p className="text-primary text-sm font-semibold tracking-wide uppercase">Next step</p>
						<h2 className="text-2xl font-semibold tracking-tight">Keep everything else in one place too</h2>
						<p className="text-muted-foreground">
							The Medical Binder for an Elderly Parent picks up where the list stops: doctors, appointments, insurance,
							paperwork, and who does what. Fillable PDF and printable.
						</p>
						<div className="flex flex-wrap items-center gap-3">
							<Button asChild size="lg" className="h-11 px-6">
								<a href={PRODUCT_PATHS[binder.slug]}>Get the Medical Binder · {formatPrice(binder.price)}</a>
							</Button>
							{system?.status === "active" && systemPrice != null && (
								<a href={PRODUCT_PATHS[system.slug]} className="text-primary text-sm font-medium underline-offset-2 hover:underline">
									Or the whole Family Care System · {formatPrice(systemPrice)}
								</a>
							)}
						</div>
						<p className="text-muted-foreground text-xs">Available to US customers. 14-day “if it doesn&apos;t help” guarantee.</p>
					</section>
				)}
			</div>
		</main>
	);
}
