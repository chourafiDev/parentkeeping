"use client";

import { Loader, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { AuthLabel, authButtonClass, authInputClass } from "../_components/auth-fields";

export function ForgotPasswordForm() {
	const [pending, setPending] = useState(false);
	const [sentTo, setSentTo] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const email = String(new FormData(e.currentTarget).get("email")).trim();
		setPending(true);
		setError(null);
		const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/admin/reset-password" });
		setPending(false);
		if (error) {
			setError(
				error.status === 429
					? "Too many requests. Try again in a few minutes."
					: "Couldn't send the email. Try again later.",
			);
			return;
		}
		// Same message whether or not the account exists (no account discovery).
		setSentTo(email);
	}

	if (sentTo) {
		return (
			<div className="mt-10 grid gap-4 text-sm">
				<div className="flex items-start gap-3 rounded-lg bg-accent p-3 text-foreground">
					<MailCheck className="mt-0.5 size-4 shrink-0" />
					<p>
						If an account exists for <strong>{sentTo}</strong>, we just sent an email with a link valid for 1 hour. Check your spam folder too.
					</p>
				</div>
				<Link href="/admin/login" className="text-center font-medium hover:underline">
					Back to sign in
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className="mt-10 grid gap-6">
			<div className="grid gap-2">
				<AuthLabel htmlFor="email">Email</AuthLabel>
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					placeholder="you@example.com"
					required
					className={authInputClass}
				/>
			</div>
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}
			<Button type="submit" disabled={pending} className={authButtonClass}>
				{pending && <Loader className="size-4 animate-spin" />}
				Send the link
			</Button>
			<p className="text-muted-foreground text-center text-sm">
				Remembered it?{" "}
				<Link href="/admin/login" className="text-foreground font-medium hover:underline">
					Back to sign in
				</Link>
			</p>
		</form>
	);
}
