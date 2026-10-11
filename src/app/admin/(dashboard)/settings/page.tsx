import type { Metadata } from "next";
import { HiCog6Tooth } from "react-icons/hi2";
import { requireStaffPage } from "@/server/auth/session";
import { ComingSoon } from "../_components/shared/coming-soon";

export const metadata: Metadata = { title: "Settings" };

export default async function Page() {
	await requireStaffPage({ settings: ["read"] });

	return (
		<ComingSoon
			icon={HiCog6Tooth}
			title="Settings"
			description="Store-wide settings."
			features={["Founding price end date ($29 → $39)", "Support email and postal address", "Order bump on or off"]}
		/>
	);
}
