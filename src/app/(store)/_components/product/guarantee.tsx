import Link from "next/link";
import { GUARANTEE_TITLE, guaranteeText } from "@/lib/offer";
import { container, section, sectionTitle } from "../ui";

/** Round "14-day guarantee" seal, drawn (no image needed). */
function Seal() {
	return (
		<svg viewBox="0 0 120 120" className="text-primary size-[112px]" aria-hidden>
			<circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2" />
			<circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
			<defs>
				<path id="seal-top" d="M 22 60 A 38 38 0 0 1 98 60" />
				<path id="seal-bottom" d="M 26 66 A 34 34 0 0 0 94 66" />
			</defs>
			<text fill="currentColor" fontSize="9" fontWeight="700" letterSpacing="2.5">
				<textPath href="#seal-top" startOffset="50%" textAnchor="middle">
					GUARANTEE
				</textPath>
			</text>
			<text x="60" y="66" fill="currentColor" fontSize="30" fontWeight="700" textAnchor="middle" letterSpacing="-1">
				14
			</text>
			<text fill="currentColor" fontSize="8" fontWeight="700" letterSpacing="2">
				<textPath href="#seal-bottom" startOffset="50%" textAnchor="middle">
					DAYS
				</textPath>
			</text>
		</svg>
	);
}

/** Slate's centered guarantee block, with our 14-day "if it doesn't help" promise. */
export function ProductGuarantee({ supportEmail }: { supportEmail: string | null }) {
	return (
		<section className={`${container} ${section} border-t`}>
			<div className="mx-auto grid max-w-[760px] justify-items-center gap-4 text-center">
				<Seal />
				<h2 className={sectionTitle}>{GUARANTEE_TITLE}</h2>
				<p className="text-body text-[16px] leading-[1.714]">{guaranteeText(supportEmail)}</p>
				<Link href="/policies/refund-policy" className="text-foreground hover:text-primary text-[14px] font-semibold underline underline-offset-4">
					Read the refund policy
				</Link>
			</div>
		</section>
	);
}
