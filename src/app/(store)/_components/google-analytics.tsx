"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { isExcludedPath, isTrackingOptedOut } from "@/lib/analytics";
import { isOptInCountry, readCountryCookie } from "@/lib/visitor-country";

const noSubscription = () => () => {};

/**
 * Google Analytics, loaded only where it's actually allowed to run: never on
 * the burnout quiz (legal: no pixels there, under any circumstance), never
 * for EU/UK/EEA visitors (GA sets cookies, and we don't run a consent
 * banner), never if the browser sends Global Privacy Control / Do Not
 * Track, and never on the owner's own browser.
 */
export function StoreGoogleAnalytics({ measurementId }: { measurementId: string }) {
	const pathname = usePathname();
	// Reads navigator/localStorage, which don't exist on the server, so the
	// server snapshot defaults to "don't load yet" until hydration confirms it.
	const optedOut = useSyncExternalStore(noSubscription, isTrackingOptedOut, () => true);
	// Country cookie set by the proxy; on the server it's unknown, so treat as EU (don't load).
	const euOrUkVisitor = useSyncExternalStore(noSubscription, () => isOptInCountry(readCountryCookie()), () => true);

	if (euOrUkVisitor || optedOut || isExcludedPath(pathname)) return null;
	return <GoogleAnalytics gaId={measurementId} />;
}
