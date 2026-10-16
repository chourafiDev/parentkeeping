import { Download, Lock, MessageCircle, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { getSettings } from "@/server/queries/settings";
import { container } from "./ui";

/** Five plain promises above the footer, on every store page. Each one must stay literally true. */
export async function TrustBar() {
	const { contact } = await getSettings("contact");
	const items = [
		{ icon: Lock, title: "Secure checkout", text: "Payments by Stripe" },
		{ icon: Download, title: "Instant download", text: "Link on screen and by email" },
		{ icon: ShieldCheck, title: "14-day guarantee", text: "If it doesn't help, a refund" },
		{
			icon: MessageCircle,
			title: "A real person",
			text: contact.phone ? "On email and phone" : "Replies to every email",
		},
		{ icon: MonitorSmartphone, title: "No app", text: "Nothing to install or subscribe to" },
	];

	return (
		<section aria-label="Our promises" className="border-t bg-[#f5f5f5]">
			<ul className={`${container} grid grid-cols-2 gap-x-6 gap-y-6 py-8 sm:grid-cols-3 lg:grid-cols-5`}>
				{items.map(({ icon: Icon, title, text }) => (
					<li key={title} className="flex items-center gap-3">
						<Icon className="text-primary size-6 shrink-0" strokeWidth={1.5} />
						<span className="grid">
							<span className="text-foreground text-[14px] font-semibold">{title}</span>
							<span className="text-body text-[13px]">{text}</span>
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
