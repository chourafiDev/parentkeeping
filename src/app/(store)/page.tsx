import type { Metadata } from "next";
import { OFFER_HEADLINES, OFFER_SUBHEAD } from "@/lib/offer";
import { SystemSalesPage } from "./_components/system-sales-page";

export const metadata: Metadata = {
	title: { absolute: `Parentkeeping · ${OFFER_HEADLINES.one_place}` },
	description: OFFER_SUBHEAD,
};
// Prices, the founding window and the headline variant are per request.
export const dynamic = "force-dynamic";

/** Home = the Family Care System sales page (spec). */
export default async function HomePage({ searchParams }: PageProps<"/">) {
	return <SystemSalesPage searchParams={await searchParams} path="/" />;
}
