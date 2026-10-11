import type { Metadata } from "next";
import { HiEnvelope } from "react-icons/hi2";
import { requireStaffPage } from "@/server/auth/session";
import { ComingSoon } from "../_components/shared/coming-soon";

export const metadata: Metadata = { title: "Subscribers" };

export default async function Page() {
	await requireStaffPage({ subscriber: ["read"] });

	return (
		<ComingSoon
			icon={HiEnvelope}
			title="Subscribers"
			description="Free Medication List sign-ups."
			features={["Email, country, marketing consent and headline variant", "Conversion by headline variant (fairness vs one place)", "Export to CSV"]}
		/>
	);
}
