"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isExcludedPath, isTrackingOptedOut } from "@/lib/analytics";

// First-party visit tracking for the admin's Live View: page views, Buy
// clicks, and a ping every minute while the tab is visible. No cookies: the
// visit id lives in this tab's sessionStorage. Visitors who send Global
// Privacy Control or Do Not Track aren't tracked at all, and neither are the
// owner's browsers (marked when the admin is opened; signed-in visits are
// also dropped on the server).

const PING_MS = 60_000;

let memoryId: string | null = null;
function visitId() {
	try {
		let id = sessionStorage.getItem("pk_visit");
		if (!id) {
			id = crypto.randomUUID();
			sessionStorage.setItem("pk_visit", id);
		}
		return id;
	} catch {
		// Storage blocked: one visit per page load.
		memoryId ??= crypto.randomUUID();
		return memoryId;
	}
}

function send(type: "page_view" | "checkout" | "ping", path: string, productSlug: string | null = null) {
	const body = JSON.stringify({
		sessionId: visitId(),
		type,
		path,
		referrer: type === "page_view" ? document.referrer || null : null,
		productSlug,
	});
	// sendBeacon survives the page unloading (a Buy click navigates to Stripe).
	const sent = navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
	if (!sent) void fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
}

export function AnalyticsTracker() {
	const pathname = usePathname();
	const excluded = isExcludedPath(pathname);

	// One page view per route change.
	useEffect(() => {
		if (excluded || isTrackingOptedOut()) return;
		send("page_view", pathname);
	}, [pathname, excluded]);

	// "Right now": a ping each minute while the tab is in front.
	useEffect(() => {
		if (excluded || isTrackingOptedOut()) return;
		const timer = setInterval(() => {
			if (document.visibilityState === "visible") send("ping", pathname);
		}, PING_MS);
		return () => clearInterval(timer);
	}, [pathname, excluded]);

	// Buy buttons are plain forms posting to /api/checkout.
	useEffect(() => {
		if (excluded || isTrackingOptedOut()) return;
		const onSubmit = (e: SubmitEvent) => {
			const form = e.target as HTMLFormElement | null;
			if (!form?.action?.endsWith("/api/checkout")) return;
			const slug = new FormData(form).get("slug");
			send("checkout", pathname, typeof slug === "string" ? slug : null);
		};
		document.addEventListener("submit", onSubmit, true);
		return () => document.removeEventListener("submit", onSubmit, true);
	}, [pathname, excluded]);

	return null;
}
