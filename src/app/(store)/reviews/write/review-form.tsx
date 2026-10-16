"use client";

import { Check, Loader, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { pillDark } from "../../_components/ui";

const inputClass =
	"text-foreground placeholder:text-body w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[15px] outline-none focus-visible:border-foreground focus-visible:ring-foreground/10 focus-visible:ring-4";
const LABELS = ["", "Didn't help", "Not much help", "Helped some", "Helped a lot", "Exactly what we needed"];

type Entry = { rating: number; headline: string; body: string };

function StarPicker({ value, onChange, name }: { value: number; onChange: (n: number) => void; name: string }) {
	const [hover, setHover] = useState(0);
	const shown = hover || value;
	return (
		<div className="flex items-center gap-3">
			<div role="radiogroup" aria-label={`Rating for ${name}`} className="flex gap-1" onMouseLeave={() => setHover(0)}>
				{[1, 2, 3, 4, 5].map((n) => (
					<button
						key={n}
						type="button"
						role="radio"
						aria-checked={value === n}
						aria-label={`${n} star${n > 1 ? "s" : ""}`}
						onClick={() => onChange(n)}
						onMouseEnter={() => setHover(n)}
						className="p-0.5"
					>
						<Star className={cn("size-7 transition-colors", n <= shown ? "fill-[#f5a524] text-[#f5a524]" : "fill-[#e5e5e5] text-[#e5e5e5]")} />
					</button>
				))}
			</div>
			<span className="text-body text-sm">{LABELS[shown]}</span>
		</div>
	);
}

export function ReviewForm({
	orderId,
	sig,
	suggestedName,
	products,
}: {
	orderId: string;
	sig: string;
	suggestedName: string;
	products: { productId: string; title: string }[];
}) {
	const [entries, setEntries] = useState<Record<string, Entry>>(
		Object.fromEntries(products.map((p) => [p.productId, { rating: 0, headline: "", body: "" }])),
	);
	const [displayName, setDisplayName] = useState(suggestedName);
	const [consent, setConsent] = useState(false);
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [error, setError] = useState<string | null>(null);

	const set = (id: string, patch: Partial<Entry>) => setEntries((e) => ({ ...e, [id]: { ...e[id], ...patch } }));
	// Products left untouched are skipped (a buyer can review just one).
	const started = products.filter((p) => {
		const e = entries[p.productId];
		return e.rating > 0 || e.headline.trim() || e.body.trim();
	});

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		if (started.length === 0) return setError("Rate at least one product.");
		if (started.some((p) => entries[p.productId].rating === 0)) return setError("Pick a star rating for each product you reviewed.");
		setState("sending");
		const res = await fetch("/api/reviews", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				orderId,
				sig,
				displayName,
				consent,
				reviews: started.map((p) => ({ productId: p.productId, ...entries[p.productId] })),
			}),
		}).catch(() => null);
		if (res?.ok) return setState("sent");
		const body = (await res?.json().catch(() => null)) as { error?: string } | null;
		setError(body?.error ?? "Something went wrong. Please try again.");
		setState("idle");
	}

	if (state === "sent") {
		return (
			<div className="grid justify-items-center gap-3 rounded-[10px] bg-[#f5f5f5] p-8 text-center">
				<span className="bg-primary flex size-12 items-center justify-center rounded-full text-white">
					<Check className="size-6" />
				</span>
				<p className="text-foreground text-[20px] font-semibold">Thank you for writing it</p>
				<p className="text-body text-[15px]">We read every review. Yours will appear on the product page once we&apos;ve checked it isn&apos;t spam.</p>
			</div>
		);
	}

	return (
		<form onSubmit={submit} className="grid gap-6">
			{products.map((p) => {
				const entry = entries[p.productId];
				return (
					<fieldset key={p.productId} className="grid gap-4 rounded-[10px] border p-5">
						<legend className="text-foreground px-1 text-[17px] font-semibold">{p.title}</legend>
						<StarPicker value={entry.rating} onChange={(rating) => set(p.productId, { rating })} name={p.title} />
						<label className="grid gap-1.5">
							<span className="text-foreground text-sm font-medium">Headline</span>
							<input
								className={inputClass}
								maxLength={80}
								placeholder="e.g. No more group texts about pills"
								value={entry.headline}
								onChange={(e) => set(p.productId, { headline: e.target.value })}
							/>
						</label>
						<label className="grid gap-1.5">
							<span className="text-foreground text-sm font-medium">Your review</span>
							<textarea
								className={cn(inputClass, "min-h-[130px]")}
								maxLength={2000}
								placeholder="What was it like before, and what's different now?"
								value={entry.body}
								onChange={(e) => set(p.productId, { body: e.target.value })}
							/>
						</label>
					</fieldset>
				);
			})}

			<label className="grid gap-1.5">
				<span className="text-foreground text-sm font-medium">Name to show</span>
				<input className={inputClass} required maxLength={40} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
				<span className="text-body text-xs">First name and last initial is plenty. Your email is never shown.</span>
			</label>

			<label className="text-foreground flex items-start gap-2.5 text-sm">
				<input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-primary mt-0.5 size-4" />
				<span>Parentkeeping may publish my review on its website with the name above, marked as a verified buyer.</span>
			</label>

			{error && <p className="bg-destructive/10 text-destructive rounded-[10px] p-3 text-sm">{error}</p>}

			<button type="submit" disabled={state === "sending"} className={cn(pillDark, "w-full sm:w-auto sm:justify-self-start")}>
				{state === "sending" && <Loader className="size-4 animate-spin" />}
				Send my review
			</button>
		</form>
	);
}
