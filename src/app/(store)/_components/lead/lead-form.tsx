import Script from "next/script";
import { EU_NEWSLETTER_CHECKBOX, signupNotice } from "@/lib/legal";
import type { LeadMagnet } from "@/lib/lead-magnets";
import { cn } from "@/lib/utils";
import { pillBrand, pillDark } from "../ui";

/**
 * Glozin newsletter-style sign-up (plain HTML form, works without
 * JavaScript): POST /api/subscribe, then the magnet's thank-you page.
 * Honeypot + Cloudflare Turnstile when its site key is set.
 */
export function LeadForm({
	magnet,
	optIn,
	devCountry,
	id,
	tone = "light",
	stacked = false,
}: {
	magnet: LeadMagnet;
	optIn: boolean;
	devCountry?: string;
	id: string;
	/** "dark" sits on the deep closing banner. */
	tone?: "light" | "dark";
	/** Email above the button at every width (narrow spots like the popup). */
	stacked?: boolean;
}) {
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
	const dark = tone === "dark";
	return (
		<form action="/api/subscribe" method="post" className="grid gap-3">
			<input type="hidden" name="source" value={magnet.source} />
			<label htmlFor={`${id}-email`} className="sr-only">
				Email address
			</label>
			<div className={cn("flex flex-col gap-2.5", !stacked && "sm:flex-row")}>
				<input
					id={`${id}-email`}
					name="email"
					type="email"
					required
					autoComplete="email"
					placeholder="Enter your email address"
					className={cn(
						"text-foreground placeholder:text-body h-[50px] min-w-0 rounded-full border bg-white px-5 text-[15px] outline-none sm:flex-1",
						"focus-visible:border-foreground focus-visible:ring-foreground/10 focus-visible:ring-4",
						dark ? "border-white" : "border-[#e5e5e5]",
					)}
				/>
				<button type="submit" className={cn(dark ? pillBrand : pillDark, "shrink-0")}>
					{magnet.button}
				</button>
			</div>
			{optIn && (
				<label className={cn("flex items-start gap-2.5 text-sm", dark ? "text-white/85" : "text-foreground")}>
					{/* Unticked by default: the file comes either way. */}
					<input type="checkbox" name="newsletter" className="accent-primary mt-0.5 size-4" />
					<span>{EU_NEWSLETTER_CHECKBOX}</span>
				</label>
			)}
			{/* Honeypot: hidden from people, filled by bots. */}
			<input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
			{devCountry && <input type="hidden" name="country" value={devCountry} />}
			{siteKey && (
				<>
					<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
					<div className="cf-turnstile" data-sitekey={siteKey} data-size="flexible" />
				</>
			)}
			<p className={cn("text-xs leading-relaxed", dark ? "text-white/70" : "text-body")}>
				{optIn
					? `We'll email you ${magnet.noticeWhat}. Weekly emails only if you tick the box; unsubscribe anytime.`
					: signupNotice(magnet.noticeWhat)}{" "}
				<a href="/policies/privacy-policy" className="underline underline-offset-2">
					Privacy Policy
				</a>
			</p>
		</form>
	);
}
