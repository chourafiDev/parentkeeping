import type { Metadata } from "next";
import { HiShoppingCart } from "react-icons/hi2";
import { requireStaffPage } from "@/server/auth/session";
import { ComingSoon } from "../_components/shared/coming-soon";

export const metadata: Metadata = { title: "Orders" };

export default async function Page() {
	await requireStaffPage({ order: ["read"] });

	return (
		<ComingSoon
			icon={HiShoppingCart}
			title="Orders"
			description="Paid orders copied from Stripe webhooks."
			features={["Search and filter by status: paid, refunded, flagged (non-US)", "Order detail: items, order bump, consent record, tax", "Resend the order email or issue a fresh download link", "Refund through Stripe"]}
		/>
	);
}
