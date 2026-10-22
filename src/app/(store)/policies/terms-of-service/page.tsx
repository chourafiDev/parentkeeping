import type { Metadata } from "next";
import { DEFAULT_SHARE_IMAGE } from "@/lib/share-image";
import { LAST_UPDATED, TERMS_SECTIONS, TERMS_SEO, fillContact } from "@/lib/legal-pages";
import { getSettings } from "@/server/queries/settings";
import { LegalPage } from "../../_components/legal-page";

const PATH = "/policies/terms-of-service";

export const metadata: Metadata = {
	title: TERMS_SEO.title,
	description: TERMS_SEO.description,
	alternates: { canonical: PATH },
	openGraph: { title: TERMS_SEO.title, description: TERMS_SEO.description, url: PATH, images: [DEFAULT_SHARE_IMAGE] },
};
export const dynamic = "force-dynamic";

export default async function TermsOfServicePage() {
	const { contact } = await getSettings("contact");
	return (
		<LegalPage
			eyebrowText="Legal"
			title="Terms of Service"
			lastUpdated={LAST_UPDATED}
			sections={fillContact(TERMS_SECTIONS, contact)}
		/>
	);
}
