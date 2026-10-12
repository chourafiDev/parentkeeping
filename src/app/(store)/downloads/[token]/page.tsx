import { CalendarClock, Download, ExternalLink, FileText, Sheet } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { assetStatus } from "@/lib/assets";
import { DOWNLOAD_LIMIT } from "@/lib/orders";
import { SITE } from "@/lib/site";
import { getOrderFiles } from "@/server/queries/orders";
import { getSettings } from "@/server/queries/settings";
import { resolveDownloadLink } from "@/server/services/download-tokens";
import { StoreCard } from "../../_components/store-card";
import { RequestLinkForm } from "./request-link-form";

// The link in the URL is a key: never index it, never send it on as a referrer.
export const metadata: Metadata = {
	title: "Your downloads",
	robots: { index: false, follow: false },
	referrer: "no-referrer",
};
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
	not_in_order: "That file isn't part of this order.",
	not_ready: "That part isn't ready yet. We'll email you as soon as it is.",
	limit: `You've reached the ${DOWNLOAD_LIMIT}-download limit for that file. Write to us and we'll reset it.`,
	link: "This link no longer works.",
};

const LINK_PROBLEMS = {
	invalid: { title: "This link doesn't work", body: "Check that you copied the whole link from your order email." },
	expired: { title: "This link has expired", body: "Download links last one year. Get a fresh one below." },
	revoked: { title: "This link was replaced", body: "A newer link was sent to you. Use the latest email, or get a fresh link below." },
	refunded: { title: "This order was refunded", body: "Refunded orders no longer have downloads." },
} as const;

const fmtDate = (d: Date) =>
	d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });

export default async function DownloadsPage({ params, searchParams }: PageProps<"/downloads/[token]">) {
	const { token } = await params;
	const error = (await searchParams).error;
	const [link, { contact }] = await Promise.all([resolveDownloadLink(token), getSettings("contact")]);
	const support = contact.supportEmail;

	if (!link.ok) {
		const problem = LINK_PROBLEMS[link.reason];
		return (
			<StoreCard>
				<div className="grid gap-4 text-center">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">{problem.title}</h1>
						<p className="text-muted-foreground mt-1">{problem.body}</p>
					</div>
					{link.reason !== "refunded" && <RequestLinkForm />}
					{support && (
						<p className="text-muted-foreground text-sm">
							Need help? <a href={`mailto:${support}`} className="text-primary underline-offset-2 hover:underline">{support}</a>
						</p>
					)}
				</div>
			</StoreCard>
		);
	}

	const { order } = link;
	const files = await getOrderFiles(order.id, order.downloadsResetAt);
	const t = encodeURIComponent(token);

	return (
		<StoreCard wide>
			<div className="grid gap-6">
				<div>
					<p className="text-muted-foreground text-sm">Order #{order.orderNumber}</p>
					<h1 className="text-2xl font-semibold tracking-tight">Your downloads</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Bookmark this page: the link works for a year. PDFs open in any PDF reader; the fillable ones work best in
						Adobe Acrobat Reader.
					</p>
				</div>

				{typeof error === "string" && ERRORS[error] && (
					<p role="alert" className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
						{ERRORS[error]}
					</p>
				)}

				<ul className="divide-y rounded-xl border">
					{files.map((f) => {
						const status = assetStatus(f);
						const Icon = f.kind === "pdf" ? FileText : Sheet;
						const left = DOWNLOAD_LIMIT - f.downloads;
						const atLimit = f.kind === "pdf" && left <= 0;
						return (
							<li key={f.id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
								<span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
									<Icon className="size-5" />
								</span>
								<div className="grid min-w-0 flex-1 gap-0.5">
									<span className="font-medium">{f.label}</span>
									<span className="text-muted-foreground text-xs">
										{status === "presale"
											? `Pre-sale part: arrives by ${fmtDate(f.availableAt!)}. We'll email you when it's ready.`
											: status === "missing"
												? "Coming soon. We'll email you when it's ready."
												: f.kind === "sheet_link"
													? "Opens Google Sheets and makes your own copy. Share it with your family from there."
													: atLimit
														? "Download limit reached."
														: left <= 5
															? `${left} download${left === 1 ? "" : "s"} left`
															: "PDF"}
									</span>
								</div>
								{/* Phones: the action gets its own full-width row under the title. */}
								<div className="w-full sm:w-auto">
								{status === "ready" ? (
									atLimit ? (
										<Button variant="outline" disabled className="w-full sm:w-auto">
											Limit reached
										</Button>
									) : (
										<Button asChild variant={f.kind === "pdf" ? "default" : "outline"} className="w-full sm:w-auto">
											<a
												href={`/api/download/${f.id}?t=${t}`}
												{...(f.kind === "sheet_link" && { target: "_blank", rel: "noreferrer noopener" })}
											>
												{f.kind === "pdf" ? <Download /> : <ExternalLink />}
												{f.kind === "pdf" ? "Download" : "Make a copy"}
											</a>
										</Button>
									)
								) : (
									<span className="text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex sm:justify-end">
										<CalendarClock className="size-4" />
										{status === "presale" ? fmtDate(f.availableAt!).replace(/, \d{4}$/, "") : "Soon"}
									</span>
								)}
								</div>
							</li>
						);
					})}
				</ul>

				<div className="text-muted-foreground grid gap-1 text-xs">
					<p>
						14-day “if it doesn&apos;t help” guarantee. An organizing tool, not medical or legal advice.{" "}
						<a href="/policies/refund-policy" className="underline underline-offset-2">
							Refund policy
						</a>
					</p>
					<p>
						{SITE.name}
						{support && (
							<>
								{" · "}
								<a href={`mailto:${support}`} className="underline underline-offset-2">
									{support}
								</a>
							</>
						)}
					</p>
				</div>
			</div>
		</StoreCard>
	);
}
