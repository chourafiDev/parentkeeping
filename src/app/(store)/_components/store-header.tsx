import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { getFoundingPrice } from "@/server/queries/settings";
import { type Announcement, AnnouncementBar } from "./announcement-bar";
import { container } from "./ui";

// Spec nav. No cart: every Buy button goes straight to Stripe Checkout.
const NAV = [
	{ href: "/products/family-care-system", label: "Family Care System" },
	{ href: "/products/medical-binder", label: "Medical Binder" },
	{
		href: "/products/caregiver-agreement-template",
		label: "Caregiver Agreement",
	},
	{ href: "/products/emergency-binder", label: "Emergency Binder" },
	{ href: FREE_LIST_PATH, label: "Free Medication List" },
];

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
				<div
					className={`${container} grid h-[70px] grid-cols-[1fr_auto_1fr] items-center gap-4`}
				>
					{/* Left: nav on desktop, disclosure menu on phones (works without JavaScript). */}
					<nav
						aria-label="Main"
						className="hidden items-center gap-4 text-[14px] lg:flex"
					>
						{/* As many product links as fit beside the centered logo; all of them are in the menu. */}
						{NAV.slice(0, 4).map((item, i) => (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"text-foreground hover:text-primary font-medium whitespace-nowrap transition-colors",
									i === 3 && "hidden min-[1360px]:inline",
								)}
							>
								{item.label}
							</Link>
						))}
					</nav>
					<details className="group relative lg:hidden">
						<summary className="hover:bg-muted flex size-10 cursor-pointer list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden">
							<Menu className="size-5" />
							<span className="sr-only">Menu</span>
						</summary>
						<nav
							aria-label="Main"
							className="bg-popover absolute start-0 z-20 mt-2 grid w-64 gap-1 rounded-xl border p-2 shadow-lg"
						>
							{NAV.map((item) => (
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

					<Link
						href="/"
						className="text-foreground text-[26px] leading-none font-semibold tracking-[-0.04em]"
					>
						<Image src="/logo.svg" alt={SITE.name} width={130} height={80} loading="eager" />
					</Link>

					<div className="flex justify-end">
						{/* The main path; the free list stays in the menu and the footer. */}
						<Link
							href={NAV[0].href}
							className="bg-foreground text-background hover:bg-primary hidden h-10 items-center rounded-full px-5 text-sm font-semibold transition-colors sm:inline-flex"
						>
							Get the System
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
