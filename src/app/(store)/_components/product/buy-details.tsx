import { Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { GUARANTEE_TITLE, guaranteeText } from "@/lib/offer";

/** Compact guarantee card under the Buy button. */
export function GuaranteeCard({ supportEmail }: { supportEmail: string | null }) {
	return (
		<div className="flex items-start gap-4 rounded-[10px] border p-4">
			<span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full">
				<ShieldCheck className="size-5" strokeWidth={1.75} />
			</span>
			<div className="grid gap-1">
				<p className="text-foreground text-[15px] font-semibold">{GUARANTEE_TITLE}</p>
				<p className="text-body text-[13px] leading-relaxed">{guaranteeText(supportEmail)}</p>
			</div>
		</div>
	);
}

export type BuyDetail = { title: string; body: React.ReactNode };

/** Small accordions under the Buy button: the answers people look for before paying. */
export function BuyDetails({ items }: { items: BuyDetail[] }) {
	return (
		<div className="border-t">
			{items.map((item) => (
				<details key={item.title} className="group border-b">
					<summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
						{item.title}
						<Plus className="size-4 shrink-0 transition-transform group-open:rotate-45" />
					</summary>
					<div className="text-body grid gap-2 pb-4 text-[14px] leading-[1.65]">{item.body}</div>
				</details>
			))}
		</div>
	);
}

/** "Delivery & refunds" body, shared by every product. */
export function DeliveryAndRefunds({ presaleLine, supportEmail }: { presaleLine: string | null; supportEmail: string | null }) {
	return (
		<>
			<p>
				{presaleLine ??
					"Your download link appears right after checkout and arrives by email too. Nothing ships, and nothing to install."}
			</p>
			<p>{guaranteeText(supportEmail)}</p>
			<p>
				<Link href="/policies/refund-policy" className="text-foreground font-semibold underline underline-offset-2">
					Read the refund policy
				</Link>
			</p>
		</>
	);
}
