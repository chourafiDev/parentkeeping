import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { DEFAULT_SHARE_IMAGE } from "@/lib/share-image";
import Link from "next/link";
import { getSettings } from "@/server/queries/settings";
import { container, eyebrow } from "../../_components/ui";
import { ContactForm } from "./contact-form";

const PATH = "/pages/contact";
const TITLE = "Contact";
const DESCRIPTION = "Email us and a person will answer, usually within one business day. Ask a question before you buy, or get help with an order.";

export const metadata: Metadata = {
	title: TITLE,
	description: DESCRIPTION,
	alternates: { canonical: PATH },
	openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, images: [DEFAULT_SHARE_IMAGE] },
};
export const dynamic = "force-dynamic";

export default async function ContactPage() {
	const { contact } = await getSettings("contact");

	return (
		<main className="flex-1">
			<div className={`${container} pt-6 pb-16 md:pb-[70px]`}>
				<nav aria-label="Breadcrumb" className="text-body mb-6 text-[13px]">
					<Link href="/" className="hover:text-foreground">
						Home
					</Link>
					<span className="mx-2">·</span>
					<span className="text-foreground">Contact</span>
				</nav>

				<div className="grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-[60px]">
					<div className="grid content-start gap-4">
						<p className={`${eyebrow} text-primary`}>Get in touch</p>
						<h1 className="text-foreground text-[32px] leading-[1.1] font-semibold tracking-[-0.034em] md:text-[40px]">{TITLE}</h1>
						<p className="text-body text-[15px] leading-[1.714]">
							Email us and a person will answer, usually within one business day. If you&apos;re not sure our product will help your life, ask
							first; we&apos;d rather tell you it&apos;s wrong for you than refund you later.
						</p>
						<div className="mt-2 grid gap-3 border-t pt-6 text-[15px]">
							{contact.supportEmail && (
								<a href={`mailto:${contact.supportEmail}`} className="text-foreground flex items-center gap-2.5 font-medium hover:underline">
									<Mail className="text-primary size-4 shrink-0" />
									{contact.supportEmail}
								</a>
							)}
							{contact.phone && (
								<a
									href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
									className="text-foreground flex items-center gap-2.5 font-medium hover:underline"
								>
									<Phone className="text-primary size-4 shrink-0" />
									{contact.phone}
								</a>
							)}
							{contact.postalAddress && (
								<p className="text-body flex items-start gap-2.5 whitespace-pre-line">
									<MapPin className="text-primary mt-0.5 size-4 shrink-0" />
									{contact.postalAddress}
								</p>
							)}
						</div>
					</div>

					<div className="rounded-[10px] bg-[#f5f5f5] p-6 md:p-10">
						<ContactForm />
					</div>
				</div>
			</div>
		</main>
	);
}
