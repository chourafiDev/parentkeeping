"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarIcon, Loader, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { formatPrice } from "@/lib/money";
import {
	familiesLabel,
	MIN_FAMILIES,
	MIN_ORDERS_FOR_REFUND_RATE,
	MIN_REVIEWS_FOR_SUMMARY,
	refundRateLabel,
} from "@/lib/social-proof";
import { type SettingsInput, settingsInputSchema } from "@/lib/validations/settings";
import { FormCard } from "../../_components/shared/form-card";
import { UnsavedChangesBar } from "../../_components/shared/unsaved-changes-bar";

type BumpProduct = {
	id: string;
	status: "active" | "draft" | "archived";
	stripePriceId: string | null;
	price: number;
	files: number;
	fileStatus: "ready" | "presale" | "missing";
	availableAt: string | null;
} | null;

function FoundingStatus({ endsOn }: { endsOn: string | null }) {
	if (!endsOn) {
		return <FieldDescription>No date: the System sells at its full price.</FieldDescription>;
	}
	const days = differenceInCalendarDays(parseISO(endsOn), new Date());
	return (
		<FieldDescription>
			{days < 0
				? "This date has passed: the System sells at its full price."
				: days === 0
					? "Ends tonight at 11:59 PM Eastern."
					: `Ends in ${days} day${days === 1 ? "" : "s"}, at 11:59 PM Eastern. The page switches to the full price on its own.`}
		</FieldDescription>
	);
}

type ProofStats = { families: number; settledOrders: number; refundRate: number | null };

/** One "Social proof" switch, with the live number and whether it has enough data. */
function ProofSwitch({
	label,
	description,
	status,
	checked,
	onChange,
}: {
	label: string;
	description: string;
	status: { ready: boolean; text: string };
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<label className="flex items-start justify-between gap-4">
			<span className="grid gap-0.5">
				<span className="text-sm font-medium">{label}</span>
				<span className="text-muted-foreground text-xs">{description}</span>
				<span className={status.ready ? "text-xs text-emerald-700" : "text-xs text-amber-800"}>{status.text}</span>
			</span>
			<Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
		</label>
	);
}

export function SettingsForm({
	defaultValues,
	bump,
	proofStats,
	readOnly,
}: {
	defaultValues: SettingsInput;
	bump: BumpProduct;
	proofStats: ProofStats;
	readOnly: boolean;
}) {
	const router = useRouter();
	const form = useForm<SettingsInput>({ resolver: zodResolver(settingsInputSchema), defaultValues, mode: "onTouched" });
	const { control, register, formState } = form;
	const { isDirty, isSubmitting, errors } = formState;
	const [foundingEndsOn, bumpEnabled] = useWatch({ control, name: ["pricing.foundingEndsOn", "checkout.bumpEnabled"] });

	// Warn before leaving the page with unsaved changes.
	useEffect(() => {
		if (!isDirty) return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [isDirty]);

	const onSubmit = form.handleSubmit(
		async (values) => {
			const res = await api.api.admin.settings.$put({ json: values });
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as { error?: string } | null;
				toast.error(body?.error ?? "Couldn't save the settings");
				return;
			}
			form.reset(values);
			toast.success("Settings saved");
			router.refresh();
		},
		() => toast.error("Fix the highlighted fields"),
	);

	return (
		<form onSubmit={onSubmit} noValidate className="flex min-w-0 flex-col gap-4">
			<UnsavedChangesBar visible={isDirty} label="Unsaved settings" isSubmitting={isSubmitting} onDiscard={() => form.reset()} />

			<div>
				<h1 className="text-lg font-semibold">Settings</h1>
				<p className="text-muted-foreground text-sm">Pricing, checkout and the business details shown to buyers.</p>
			</div>

			<fieldset disabled={readOnly} className="contents">
				<FormCard title="Founding price">
					<Controller
						control={control}
						name="pricing.foundingEndsOn"
						render={({ field }) => (
							<Field>
								<FieldLabel>Founding price ends on</FieldLabel>
								<div className="flex flex-wrap gap-2">
									<Popover>
										<PopoverTrigger asChild>
											<Button type="button" variant="outline" className="min-w-56 justify-start font-normal">
												<CalendarIcon className="text-muted-foreground" />
												{field.value ? format(parseISO(field.value), "EEEE, MMMM d, yyyy") : "Pick the last day"}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value ? parseISO(field.value) : undefined}
												onSelect={(d) => d && field.onChange(format(d, "yyyy-MM-dd"))}
												disabled={{ before: new Date() }}
											/>
										</PopoverContent>
									</Popover>
									{field.value && (
										<Button type="button" variant="ghost" onClick={() => field.onChange(null)}>
											<X />
											Remove date
										</Button>
									)}
								</div>
								<FoundingStatus endsOn={foundingEndsOn} />
								<p className="text-muted-foreground text-xs">
									The founding price itself is set on the{" "}
									<Link href="/admin/products" className="text-primary underline-offset-2 hover:underline">
										Family Care System product
									</Link>
									. Use a real date: the spec forbids fake deadlines.
								</p>
							</Field>
						)}
					/>
				</FormCard>

				<FormCard title="Checkout" contentClassName="grid gap-5">
					<Controller
						control={control}
						name="checkout.worldwideEnabled"
						render={({ field }) => (
							<div className="grid gap-3">
								<label className="flex items-start justify-between gap-4">
									<span className="grid gap-0.5">
										<span className="text-sm font-medium">Sell worldwide</span>
										<span className="text-muted-foreground text-xs">
											Opens paid checkout to every country, with Stripe Managed Payments as the merchant of record
											for sales tax, VAT and GST. Off = US customers only, as now.
										</span>
									</span>
									<Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Sell worldwide" />
								</label>
								<div className="bg-muted/70 grid gap-1 rounded-lg p-3 text-xs">
									<span>
										Needs Stripe Managed Payments approved for this account first (Stripe Dashboard → Payments →
										Managed Payments). Turning this on before approval will fail orders from outside the US.
									</span>
									<span>
										Also needs: every product&apos;s Stripe prices created tax-inclusive (clear a product&apos;s price
										ids and run <code className="rounded bg-black/5 px-1">pnpm stripe:sync</code> again), and the
										statement descriptor set to PARENTKEEPING in the Stripe Dashboard.
									</span>
								</div>
							</div>
						)}
					/>
					<Controller
						control={control}
						name="checkout.bumpEnabled"
						render={({ field }) => (
							<div className="grid gap-3">
								<label className="flex items-start justify-between gap-4">
									<span className="grid gap-0.5">
										<span className="text-sm font-medium">
											Emergency Binder order bump{bump ? ` · ${formatPrice(bump.price)}` : ""}
										</span>
										<span className="text-muted-foreground text-xs">
											Offered as an add-on on the Family Care System checkout only.
										</span>
									</span>
									<Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Emergency Binder order bump" />
								</label>
								{bump && (
									<div className="bg-muted/70 grid gap-1 rounded-lg p-3 text-xs">
										<span>
											File:{" "}
											{bump.fileStatus === "ready"
												? "ready to download"
												: bump.fileStatus === "presale"
													? `pre-sale, arrives by ${bump.availableAt ? format(new Date(bump.availableAt), "MMMM d") : "a set date"}`
													: "not uploaded and no “Arrives by” date"}
										</span>
										<span>Stripe price: {bump.stripePriceId ? "set" : "missing"}</span>
										{bumpEnabled && (bump.fileStatus === "missing" || !bump.stripePriceId) && (
											<span className="text-amber-800">
												Buyers could pay for it before there&apos;s anything to deliver.{" "}
												<Link href={`/admin/products/${bump.id}`} className="underline underline-offset-2">
													Open the product
												</Link>
											</span>
										)}
									</div>
								)}
							</div>
						)}
					/>
				</FormCard>

				<FormCard title="Social proof" contentClassName="grid gap-4">
					<p className="text-muted-foreground text-xs">
						Worked out from real orders, rounded so they never overstate, and only shown once there&apos;s enough data. Star ratings
						appear on their own once a product has {MIN_REVIEWS_FOR_SUMMARY} published reviews.
					</p>
					<Controller
						control={control}
						name="proof.showFamilies"
						render={({ field }) => (
							<ProofSwitch
								label="“Bought by N+ families”"
								description="Under the price on product pages and the home buy box."
								status={
									proofStats.families >= MIN_FAMILIES
										? { ready: true, text: `Would show: “Bought by ${familiesLabel(proofStats.families)} families” (${proofStats.families} buyers)` }
										: { ready: false, text: `Not enough data yet: ${proofStats.families} of ${MIN_FAMILIES} buyers` }
								}
								checked={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
					<Controller
						control={control}
						name="proof.showRefundRate"
						render={({ field }) => (
							<ProofSwitch
								label="Refund rate in the guarantee card"
								description="Counts only orders whose 14-day window has closed."
								status={
									proofStats.settledOrders >= MIN_ORDERS_FOR_REFUND_RATE && proofStats.refundRate !== null
										? {
												ready: true,
												text: `Would show: “${refundRateLabel(proofStats.refundRate)} of buyers have asked for one” (${(proofStats.refundRate * 100).toFixed(1)}% of ${proofStats.settledOrders} orders)`,
											}
										: { ready: false, text: `Not enough data yet: ${proofStats.settledOrders} of ${MIN_ORDERS_FOR_REFUND_RATE} orders past 14 days` }
								}
								checked={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				</FormCard>

				<FormCard title="Business details" contentClassName="grid gap-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<Field data-invalid={!!errors.contact?.supportEmail}>
							<FieldLabel htmlFor="supportEmail">Support email</FieldLabel>
							<Input id="supportEmail" type="email" placeholder="hello@parentkeeping.com" {...register("contact.supportEmail")} />
							<FieldDescription>In every buyer email, on the Contact page and in the store footer.</FieldDescription>
							<FieldError errors={[errors.contact?.supportEmail]} />
						</Field>
						<Field data-invalid={!!errors.contact?.privacyEmail}>
							<FieldLabel htmlFor="privacyEmail">Privacy email</FieldLabel>
							<Input id="privacyEmail" type="email" placeholder="privacy@parentkeeping.com" {...register("contact.privacyEmail")} />
							<FieldDescription>For data requests, in the Privacy Policy.</FieldDescription>
							<FieldError errors={[errors.contact?.privacyEmail]} />
						</Field>
					</div>
					<Field data-invalid={!!errors.contact?.phone}>
						<FieldLabel htmlFor="phone">Phone number</FieldLabel>
						<Input id="phone" type="tel" placeholder="(307) 555-0142" {...register("contact.phone")} />
						<FieldDescription>Shown in the store footer, next to the email and address.</FieldDescription>
						<FieldError errors={[errors.contact?.phone]} />
					</Field>
					<Field data-invalid={!!errors.contact?.postalAddress}>
						<FieldLabel htmlFor="postalAddress">Postal address</FieldLabel>
						<Textarea
							id="postalAddress"
							rows={3}
							placeholder={"123 Main St, Suite 100\nCheyenne, WY 82001"}
							{...register("contact.postalAddress")}
						/>
						<FieldDescription>
							Required in marketing emails, and shown in the store footer. A virtual mailbox or registered agent address works.
						</FieldDescription>
						<FieldError errors={[errors.contact?.postalAddress]} />
					</Field>
				</FormCard>
			</fieldset>

			{!readOnly && (
				<div className="flex justify-end">
					<Button type="submit" disabled={isSubmitting || !isDirty} className="px-10">
						{isSubmitting && <Loader className="size-4 animate-spin" />}
						Save
					</Button>
				</div>
			)}
		</form>
	);
}
