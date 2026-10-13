"use client";

import { Check, Loader } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { pillDark } from "../../_components/ui";

const inputClass =
	"text-foreground placeholder:text-body h-[50px] w-full rounded-full border border-[#e5e5e5] bg-white px-5 text-[15px] outline-none focus-visible:border-foreground focus-visible:ring-foreground/10 focus-visible:ring-4";

/** The Contact page's own form (same /api/contact endpoint as the product page's "Ask a question" dialog). */
export function ContactForm() {
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [error, setError] = useState<string | null>(null);

	async function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setState("sending");
		setError(null);
		const form = new FormData(e.currentTarget);
		const res = await fetch("/api/contact", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name: form.get("name"),
				phone: form.get("phone"),
				email: form.get("email"),
				message: form.get("message"),
				website: form.get("website"),
			}),
		}).catch(() => null);
		if (res?.ok) return setState("sent");
		const body = (await res?.json().catch(() => null)) as { error?: string } | null;
		setError(body?.error ?? "Something went wrong. Please try again.");
		setState("idle");
	}

	if (state === "sent") {
		return (
			<p className="text-foreground flex items-center gap-2 rounded-[10px] bg-[#f5f5f5] p-4 text-[15px] font-medium">
				<Check className="text-primary size-5" />
				Sent. We&apos;ll get back to you soon.
			</p>
		);
	}
	return (
		<form onSubmit={submit} className="grid gap-3">
			<div className="grid gap-3 sm:grid-cols-2">
				<input name="name" required placeholder="Your name*" className={inputClass} />
				<input name="phone" type="tel" placeholder="Your phone number" className={inputClass} />
			</div>
			<input name="email" type="email" required placeholder="Your email *" className={inputClass} />
			<textarea
				name="message"
				required
				rows={5}
				placeholder="Your message*"
				className="text-foreground placeholder:text-body focus-visible:border-foreground focus-visible:ring-foreground/10 min-h-[140px] w-full resize-y rounded-[20px] border border-[#e5e5e5] bg-white px-5 py-4 text-[15px] outline-none focus-visible:ring-4"
			/>
			{/* Honeypot: hidden from people, filled by bots. */}
			<input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
			{error && (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			)}
			<p className="text-body text-[13px]">* Required fields cannot be left blank.</p>
			<button type="submit" disabled={state === "sending"} className={cn(pillDark, "mt-1 w-full disabled:opacity-60 sm:w-auto")}>
				{state === "sending" && <Loader className="size-4 animate-spin" />}
				Send Your Message
			</button>
		</form>
	);
}
