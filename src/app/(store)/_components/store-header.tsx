import { Menu } from "lucide-react";
import Link from "next/link";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { SITE } from "@/lib/site";

// Spec nav. No cart: every Buy button goes straight to Stripe Checkout.
const NAV = [
	{ href: "/products/family-care-system", label: "Family Care System" },
	{ href: "/products/medical-binder", label: "Medical Binder" },
	{ href: "/products/caregiver-agreement-template", label: "Caregiver Agreement" },
	{ href: FREE_LIST_PATH, label: "Free Medication List" },
];

export function StoreHeader() {
	return (
		<header className="border-b">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
				<Link href="/" className="text-lg font-semibold tracking-tight">
					{SITE.name}
				</Link>
				<nav aria-label="Main" className="hidden gap-6 text-sm md:flex">
					{NAV.map((item) => (
						<Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
							{item.label}
						</Link>
					))}
				</nav>
				{/* Phones: a disclosure menu (works without JavaScript). */}
				<details className="group relative md:hidden">
					<summary className="hover:bg-muted flex size-10 cursor-pointer list-none items-center justify-center rounded-lg [&::-webkit-details-marker]:hidden">
						<Menu className="size-5" />
						<span className="sr-only">Menu</span>
					</summary>
					<nav aria-label="Main" className="bg-popover absolute end-0 z-20 mt-2 grid w-60 gap-1 rounded-xl border p-2 shadow-lg">
						{NAV.map((item) => (
							<Link key={item.href} href={item.href} className="hover:bg-muted rounded-lg px-3 py-2 text-sm">
								{item.label}
							</Link>
						))}
					</nav>
				</details>
			</div>
		</header>
	);
}
