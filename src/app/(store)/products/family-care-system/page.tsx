import type { Metadata } from "next";
import { OFFER_SUBHEAD } from "@/lib/offer";
import { SystemSalesPage } from "../../_components/system-sales-page";

export const metadata: Metadata = {
	title: "Parentkeeping Family Care System",
	description: OFFER_SUBHEAD,
	alternates: { canonical: "/products/family-care-system" },
};
export const dynamic = "force-dynamic";

/** Same offer as the home page, linkable from emails and keyword pages. */
export default async function FamilyCareSystemPage({ searchParams }: PageProps<"/products/family-care-system">) {
	return <SystemSalesPage searchParams={await searchParams} path="/products/family-care-system" />;
}
