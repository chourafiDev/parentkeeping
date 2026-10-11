import type { Metadata } from "next";
import { HiCube } from "react-icons/hi2";
import { requireStaffPage } from "@/server/auth/session";
import { ComingSoon } from "../_components/shared/coming-soon";

export const metadata: Metadata = { title: "Products" };

export default async function Page() {
	await requireStaffPage({ product: ["read"] });

	return (
		<ComingSoon
			icon={HiCube}
			title="Products"
			description="The four products and the files buyers download."
			features={["Family Care System, Medical Binder, Caregiver Agreement, Emergency Binder", "Upload PDFs to private storage, add the Google Sheet link", "Pre-sale dates: “Arrives by” until a file is ready", "Mark a file ready and email every buyer who owns it"]}
		/>
	);
}
