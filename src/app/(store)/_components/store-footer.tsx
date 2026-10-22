import { Mail, MapPin, Phone } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { FREE_LIST_PATH } from "@/lib/free-list";
import {
	EU_NEWSLETTER_CHECKBOX,
	FOOTER_LEGAL_LINE,
	SIGNUP_NOTICE,
} from "@/lib/legal";
import { SITE } from "@/lib/site";
import { getSettings } from "@/server/queries/settings";
import { needsOptIn } from "@/server/services/subscribers";
import { container, pillDark } from "./ui";

const SHOP = [
	{ href: "/products/family-care-system", label: "Family Care System" },
	{ href: "/products/medical-binder", label: "Medical Binder" },
	{
		href: "/products/caregiver-agreement-template",
		label: "Caregiver Agreement",
	},
	{ href: FREE_LIST_PATH, label: "Free Medication List" },
	{ href: "/pages/caregiver-checklists", label: "Free Caregiver Checklists" },
	{ href: "/pages/caregiver-burnout-quiz", label: "Caregiver Burnout Quiz" },
	{ href: "/blogs/guides", label: "Guides" },
];
const POLICIES = [
	{ href: "/policies/refund-policy", label: "Refund Policy" },
	{ href: "/policies/privacy-policy", label: "Privacy Policy" },
	{ href: "/policies/terms-of-service", label: "Terms of Service" },
	{ href: "/pages/disclaimer", label: "Disclaimer" },
];

const heading = "text-foreground text-[17px] font-semibold tracking-[-0.02em]";
const linkClass = "text-body hover:text-foreground transition-colors";

/** Glozin footer: help, shop, policies, newsletter (= the free list sign-up). */
export async function StoreFooter() {
	const [{ contact }, country] = await Promise.all([
		getSettings("contact"),
		headers().then((h) => h.get("x-vercel-ip-country")),
	]);
	const optIn = needsOptIn(country);

	return (
		<footer className="mt-auto border-t">
			<div
				className={`${container} grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr]`}
			>
				<div className="grid content-start gap-4">
					<h2 className={heading}>Help</h2>
					<p className="text-body text-[15px] leading-[1.714]">
						Email us and a person will answer, usually within one business day.
						If you&apos;re not sure our product will help your life, ask first;
						we&apos;d rather tell you it&apos;s wrong for you than refund you
						later.
					</p>
					<div className="grid gap-2 text-[14px]">
						{contact.supportEmail && (
							<a
								href={`mailto:${contact.supportEmail}`}
								className="text-foreground flex items-center gap-2 font-medium hover:underline"
							>
								<Mail className="text-primary size-4 shrink-0" />
								{contact.supportEmail}
							</a>
						)}
						{contact.phone && (
							<a
								href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
								className="text-foreground flex items-center gap-2 font-medium hover:underline"
							>
								<Phone className="text-primary size-4 shrink-0" />
								{contact.phone}
							</a>
						)}
						{contact.postalAddress && (
							<p className="text-body flex items-start gap-2 whitespace-pre-line">
								<MapPin className="text-primary mt-0.5 size-4 shrink-0" />
								{contact.postalAddress}
							</p>
						)}
					</div>
					<div>
						<Link href="/pages/contact" className={pillDark}>
							Contact us
						</Link>
					</div>
				</div>
				<nav aria-label="Shop" className="grid content-start gap-3 text-[15px]">
					<h2 className={`${heading} mb-1`}>Shop</h2>
					{SHOP.map((l) => (
						<Link key={l.href} href={l.href} className={linkClass}>
							{l.label}
						</Link>
					))}
				</nav>
				<nav
					aria-label="Policies"
					className="grid content-start gap-3 text-[15px]"
				>
					<h2 className={`${heading} mb-1`}>Policies</h2>
					{POLICIES.map((l) => (
						<Link key={l.href} href={l.href} className={linkClass}>
							{l.label}
						</Link>
					))}
				</nav>
				<div className="flex flex-col justify-between">
					<div className="grid content-start gap-4">
						<h2 className={heading}>Get the free Medication List</h2>
						<p className="text-body text-[15px] leading-[1.714]">
							A printable medication list and daily chart for your parent, then
							our weekly caregiving emails.
						</p>
						<form action="/api/subscribe" method="post" className="grid gap-3">
							<div className="flex gap-2">
								<label htmlFor="footer-email" className="sr-only">
									Email address
								</label>
								<input
									id="footer-email"
									name="email"
									type="email"
									required
									autoComplete="email"
									placeholder="Enter your email…"
									className="border-input focus-visible:border-foreground h-[50px] min-w-0 flex-1 rounded-full border px-5 text-[15px] outline-none"
								/>
								<button
									type="submit"
									className="bg-foreground hover:bg-primary h-[50px] shrink-0 rounded-full px-6 text-[15px] font-semibold text-white transition-colors"
								>
									Sign Up
								</button>
							</div>
							{optIn && (
								<label className="flex items-start gap-2.5 text-sm">
									<input
										type="checkbox"
										name="newsletter"
										className="accent-primary mt-0.5 size-4"
									/>
									<span>{EU_NEWSLETTER_CHECKBOX}</span>
								</label>
							)}
							<input
								type="text"
								name="website"
								tabIndex={-1}
								autoComplete="off"
								aria-hidden
								className="hidden"
							/>
							<p className="text-body text-xs">
								{optIn
									? "Weekly emails only if you tick the box."
									: SIGNUP_NOTICE}{" "}
								<Link
									href="/policies/privacy-policy"
									className="text-foreground font-semibold"
								>
									Privacy Policy
								</Link>
							</p>
						</form>
					</div>
					<ul
						className="flex flex-wrap items-center gap-1.5"
						aria-label="Accepted payment methods"
					>
						{[
							"visa",
							"mastercard",
							"amex",
							"discover",
							"google-pay",
							"paypal",
						].map((card) => (
							<li key={card} className="rounded-[4px] border bg-white p-0.5">
								<Image
									src={`/images/cards/${card}.png`}
									alt={card}
									width={35}
									height={20}
								/>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="border-t">
				<div
					className={`${container} grid gap-2 py-6 text-[13px] md:grid-cols-[1fr_auto] md:items-center`}
				>
					<p className="text-body">
						© {new Date().getFullYear()} {SITE.name} · {FOOTER_LEGAL_LINE}
					</p>
					<p className="text-body">Secure checkout by Stripe</p>
				</div>
			</div>
		</footer>
	);
}
