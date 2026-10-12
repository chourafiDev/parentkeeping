import Link from "next/link";
import { FOOTER_LEGAL_LINE } from "@/lib/legal";
import { SITE } from "@/lib/site";
import { getSettings } from "@/server/queries/settings";

const LINKS = [
	{ href: "/policies/refund-policy", label: "Refund Policy" },
	{ href: "/policies/privacy-policy", label: "Privacy Policy" },
	{ href: "/policies/terms-of-service", label: "Terms of Service" },
	{ href: "/pages/disclaimer", label: "Disclaimer" },
	{ href: "/pages/contact", label: "Contact" },
];

export async function StoreFooter() {
	const { contact } = await getSettings("contact");
	return (
		<footer className="bg-muted/60 border-t">
			<div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm">
				<nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
					{LINKS.map((l) => (
						<Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground">
							{l.label}
						</Link>
					))}
				</nav>
				<p className="text-muted-foreground max-w-3xl text-xs">{FOOTER_LEGAL_LINE}</p>
				<p className="text-muted-foreground text-xs">
					© {new Date().getFullYear()} {contact.legalName ?? SITE.name}
					{contact.supportEmail && (
						<>
							{" · "}
							<a href={`mailto:${contact.supportEmail}`} className="hover:text-foreground">
								{contact.supportEmail}
							</a>
						</>
					)}
				</p>
			</div>
		</footer>
	);
}
