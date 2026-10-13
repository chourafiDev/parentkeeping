"use client";

import { useEffect } from "react";
import { EXCLUDE_KEY } from "@/lib/analytics";

/**
 * Opening the admin marks this browser as the owner's, so its store visits
 * stay out of Live View even after signing out (the store tracker checks it).
 */
export function ExcludeFromAnalytics() {
	useEffect(() => {
		try {
			localStorage.setItem(EXCLUDE_KEY, "1");
		} catch {
			// Storage blocked: the signed-in check on the server still applies.
		}
	}, []);
	return null;
}
