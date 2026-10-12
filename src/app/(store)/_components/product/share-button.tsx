"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

/** "Share": the phone's share sheet when there is one, otherwise copy the link. */
export function ShareButton({ title }: { title: string }) {
	const [copied, setCopied] = useState(false);

	async function share() {
		const url = window.location.href.split("?")[0];
		if (navigator.share) {
			await navigator.share({ title, url }).catch(() => undefined);
			return;
		}
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<button type="button" onClick={share} className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors">
			{copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
			{copied ? "Link copied" : "Share"}
		</button>
	);
}
