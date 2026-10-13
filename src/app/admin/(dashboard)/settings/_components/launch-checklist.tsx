import { CircleAlert, CircleCheck, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/server/queries/settings";
import { FormCard } from "../../_components/shared/form-card";

type Item = { label: string; detail: string; state: "done" | "todo" | "warn" };

/**
 * Read-only "ready to launch?" view: services from environment variables,
 * details from the form. Recomputed on every visit.
 */
export function LaunchChecklist({
	services,
	contact,
	foundingEndsAt,
	bump,
}: {
	services: { stripe: "live" | "test" | null; storage: boolean; email: boolean; emailFrom: string | null };
	contact: StoreSettings["contact"];
	foundingEndsAt: string | null;
	bump: { enabled: boolean; fileStatus: "ready" | "presale" | "missing"; hasPrice: boolean } | null;
}) {
	const items: Item[] = [
		{
			label: "Stripe",
			state: services.stripe === "live" ? "done" : services.stripe === "test" ? "warn" : "todo",
			detail:
				services.stripe === "live"
					? "Live key: real payments"
					: services.stripe === "test"
						? "Test mode: switch to the live key at launch"
						: "Add STRIPE_SECRET_KEY",
		},
		{
			label: "File storage",
			state: services.storage ? "done" : "todo",
			detail: services.storage ? "Cloudflare R2 connected" : "Add the R2_* variables (dev uses local files)",
		},
		{
			label: "Email sending",
			state: services.email ? "done" : "todo",
			detail: services.email ? `Sending as ${services.emailFrom}` : "Add RESEND_API_KEY and EMAIL_FROM_ADDRESS",
		},
		{ label: "Support email", state: contact.supportEmail ? "done" : "todo", detail: contact.supportEmail ?? "Shown in every buyer email" },
		{
			label: "Postal address",
			state: contact.postalAddress ? "done" : "todo",
			detail: contact.postalAddress ? "In email footers, Contact and the store footer" : "Required in marketing emails",
		},
		{ label: "Phone number", state: contact.phone ? "done" : "todo", detail: contact.phone ?? "Shown in the store footer" },
		{
			label: "Founding price date",
			state: !foundingEndsAt ? "todo" : new Date(foundingEndsAt) > new Date() ? "done" : "warn",
			detail: !foundingEndsAt
				? "Not set: the System sells at the full price"
				: new Date(foundingEndsAt) > new Date()
					? "Set, and still running"
					: "Ended: the System sells at the full price",
		},
	];
	if (bump?.enabled && (bump.fileStatus === "missing" || !bump.hasPrice)) {
		items.push({
			label: "Order bump",
			state: "warn",
			detail: !bump.hasPrice ? "On, but the Emergency Binder has no Stripe price" : "On, but the Emergency Binder has no file or date",
		});
	}
	const done = items.filter((i) => i.state === "done").length;

	return (
		<FormCard title={`Launch checklist · ${done}/${items.length}`} className="lg:sticky lg:top-20">
			<ul className="grid gap-3">
				{items.map((i) => {
					const Icon = i.state === "done" ? CircleCheck : i.state === "warn" ? CircleAlert : CircleDashed;
					return (
						<li key={i.label} className="flex gap-2.5 text-sm">
							<Icon
								className={cn(
									"mt-0.5 size-4 shrink-0",
									i.state === "done" ? "text-green" : i.state === "warn" ? "text-amber-600" : "text-muted-foreground",
								)}
							/>
							<span className="grid min-w-0">
								<span className="font-medium">{i.label}</span>
								<span className="text-muted-foreground text-xs [overflow-wrap:anywhere]">{i.detail}</span>
							</span>
						</li>
					);
				})}
			</ul>
		</FormCard>
	);
}
