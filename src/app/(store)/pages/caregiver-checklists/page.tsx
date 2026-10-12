import type { Metadata } from "next";
import { CHECKLISTS } from "@/lib/lead-magnets";
import { LeadMagnetPage } from "../../_components/lead/lead-page";

export const metadata: Metadata = {
	title: { absolute: CHECKLISTS.seo.title },
	description: CHECKLISTS.seo.description,
	alternates: { canonical: CHECKLISTS.path },
	openGraph: { title: CHECKLISTS.seo.title, description: CHECKLISTS.seo.description, url: CHECKLISTS.path },
};
// The visitor's country (EU/UK box) and headline variant are per request.
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: PageProps<"/pages/caregiver-checklists">) {
	return <LeadMagnetPage magnet={CHECKLISTS} searchParams={await searchParams} />;
}
