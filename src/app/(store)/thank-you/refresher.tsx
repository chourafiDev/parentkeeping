"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Webhook not in yet: re-check every 2 s for about 30 s, then stop. */
export function Refresher() {
	const router = useRouter();
	const [tries, setTries] = useState(0);
	const done = tries >= 15;

	useEffect(() => {
		if (done) return;
		const t = setTimeout(() => {
			setTries((n) => n + 1);
			router.refresh();
		}, 2000);
		return () => clearTimeout(t);
	}, [tries, done, router]);

	return done ? (
		<p className="text-muted-foreground text-sm">
			This is taking longer than usual. Your payment went through; your download link is on its way by email.
		</p>
	) : (
		<p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
			<Loader className="size-4 animate-spin" />
			Preparing your files…
		</p>
	);
}
