"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Small monochrome brand glyphs (lucide has none) for the share row. */
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M13.5 21v-7.6h2.6l.4-3h-3V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.2C16.3 4.14 15.4 4 14.3 4c-2.3 0-3.8 1.4-3.8 3.9V10.4H8v3h2.5V21h3Z" />
	</svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M13.6 10.6 20 4h-1.6l-5.5 5.75L8.4 4H3l6.7 9.46L3 20.3h1.6l5.8-6.08 4.8 6.08H21l-7.4-9.7Zm-2.05 2.15-.67-.92L5.5 5.15h2.1l4.3 5.9.67.92 5.7 7.85h-2.1l-4.57-6.07Z" />
	</svg>
);
const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" fill="currentColor" {...props}>
		<path d="M12 3.5a8.5 8.5 0 0 0-3.1 16.4c-.04-.7-.07-1.78.02-2.55.08-.63.52-4 .52-4s-.13-.26-.13-.65c0-.6.35-1.05.78-1.05.37 0 .55.28.55.61 0 .37-.24.93-.36 1.45-.1.43.22.79.65.79.78 0 1.38-.82 1.38-2 0-1.05-.75-1.78-1.83-1.78-1.25 0-1.98.94-1.98 1.9 0 .38.14.78.33 1 .04.04.04.08.03.12l-.12.5c-.02.08-.07.1-.15.06-.57-.26-.93-1.1-.93-1.76 0-1.44 1.04-2.76 3-2.76 1.57 0 2.8 1.12 2.8 2.62 0 1.56-.98 2.82-2.35 2.82-.46 0-.89-.24-1.04-.52l-.28 1.07c-.1.4-.38.9-.56 1.2.42.13.87.2 1.33.2A8.5 8.5 0 0 0 12 3.5Z" />
	</svg>
);

/** "Share": a modal with the copyable link and share-network buttons. */
export function ShareDialog({ title }: { title: string }) {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [copied, setCopied] = useState(false);

	async function copy() {
		await navigator.clipboard.writeText(url).catch(() => undefined);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	const networks = url
		? [
				{ label: "Share on Facebook", Icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
				{
					label: "Share on X",
					Icon: XIcon,
					href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
				},
				{
					label: "Share on Pinterest",
					Icon: PinterestIcon,
					href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
				},
			]
		: [];

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<button
				type="button"
				onClick={() => {
					setUrl(window.location.href.split("?")[0]);
					setOpen(true);
				}}
				className="text-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
			>
				<Share2 className="size-4" />
				Share
			</button>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle className="text-[22px]">Copy link</DialogTitle>
				</DialogHeader>
				<div className="flex items-center gap-3">
					<input
						readOnly
						value={url}
						onFocus={(e) => e.currentTarget.select()}
						className="text-foreground h-[50px] min-w-0 flex-1 rounded-full border border-[#e5e5e5] bg-white px-5 text-[15px] outline-none"
					/>
					<button
						type="button"
						onClick={copy}
						aria-label="Copy link"
						className="bg-foreground hover:bg-primary grid size-[50px] shrink-0 place-items-center rounded-full text-white transition-colors"
					>
						{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
					</button>
				</div>
				<div className="grid gap-3">
					<p className="text-foreground text-[15px] font-semibold">Share:</p>
					<div className="flex gap-3">
						{networks.map((n) => (
							<a
								key={n.label}
								href={n.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={n.label}
								className={cn(
									"text-foreground hover:border-foreground hover:bg-foreground grid size-11 place-items-center rounded-full border border-[#e5e5e5] transition-colors hover:text-white",
								)}
							>
								<n.Icon className="size-4" />
							</a>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
