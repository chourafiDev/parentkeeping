"use client";

import { formatDistanceToNow } from "date-fns";
import { Laptop, Loader, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { FormCard } from "../../_components/shared/form-card";

/** Local/unknown addresses (dev, proxies) aren't worth showing. */
const isPlaceholderIp = (ip: string | null) => !ip || /^[0:.]+$|^::1$|^127\./.test(ip);

type Session = { token: string; userAgent: string | null; ipAddress: string | null; createdAt: string; updatedAt: string };

/** "Mozilla/5.0 (Macintosh…) … Chrome/140…" → "Chrome on macOS" */
function describe(ua: string | null) {
	if (!ua) return { label: "Unknown device", mobile: false };
	const browser = /Edg\//.test(ua)
		? "Edge"
		: /Firefox\//.test(ua)
			? "Firefox"
			: /Chrome\//.test(ua)
				? "Chrome"
				: /Safari\//.test(ua)
					? "Safari"
					: "Browser";
	const os = /iPhone|iPad/.test(ua)
		? "iOS"
		: /Android/.test(ua)
			? "Android"
			: /Mac OS X|Macintosh/.test(ua)
				? "macOS"
				: /Windows/.test(ua)
					? "Windows"
					: /Linux/.test(ua)
						? "Linux"
						: "unknown system";
	return { label: `${browser} on ${os}`, mobile: /iPhone|Android|Mobile/.test(ua) };
}

/** Browsers where you're signed in; sign out any of them remotely. */
export function SessionsCard({ sessions, currentToken }: { sessions: Session[]; currentToken: string }) {
	const router = useRouter();
	const [busy, setBusy] = useState<string | null>(null);
	const others = sessions.filter((s) => s.token !== currentToken);

	async function revoke(token: string | "others") {
		setBusy(token);
		const { error } =
			token === "others" ? await authClient.revokeOtherSessions() : await authClient.revokeSession({ token });
		setBusy(null);
		if (error) {
			toast.error("Couldn't sign out that device");
			return;
		}
		toast.success(token === "others" ? "Signed out of every other device" : "Device signed out");
		router.refresh();
	}

	return (
		<FormCard
			title="Signed-in devices"
			action={
				others.length > 0 && (
					<Button variant="outline" size="sm" onClick={() => revoke("others")} disabled={busy !== null}>
						{busy === "others" && <Loader className="size-4 animate-spin" />}
						Sign out all others
					</Button>
				)
			}
		>
			<ul className="divide-y rounded-lg border">
				{sessions.map((s) => {
					const { label, mobile } = describe(s.userAgent);
					const Icon = mobile ? Smartphone : Laptop;
					const current = s.token === currentToken;
					return (
						<li key={s.token} className="flex items-center gap-3 p-3">
							<span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
								<Icon className="size-4" />
							</span>
							<div className="grid min-w-0 flex-1 gap-0.5">
								<div className="flex items-center gap-2">
									<span className="truncate text-sm font-medium">{label}</span>
									{current && <Badge variant="secondary">This device</Badge>}
								</div>
								<span className="text-muted-foreground truncate text-xs">
									{[isPlaceholderIp(s.ipAddress) ? null : s.ipAddress, `active ${formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}`, `signed in ${formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}`]
										.filter(Boolean)
										.join(" · ")}
								</span>
							</div>
							{!current && (
								<Button variant="ghost" size="sm" onClick={() => revoke(s.token)} disabled={busy !== null}>
									{busy === s.token && <Loader className="size-4 animate-spin" />}
									Sign out
								</Button>
							)}
						</li>
					);
				})}
			</ul>
			<p className="text-muted-foreground mt-2 text-xs">
				Sessions last 7 days. If you see a device you don&apos;t recognize, sign it out and change your password.
			</p>
		</FormCard>
	);
}
