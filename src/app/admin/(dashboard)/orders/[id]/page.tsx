import { format } from "date-fns";
import { ArrowLeft, ExternalLink, FileArchive, FileText, Sheet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assetStatus, isUploadedFile } from "@/lib/assets";
import { formatPrice } from "@/lib/money";
import { countryName, formatOrderNumber, ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { getOrderDetail } from "@/server/queries/orders";
import { FormCard } from "../../_components/shared/form-card";
import { OrderActions } from "./_components/order-actions";
import { OrderTimeline } from "./_components/order-timeline";

const paramsSchema = z.object({ id: z.uuid() });

async function load(params: Promise<{ id: string }>) {
	const parsed = paramsSchema.safeParse(await params);
	if (!parsed.success) notFound();
	const detail = await getOrderDetail(parsed.data.id);
	if (!detail) notFound();
	return detail;
}

export async function generateMetadata({ params }: PageProps<"/admin/orders/[id]">): Promise<Metadata> {
	const { order } = await load(params);
	return { title: `Order ${formatOrderNumber(order.orderNumber)}` };
}

function Row({ label, value, strong, muted }: { label: string; value: React.ReactNode; strong?: boolean; muted?: boolean }) {
	return (
		<div className={cn("flex justify-between gap-4 text-sm", strong && "font-semibold", muted && "text-muted-foreground")}>
			<span className={cn(!strong && "text-muted-foreground")}>{label}</span>
			<span className="text-end tabular-nums [overflow-wrap:anywhere]">{value}</span>
		</div>
	);
}

/** Stripe dashboard links (test or live, from the secret key). */
const stripeDashboard = (path: string) =>
	`https://dashboard.stripe.com${process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "" : "/test"}/${path}`;

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
	const { user } = await requireStaffPage({ order: ["read"] });
	const { order, items, files, events, links } = await load(params);
	const number = formatOrderNumber(order.orderNumber);
	const canSeeMoney = hasPermission(user.role, { finance: ["read"] }) || hasPermission(user.role, { order: ["refund"] });

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-2">
				<Button asChild variant="ghost" size="icon" aria-label="Back to orders" className="bg-grey">
					<Link href="/admin/orders">
						<ArrowLeft className="size-4" />
					</Link>
				</Button>
				<h1 className="text-lg font-semibold tabular-nums">{number}</h1>
				<Badge variant="outline" className={ORDER_STATUS_TONES[order.status]}>
					{ORDER_STATUS_LABELS[order.status]}
				</Badge>
				{order.founding && <Badge variant="secondary">Founding price</Badge>}
				<span className="text-muted-foreground text-sm">{format(order.paidAt, "MMMM d, yyyy 'at' h:mm a")}</span>
				<div className="ms-auto">
					<OrderActions
						orderId={order.id}
						orderNumber={number}
						email={order.email}
						status={order.status}
						refundable={order.amountTotal - order.amountRefunded}
						canUpdate={hasPermission(user.role, { order: ["update"] })}
						canRefund={hasPermission(user.role, { order: ["refund"] })}
					/>
				</div>
			</div>

			{order.status === "flagged_non_us" && (
				<p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
					Billing country is {countryName(order.billingCountry)}. Paid products are US-only, so this order should be
					refunded with a polite email.
				</p>
			)}

			<div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
				<div className="flex min-w-0 flex-col gap-4">
					<FormCard title="Items" contentClassName="flex flex-col gap-3">
						<ul className="divide-y rounded-lg border">
							{items.map((item) => (
								<li key={item.id} className="flex items-center gap-3 p-3 text-sm">
									<Link href={`/admin/products/${item.productId}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
										{item.title}
									</Link>
									{item.isBump && <Badge variant="secondary">Order bump</Badge>}
									<span className="tabular-nums">{formatPrice(item.amount)}</span>
								</li>
							))}
						</ul>
						{canSeeMoney && (
							<div className="bg-muted/70 grid gap-1.5 rounded-lg p-3">
								<Row label="Subtotal" value={formatPrice(order.amountSubtotal)} />
								<Row label="Sales tax" value={formatPrice(order.amountTax)} />
								<Row label="Total" value={formatPrice(order.amountTotal)} strong />
								{order.amountRefunded > 0 && <Row label="Refunded" value={`−${formatPrice(order.amountRefunded)}`} />}
							</div>
						)}
					</FormCard>

					<FormCard title={`Downloads · ${files.length} file${files.length === 1 ? "" : "s"}`}>
						{files.length === 0 ? (
							<p className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
								These products have no files attached.
							</p>
						) : (
							<ul className="divide-y rounded-lg border">
								{files.map((f) => {
									const status = assetStatus(f);
									const Icon = f.kind === "sheet_link" ? Sheet : f.kind === "file" ? FileArchive : FileText;
									const atLimit = isUploadedFile(f.kind) && f.downloadLimit !== null && f.downloads >= f.downloadLimit;
									return (
										<li key={f.id} className="flex items-center gap-3 p-3">
											<span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
												<Icon className="size-4" />
											</span>
											<div className="grid min-w-0 flex-1 gap-0.5">
												<span className="truncate text-sm font-medium">{f.label}</span>
												<span className="text-muted-foreground text-xs">
													{status === "presale"
														? `Arrives by ${format(f.availableAt!, "MMM d, yyyy")}`
														: status === "missing"
															? "No file yet"
															: f.lastDownloadAt
																? `Last downloaded ${format(f.lastDownloadAt, "MMM d, yyyy")}`
																: "Not downloaded yet"}
												</span>
											</div>
											{isUploadedFile(f.kind) ? (
												<span className={cn("text-sm tabular-nums", atLimit && "text-destructive font-medium")}>
													{f.downloadLimit === null ? `${f.downloads} downloads` : `${f.downloads} / ${f.downloadLimit}`}
												</span>
											) : (
												<span className="text-muted-foreground text-sm tabular-nums">{f.totalDownloads} opened</span>
											)}
										</li>
									);
								})}
							</ul>
						)}
						{order.downloadsResetAt && (
							<p className="text-muted-foreground mt-2 text-xs">
								Limits reset on {format(order.downloadsResetAt, "MMM d, yyyy")}: counts start from then.
							</p>
						)}
					</FormCard>

					<OrderTimeline
						orderId={order.id}
						canNote={hasPermission(user.role, { order: ["update"] })}
						events={events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() }))}
					/>
				</div>

				<div className="flex flex-col gap-4 lg:sticky lg:top-20">
					<FormCard title="Customer" contentClassName="grid gap-2 text-sm">
						{order.name && <p className="font-medium">{order.name}</p>}
						<a href={`mailto:${order.email}`} className="text-primary [overflow-wrap:anywhere] hover:underline">
							{order.email}
						</a>
						<Row label="Billing country" value={countryName(order.billingCountry)} />
					</FormCard>

					<FormCard title="Download access" contentClassName="grid gap-2">
						<Row label="Active links" value={links.active} />
						<Row label="Expires" value={links.expiresAt ? format(links.expiresAt, "MMM d, yyyy") : "—"} />
						<Row
							label="Order email"
							value={order.confirmationSentAt ? format(order.confirmationSentAt, "MMM d, h:mm a") : "Not sent"}
						/>
					</FormCard>

					<FormCard title="Consent" contentClassName="grid gap-2">
						<Row
							label="Terms and immediate access"
							value={order.tosConsent === "accepted" ? "Accepted" : (order.tosConsent ?? "Not recorded")}
						/>
						<Row label="Consented at" value={order.consentAt ? format(order.consentAt, "MMM d, yyyy h:mm a") : "—"} />
						<Row label="Headline variant" value={order.testVariant ?? "—"} />
					</FormCard>

					<FormCard title="Stripe" contentClassName="grid gap-2">
						{order.stripePaymentIntentId ? (
							<a
								href={stripeDashboard(`payments/${order.stripePaymentIntentId}`)}
								target="_blank"
								rel="noreferrer"
								className="text-primary flex items-center gap-1.5 text-sm hover:underline"
							>
								View payment in Stripe
								<ExternalLink className="size-3.5" />
							</a>
						) : (
							<p className="text-muted-foreground text-sm">No payment linked.</p>
						)}
						<Row label="Checkout session" value={<span className="font-mono text-xs">{order.stripeSessionId}</span>} />
						{order.stripeCustomerId && (
							<Row label="Customer" value={<span className="font-mono text-xs">{order.stripeCustomerId}</span>} />
						)}
					</FormCard>
				</div>
			</div>
		</div>
	);
}
