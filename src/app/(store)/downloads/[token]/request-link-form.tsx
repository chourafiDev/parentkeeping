"use client";

import { Loader, MailCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** "Email me a new link": same answer whether or not the email has orders. */
export function RequestLinkForm() {
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [error, setError] = useState<string | null>(null);

	async function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		setState("sending");
		setError(null);
		const res = await fetch("/api/downloads/request-link", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email: data.get("email"), website: data.get("website") }),
		});
		if (!res.ok) {
			const body = (await res.json().catch(() => null)) as { error?: string } | null;
			setError(body?.error ?? "Something went wrong. Try again.");
			setState("idle");
			return;
		}
		setState("sent");
	}

	if (state === "sent") {
		return (
			<p className="bg-accent flex items-start gap-3 rounded-lg p-3 text-start text-sm">
				<MailCheck className="text-primary mt-0.5 size-4 shrink-0" />
				If that email has an order with us, a new download link is on its way. Check your spam folder too.
			</p>
		);
	}

	return (
		<form onSubmit={submit} className="grid gap-2 text-start">
			<label htmlFor="email" className="text-sm font-medium">
				Email you used at checkout
			</label>
			<div className="flex gap-2">
				<Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="h-10" />
				<Button type="submit" className="h-10" disabled={state === "sending"}>
					{state === "sending" && <Loader className="size-4 animate-spin" />}
					Email me a new link
				</Button>
			</div>
			{/* Honeypot: hidden from people, filled by bots. */}
			<input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}
		</form>
	);
}
