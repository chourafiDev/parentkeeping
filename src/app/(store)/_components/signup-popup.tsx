"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isExcludedPath } from "@/lib/analytics";
import { FREE_LIST_PATH } from "@/lib/free-list";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pk_signup_popup";
const DELAY_MS = 40_000;
const QUIET_DAYS = 30;

/** Pages where an interruption would be wrong: sign-up pages themselves, legal, contact, after purchase. */
const NEVER = [
	FREE_LIST_PATH,
	"/pages/caregiver-checklists",
	"/pages/contact",
	"/pages/disclaimer",
	"/pages/unsubscribe",
	"/policies",
	"/thank-you",
	"/reviews",
];
const neverHere = (pathname: string) =>
	isExcludedPath(pathname) ||
	NEVER.some((p) => pathname === p || pathname.startsWith(`${p}/`));

function recentlySeen() {
	try {
		const at = Number(localStorage.getItem(STORAGE_KEY));
		return at > 0 && Date.now() - at < QUIET_DAYS * 86_400_000;
	} catch {
		return true; // storage blocked: stay quiet rather than show it on every page
	}
}
function remember() {
	try {
		localStorage.setItem(STORAGE_KEY, String(Date.now()));
	} catch {}
}

/**
 * The free Medication List, offered once: after 40 seconds or when the mouse
 * heads for the browser bar (desktop), as a small slide-in on phones. Never
 * a discount, never on the quiz, and quiet for 30 days after "No thanks" or
 * a sign-up. Product pages only get the leaving-the-page version (and never
 * on phones, where the sticky buy bar lives).
 */
export function SignupPopup({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [mobile, setMobile] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (neverHere(pathname) || recentlySeen()) return;
		const isMobile = window.matchMedia(
			"(max-width: 767px), (pointer: coarse)",
		).matches;
		const productPage = pathname.startsWith("/products/");
		if (isMobile && productPage) return;

		const show = () => {
			if (recentlySeen()) return;
			remember();
			setMobile(isMobile);
			setOpen(true);
			cleanup();
		};
		const onLeave = (e: MouseEvent) => {
			if (!e.relatedTarget && e.clientY <= 0) show();
		};
		const timer = productPage ? undefined : setTimeout(show, DELAY_MS);
		if (!isMobile) document.addEventListener("mouseout", onLeave);
		function cleanup() {
			clearTimeout(timer);
			document.removeEventListener("mouseout", onLeave);
		}
		return cleanup;
	}, [pathname]);

	useEffect(() => {
		if (!open) return;
		panelRef.current
			?.querySelector<HTMLInputElement>("input[type=email]")
			?.focus({ preventScroll: true });
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open]);

	const close = () => setOpen(false);
	const body = (
		<div className="grid gap-3">
			<p className="text-primary text-xs font-bold tracking-[0.02em] uppercase">
				Free printable
			</p>
			<h2 className="text-foreground text-[24px] leading-tight font-semibold tracking-[-0.034em]">
				The Medication List &amp; Daily Chart
			</h2>
			<p className="text-body text-[15px] leading-[1.6]">
				One list of your parent&apos;s medications to bring to every
				appointment, plus a daily chart and wallet cards. Fillable PDF, sent to
				your inbox.
			</p>
			{/* The form stays mounted, so Turnstile (when on) renders before it opens. */}
			<div onSubmitCapture={remember}>{children}</div>
			<button
				type="button"
				onClick={close}
				className="text-body hover:text-foreground justify-self-start text-sm underline underline-offset-2"
			>
				No thanks
			</button>
		</div>
	);

	// Always mounted, hidden until opened.
	return (
		<div
			inert={!open}
			aria-hidden={!open}
			className={cn(
				"fixed inset-0 z-50 transition-opacity duration-300",
				open ? "opacity-100" : "pointer-events-none invisible opacity-0",
				// Phones: no backdrop, so the page behind stays usable.
				mobile && "pointer-events-none",
			)}
		>
			{!mobile && (
				<button
					type="button"
					aria-label="Close"
					tabIndex={-1}
					onClick={close}
					className="absolute inset-0 bg-black/40"
				/>
			)}
			<div
				ref={panelRef}
				role="dialog"
				aria-modal={!mobile}
				aria-label="Free Medication List"
				className={cn(
					"bg-background pointer-events-auto absolute overflow-hidden shadow-2xl",
					mobile
						? "inset-x-3 bottom-3 max-h-[85vh] overflow-y-auto rounded-[14px] p-5 transition-transform duration-300"
						: "top-1/2 left-1/2 grid w-[min(860px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[14px] md:grid-cols-[1fr_1.15fr]",
					mobile && (open ? "translate-y-0" : "translate-y-[110%]"),
				)}
			>
				<button
					type="button"
					onClick={close}
					aria-label="Close"
					className="text-foreground absolute top-3 right-3 z-10 rounded-full bg-white/90 p-1.5 hover:bg-white"
				>
					<X className="size-4" />
				</button>
				{!mobile && (
					<div className="relative hidden min-h-[420px] bg-[#f5f5f5] md:block">
						<Image
							src="/images/home/promo-free-list.png"
							alt=""
							fill
							sizes="400px"
							className="object-cover"
						/>
					</div>
				)}
				<div className={mobile ? "" : "p-8"}>{body}</div>
			</div>
		</div>
	);
}
