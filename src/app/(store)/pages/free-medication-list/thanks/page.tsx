import type { Metadata } from "next";
import { FREE_LIST } from "@/lib/lead-magnets";
import { LeadThanksPage } from "../../../_components/lead/lead-thanks";

export const metadata: Metadata = { title: FREE_LIST.thanks.h1, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
	return <LeadThanksPage magnet={FREE_LIST} />;
}
