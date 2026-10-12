"use client";

import { ChevronDown, Copy, Link2, Mail, RotateCcw, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { formatPrice } from "@/lib/money";
import { DOWNLOAD_LIMIT, type OrderStatus } from "@/lib/orders";
import { ConfirmDialog } from "../../../_components/shared/confirm-dialog";

type Action = "resend" | "reset" | "limits" | "refund";

/** Support actions for one order (Shopify Digital Products' "Resend email" & co.). */
export function OrderActions({
	orderId,
	orderNumber,
	email,
	status,
	refundable,
	canUpdate,
	canRefund,
}: {
	orderId: string;
	orderNumber: string;
	email: string;
	status: OrderStatus;
	refundable: number;
	canUpdate: boolean;
	canRefund: boolean;
}) {
	const router = useRouter();
	const [action, setAction] = useState<Action | null>(null);
	const [link, setLink] = useState<string | null>(null);
	const paid = status === "paid";
	if (!canUpdate && !canRefund) return null;

	async function call(a: Action) {
		const param = { param: { id: orderId } };
		const res =
			a === "resend" || a === "reset"
				? await api.api.admin.orders[":id"].email.$post({ ...param, json: { mode: a } })
				: a === "limits"
					? await api.api.admin.orders[":id"]["reset-downloads"].$post(param)
					: await api.api.admin.orders[":id"].refund.$post(param);
		const body = (await res.json().catch(() => null)) as { error?: string; downloadsUrl?: string } | null;
		if (!res.ok) {
			toast.error(body?.error ?? "Something went wrong");
			return false;
		}
		toast.success(
			{
				resend: `Order email resent to ${email}`,
				reset: `New link sent to ${email}; old links revoked`,
				limits: "Download limits reset",
				refund: `${orderNumber} refunded`,
			}[a],
		);
		if (body?.downloadsUrl) setLink(body.downloadsUrl);
		router.refresh();
		return true;
	}

	const confirm: Record<Action, { title: string; description: string; label: string; destructive?: boolean }> = {
		resend: {
			title: "Resend the order email?",
			description: `${email} gets the order email again with a new downloads link. Links sent before keep working.`,
			label: "Resend email",
		},
		reset: {
			title: "Reset the download link?",
			description: `Every link sent so far stops working (use this if a link was shared). ${email} gets a new one by email.`,
			label: "Reset and send",
		},
		limits: {
			title: "Reset download limits?",
			description: `Each file allows ${DOWNLOAD_LIMIT} downloads per order. Resetting starts every count from zero; past downloads stay in the stats.`,
			label: "Reset limits",
		},
		refund: {
			title: `Refund ${formatPrice(refundable)}?`,
			description: `The full amount goes back to the buyer's card through Stripe, and their download links stop working. This can't be undone.`,
			label: `Refund ${formatPrice(refundable)}`,
			destructive: true,
		},
	};

	return (
		<>
			{/* Non-modal: a modal menu hands focus back to its trigger on close, which
			    the dialog opened from it reads as "focus outside" and closes at once. */}
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						More actions
						<ChevronDown className="text-muted-foreground" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-60">
					{canUpdate && (
						<>
							<DropdownMenuItem disabled={!paid} onSelect={() => setAction("resend")}>
								<Mail />
								Resend order email
							</DropdownMenuItem>
							<DropdownMenuItem disabled={!paid} onSelect={() => setAction("reset")}>
								<Link2 />
								Reset download link
							</DropdownMenuItem>
							<DropdownMenuItem disabled={!paid} onSelect={() => setAction("limits")}>
								<RotateCcw />
								Reset download limits
							</DropdownMenuItem>
						</>
					)}
					{canRefund && (
						<>
							{canUpdate && <DropdownMenuSeparator />}
							<DropdownMenuItem
								variant="destructive"
								disabled={status === "refunded" || refundable <= 0}
								onSelect={() => setAction("refund")}
							>
								<Undo2 />
								Refund order
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{action && (
				<ConfirmDialog
					open
					onOpenChange={(o) => !o && setAction(null)}
					title={confirm[action].title}
					description={confirm[action].description}
					confirmLabel={confirm[action].label}
					destructive={confirm[action].destructive}
					onConfirm={() => call(action)}
				/>
			)}

			{/* The new link, to paste into a support reply. */}
			<Dialog open={!!link} onOpenChange={(o) => !o && setLink(null)}>
				<DialogContent className="sm:max-w-[520px]">
					<DialogHeader>
						<DialogTitle>Link sent</DialogTitle>
						<DialogDescription>
							The buyer got it by email. You can also paste it into your reply; it&apos;s valid for one year.
						</DialogDescription>
					</DialogHeader>
					<Input readOnly value={link ?? ""} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
					<DialogFooter>
						<Button
							onClick={async () => {
								await navigator.clipboard.writeText(link ?? "");
								toast.success("Link copied");
							}}
						>
							<Copy />
							Copy link
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
