import type { Metadata } from "next";
import { DISCLAIMER_SECTIONS, DISCLAIMER_SEO, LAST_UPDATED } from "@/lib/legal-pages";
import { LegalPage } from "../../_components/legal-page";

const PATH = "/pages/disclaimer";

export const metadata: Metadata = {
	title: { absolute: DISCLAIMER_SEO.title },
	description: DISCLAIMER_SEO.description,
	alternates: { canonical: PATH },
	openGraph: { title: DISCLAIMER_SEO.title, description: DISCLAIMER_SEO.description, url: PATH },
};

export default function DisclaimerPage() {
	return (
		<LegalPage
			eyebrowText="Legal"
			title="Disclaimer"
			lastUpdated={LAST_UPDATED}
			intro={[
				"Parentkeeping makes organizing tools, not advice. Here's the exact wording that applies to each product, all in one place.",
			]}
			sections={DISCLAIMER_SECTIONS}
		/>
	);
}
