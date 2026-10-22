"use client";

import { useEffect, useRef } from "react";

type Turnstile = {
	render: (el: HTMLElement, options: { sitekey: string; size?: "normal" | "compact" | "flexible"; theme?: "light" | "dark" | "auto" }) => string;
	remove: (widgetId: string) => void;
};

declare global {
	interface Window {
		turnstile?: Turnstile;
	}
}

let loading: Promise<void> | null = null;

function loadTurnstile() {
	if (window.turnstile) return Promise.resolve();
	loading ??= new Promise<void>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => {
			loading = null;
			reject(new Error("Turnstile failed to load"));
		};
		document.head.appendChild(script);
	});
	return loading;
}

/**
 * Cloudflare Turnstile bot check. Rendered explicitly so forms that appear
 * after page load (the sign-up popup, the quiz result) still get a widget.
 * It adds the `cf-turnstile-response` field to the surrounding form.
 */
export function TurnstileWidget() {
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!siteKey) return;
		let widgetId: string | undefined;
		let cancelled = false;
		loadTurnstile()
			.then(() => {
				if (!cancelled && ref.current && window.turnstile) {
					// The store is light-only: "auto" would draw a black box for dark-mode visitors.
					widgetId = window.turnstile.render(ref.current, { sitekey: siteKey, size: "flexible", theme: "light" });
				}
			})
			.catch(() => {});
		return () => {
			cancelled = true;
			if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
		};
	}, [siteKey]);

	if (!siteKey) return null;
	return <div ref={ref} />;
}
