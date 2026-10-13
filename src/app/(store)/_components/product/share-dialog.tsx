"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { FaPinterestP } from "react-icons/fa";
import { LuFacebook, LuTwitter } from "react-icons/lu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
				{
					label: "Share on Facebook",
					Icon: LuFacebook,
					href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
				},
				{
					label: "Share on X",
					Icon: LuTwitter,
					href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
				},
				{
					label: "Share on Pinterest",
					Icon: FaPinterestP,
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
						{copied ? (
							<Check className="size-4" />
						) : (
							<Copy className="size-4" />
						)}
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
