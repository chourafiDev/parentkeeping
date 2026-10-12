import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EU_NEWSLETTER_CHECKBOX, SIGNUP_NOTICE } from "@/lib/legal";

/**
 * Plain HTML form (works without JavaScript): POST /api/subscribe, then the
 * thank-you page. Honeypot + Cloudflare Turnstile when its site key is set.
 */
export function SignupForm({ optIn, devCountry, id }: { optIn: boolean; devCountry?: string; id: string }) {
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
	return (
		<form action="/api/subscribe" method="post" className="grid gap-3">
			<label htmlFor={`${id}-email`} className="sr-only">
				Email address
			</label>
			<div className="flex flex-col gap-2 sm:flex-row">
				<Input
					id={`${id}-email`}
					name="email"
					type="email"
					required
					autoComplete="email"
					placeholder="Your email address"
					className="h-12 text-base sm:flex-1"
				/>
				<Button type="submit" className="h-12 px-6 text-base">
					Send me the free list
				</Button>
			</div>
			{optIn && (
				<label className="flex items-start gap-2.5 text-sm">
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
			<p className="text-muted-foreground text-xs">
				{optIn ? "We'll email you the list. Weekly emails only if you tick the box; unsubscribe anytime." : SIGNUP_NOTICE}{" "}
				<a href="/policies/privacy-policy" className="underline underline-offset-2">
					Privacy Policy
				</a>
			</p>
		</form>
	);
}
