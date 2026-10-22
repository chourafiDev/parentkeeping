import type { Metadata } from "next";
import { DEFAULT_SHARE_IMAGE } from "@/lib/share-image";
import { LAST_UPDATED, PRIVACY_SECTIONS, PRIVACY_SEO, fillContact } from "@/lib/legal-pages";
import { getSettings } from "@/server/queries/settings";
import { LegalPage } from "../../_components/legal-page";

const PATH = "/policies/privacy-policy";

export const metadata: Metadata = {
	title: PRIVACY_SEO.title,
	description: PRIVACY_SEO.description,
	alternates: { canonical: PATH },
	openGraph: { title: PRIVACY_SEO.title, description: PRIVACY_SEO.description, url: PATH, images: [DEFAULT_SHARE_IMAGE] },
};
export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
	const { contact } = await getSettings("contact");
	return (
		<LegalPage
			eyebrowText="Legal"
			title="Privacy Policy"
			lastUpdated={LAST_UPDATED}
			sections={fillContact(PRIVACY_SECTIONS, contact)}
		/>
	);
}
