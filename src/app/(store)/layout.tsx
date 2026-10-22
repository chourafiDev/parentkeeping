import { FREE_LIST } from "@/lib/lead-magnets";
import { LeadForm } from "./_components/lead/lead-form";
import { SignupPopup } from "./_components/signup-popup";
import { AnalyticsTracker } from "./_components/analytics-tracker";
import { StoreGoogleAnalytics } from "./_components/google-analytics";
import { StoreFooter } from "./_components/store-footer";
import { StoreHeader } from "./_components/store-header";
import { TrustBar } from "./_components/trust-bar";

/**
 * Every public store page: header with the spec nav, footer with the legal links.
 * No request-time reads here (no headers/cookies), so pages that don't need
 * them stay cacheable; the visitor's country is read in the browser.
 */
// Cached store pages (blog, policies, contact) rebuild at most hourly; saving
// Settings refreshes them at once (services/settings.ts).
export const revalidate = 3600;

export default function StoreLayout({ children }: LayoutProps<"/">) {
	const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

	return (
		<>
			<StoreHeader />
			<div className="flex flex-1 flex-col">{children}</div>
			<TrustBar />
			<StoreFooter />
			<SignupPopup>
				<LeadForm magnet={FREE_LIST} id="popup" stacked />
			</SignupPopup>
			<AnalyticsTracker />
			{gaId && <StoreGoogleAnalytics measurementId={gaId} />}
		</>
	);
}
