import { AnalyticsTracker } from "./_components/analytics-tracker";
import { StoreFooter } from "./_components/store-footer";
import { StoreHeader } from "./_components/store-header";

/** Every public store page: header with the spec nav, footer with the legal links. */
export default function StoreLayout({ children }: LayoutProps<"/">) {
	return (
		<>
			<StoreHeader />
			<div className="flex flex-1 flex-col">{children}</div>
			<StoreFooter />
			<AnalyticsTracker />
		</>
	);
}
