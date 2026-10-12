import type { Metadata } from "next";
import { FREE_LIST } from "@/lib/lead-magnets";
import { LeadMagnetPage } from "../../_components/lead/lead-page";

export const metadata: Metadata = {
	title: { absolute: FREE_LIST.seo.title },
	description: FREE_LIST.seo.description,
	alternates: { canonical: FREE_LIST.path },
	openGraph: { title: FREE_LIST.seo.title, description: FREE_LIST.seo.description, url: FREE_LIST.path },
};
// The visitor's country (EU/UK box) and headline variant are per request.
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: PageProps<"/pages/free-medication-list">) {
	return <LeadMagnetPage magnet={FREE_LIST} searchParams={await searchParams} />;
}
