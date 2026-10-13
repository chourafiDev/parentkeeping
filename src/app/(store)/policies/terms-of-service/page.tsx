import type { Metadata } from "next";
import { LAST_UPDATED, TERMS_SECTIONS, TERMS_SEO, fillContact } from "@/lib/legal-pages";
import { getSettings } from "@/server/queries/settings";
import { LegalPage } from "../../_components/legal-page";

const PATH = "/policies/terms-of-service";

export const metadata: Metadata = {
	title: { absolute: TERMS_SEO.title },
	description: TERMS_SEO.description,
	alternates: { canonical: PATH },
	openGraph: { title: TERMS_SEO.title, description: TERMS_SEO.description, url: PATH },
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
