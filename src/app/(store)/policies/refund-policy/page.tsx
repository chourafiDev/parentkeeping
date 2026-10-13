import type { Metadata } from "next";
import { LAST_UPDATED, REFUND_SECTIONS, REFUND_SEO, fillContact } from "@/lib/legal-pages";
import { getSettings } from "@/server/queries/settings";
import { LegalPage } from "../../_components/legal-page";

const PATH = "/policies/refund-policy";

export const metadata: Metadata = {
	title: { absolute: REFUND_SEO.title },
	description: REFUND_SEO.description,
	alternates: { canonical: PATH },
	openGraph: { title: REFUND_SEO.title, description: REFUND_SEO.description, url: PATH },
};
export const dynamic = "force-dynamic";

export default async function RefundPolicyPage() {
	const { contact } = await getSettings("contact");
	return (
		<LegalPage
			eyebrowText="Guarantee"
			title="Refund Policy"
			lastUpdated={LAST_UPDATED}
			sections={fillContact(REFUND_SECTIONS, contact)}
		/>
	);
}
