import type { Metadata } from "next";
import { DEFAULT_SHARE_IMAGE } from "@/lib/share-image";
import { DISCLAIMER_SECTIONS, DISCLAIMER_SEO, LAST_UPDATED } from "@/lib/legal-pages";
import { LegalPage } from "../../_components/legal-page";

const PATH = "/pages/disclaimer";

export const metadata: Metadata = {
	title: DISCLAIMER_SEO.title,
	description: DISCLAIMER_SEO.description,
	alternates: { canonical: PATH },
	openGraph: { title: DISCLAIMER_SEO.title, description: DISCLAIMER_SEO.description, url: PATH, images: [DEFAULT_SHARE_IMAGE] },
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
