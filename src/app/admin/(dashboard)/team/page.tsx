import type { Metadata } from "next";
import { HiIdentification } from "react-icons/hi2";
import { requireStaffPage } from "@/server/auth/session";
import { ComingSoon } from "../_components/shared/coming-soon";

export const metadata: Metadata = { title: "Team" };

export default async function Page() {
	await requireStaffPage({ user: ["list"] });

	return (
		<ComingSoon
			icon={HiIdentification}
			title="Team"
			description="Who can sign in to this admin."
			features={["Invite a team member by email", "Roles: Owner and Support", "Remove access"]}
		/>
	);
}
