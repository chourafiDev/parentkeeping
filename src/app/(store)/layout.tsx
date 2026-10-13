import { headers } from "next/headers";
import { OPT_IN_COUNTRIES } from "@/lib/free-list";
import { AnalyticsTracker } from "./_components/analytics-tracker";
import { StoreGoogleAnalytics } from "./_components/google-analytics";
import { StoreFooter } from "./_components/store-footer";
import { StoreHeader } from "./_components/store-header";

/** Every public store page: header with the spec nav, footer with the legal links. */
export default async function StoreLayout({ children }: LayoutProps<"/">) {
	const country = (await headers()).get("x-vercel-ip-country");
	const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

	return (
		<>
			<StoreHeader />
			<div className="flex flex-1 flex-col">{children}</div>
			<StoreFooter />
			<AnalyticsTracker />
			{gaId && <StoreGoogleAnalytics measurementId={gaId} euOrUkVisitor={!!country && OPT_IN_COUNTRIES.has(country)} />}
		</>
	);
}
