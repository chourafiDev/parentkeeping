import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const instrumentSans = Instrument_Sans({
	variable: "--font-sans",
	subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	// Same source as JSON-LD and emails (NEXT_PUBLIC_SITE_URL first), so canonical
	// and og:url never pick up an auth URL that points at localhost.
	metadataBase: new URL(siteUrl()),
	title: { default: SITE.name, template: `%s · ${SITE.name}` },
	// Pages that set their own openGraph image get a large card on X instead of a thumbnail.
	twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${instrumentSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<NuqsAdapter>
					<QueryProvider>
						<TooltipProvider>{children}</TooltipProvider>
					</QueryProvider>
				</NuqsAdapter>
				<Toaster />
			</body>
		</html>
	);
}
