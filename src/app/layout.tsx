import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE } from "@/lib/site";
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
	metadataBase: process.env.BETTER_AUTH_URL
		? new URL(process.env.BETTER_AUTH_URL)
		: undefined,
	title: { default: SITE.name, template: `%s · ${SITE.name}` },
	// Nothing is public yet: keep search engines out until the store launches.
	robots: { index: false, follow: false },
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
