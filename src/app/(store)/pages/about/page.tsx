import type { Metadata } from "next";
import { DEFAULT_SHARE_IMAGE } from "@/lib/share-image";
import { ABOUT_INTRO, ABOUT_SECTIONS, ABOUT_SEO, fillContact } from "@/lib/legal-pages";
import { getSettings } from "@/server/queries/settings";
import { LegalPage } from "../../_components/legal-page";

const PATH = "/pages/about";

export const metadata: Metadata = {
	title: ABOUT_SEO.title,
	description: ABOUT_SEO.description,
	alternates: { canonical: PATH },
	openGraph: { title: ABOUT_SEO.title, description: ABOUT_SEO.description, url: PATH, images: [DEFAULT_SHARE_IMAGE] },
};

export default async function AboutPage() {
	const { contact } = await getSettings("contact");
	return <LegalPage eyebrowText="About" title="About Parentkeeping" intro={ABOUT_INTRO} sections={fillContact(ABOUT_SECTIONS, contact)} />;
}
