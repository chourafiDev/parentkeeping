import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { SITE } from "@/lib/site";
import { getFoundingPrice } from "@/server/queries/settings";
import { type Announcement, AnnouncementBar } from "./announcement-bar";
import { container } from "./ui";

// Spec nav. No cart: every Buy button goes straight to Stripe Checkout.
const PRODUCT_NAV = [
	{ href: "/products/family-care-system", label: "Family Care System" },
	{ href: "/products/medical-binder", label: "Medical Binder" },
	{
		href: "/products/caregiver-agreement-template",
		label: "Caregiver Agreement",
	},
	{ href: "/products/emergency-binder", label: "Emergency Binder" },
];
const FREE_LIST_LINK = { href: FREE_LIST_PATH, label: "Free Medication List" };

const fmtDay = (d: Date) =>
	d.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		timeZone: "America/New_York",
	});

export async function StoreHeader() {
	const founding = await getFoundingPrice();
	const messages: Announcement[] = [
		...(founding.active && founding.endsAt
			? [
					{
						text: `Founding price until ${fmtDay(founding.endsAt)}.`,
						link: {
							href: "/products/family-care-system",
							label: "Get the System",
						},
					},
				]
			: []),
		{ text: "14-day “if it doesn't help” guarantee." },
		{
			text: "New here? Start with the free Medication List.",
			link: { href: FREE_LIST_PATH, label: "Get it free" },
		},
	];

	return (
		<header className="bg-background sticky top-0 z-30">
			<AnnouncementBar messages={messages} />
			<div className="border-b">
				{/* Logo left, product links centered, the main button right. */}
				<div
					className={`${container} grid h-[70px] grid-cols-[1fr_auto_1fr] items-center gap-4`}
				>
					<Link href="/" className="justify-self-start">
						<Image src="/logo.svg" alt={SITE.name} width={110} height={68} loading="eager" />
					</Link>

					<nav
						aria-label="Main"
						className="hidden items-center gap-6 text-[15px] lg:flex xl:gap-8"
					>
						{PRODUCT_NAV.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="text-foreground hover:text-primary font-medium whitespace-nowrap transition-colors"
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className="col-start-3 flex items-center justify-end gap-2">
						{/* The main path; the free list is in the menu and the footer. */}
						<Link
							href={PRODUCT_NAV[0].href}
							className="bg-foreground text-background hover:bg-primary hidden h-10 items-center rounded-full px-5 text-sm font-semibold whitespace-nowrap transition-colors sm:inline-flex"
						>
							Get the System
						</Link>
						{/* Phones and tablets: a disclosure menu (works without JavaScript). */}
						<details className="group relative lg:hidden">
							<summary className="hover:bg-muted flex size-10 cursor-pointer list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden">
								<Menu className="size-5" />
								<span className="sr-only">Menu</span>
							</summary>
							<nav
								aria-label="Main"
								className="bg-popover absolute end-0 z-20 mt-2 grid w-64 gap-1 rounded-xl border p-2 shadow-lg"
							>
								{[...PRODUCT_NAV, FREE_LIST_LINK].map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className="hover:bg-muted rounded-lg px-3 py-2.5 text-[15px] font-medium"
									>
										{item.label}
									</Link>
								))}
							</nav>
						</details>
					</div>
				</div>
			</div>
		</header>
	);
}
