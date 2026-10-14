"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RangeId } from "@/lib/analytics-ranges";
import { api } from "@/lib/api-client";
import type { LiveView } from "@/server/queries/analytics";

/**
 * Live View data for a date range, refreshed every `pollMs` while the tab is
 * visible (and right away when the range changes or the tab comes back).
 * `stale` = the last request failed; `loading` = a new range is on its way.
 */
export function useLiveData(initial: LiveView, pollMs = 10_000) {
	const [data, setData] = useState(initial);
	const [range, setRangeState] = useState<RangeId>(initial.range);
	const [stale, setStale] = useState(false);
	const [loading, setLoading] = useState(false);
	const shown = useRef(initial.range);

	const setRange = useCallback((next: RangeId) => {
		setLoading(true);
		setRangeState(next);
	}, []);

	useEffect(() => {
		let cancelled = false;
		async function poll() {
			if (document.visibilityState !== "visible") return;
			const res = await api.api.admin.analytics.live.$get({ query: { range } }).catch(() => null);
			if (cancelled) return;
			if (res?.ok) {
				setData(await res.json());
				shown.current = range;
				setStale(false);
			} else setStale(true);
			setLoading(false);
		}
		// The first render already has the server's numbers for this range.
		if (range !== shown.current) void poll();
		const timer = setInterval(poll, pollMs);
		document.addEventListener("visibilitychange", poll);
		return () => {
			cancelled = true;
			clearInterval(timer);
			document.removeEventListener("visibilitychange", poll);
		};
	}, [range, pollMs]);

	return { data, range, setRange, stale, loading };
}
