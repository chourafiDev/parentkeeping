import type { Metadata } from "next";
import { CHECKLISTS } from "@/lib/lead-magnets";
import { LeadThanksPage } from "../../../_components/lead/lead-thanks";

export const metadata: Metadata = { title: CHECKLISTS.thanks.h1, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
	return <LeadThanksPage magnet={CHECKLISTS} />;
}
