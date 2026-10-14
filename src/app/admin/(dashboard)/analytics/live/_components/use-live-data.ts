"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { LiveView } from "@/server/queries/analytics";

/**
 * Live analytics, refreshed every `pollMs` while the tab is visible (and
 * right away when it comes back into view). `stale` = the last poll failed.
 */
export function useLiveData(initial: LiveView, pollMs = 10_000) {
	const [data, setData] = useState(initial);
	const [stale, setStale] = useState(false);

	useEffect(() => {
		let cancelled = false;
		async function poll() {
			if (document.visibilityState !== "visible") return;
			const res = await api.api.admin.analytics.live.$get().catch(() => null);
			if (cancelled) return;
			if (res?.ok) {
				setData(await res.json());
				setStale(false);
			} else setStale(true);
		}
		const timer = setInterval(poll, pollMs);
		document.addEventListener("visibilitychange", poll);
		return () => {
			cancelled = true;
			clearInterval(timer);
			document.removeEventListener("visibilitychange", poll);
		};
	}, [pollMs]);

	return { data, stale };
}
