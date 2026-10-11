"use client";

import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
	AuthLabel,
	authButtonClass,
	authInputClass,
} from "../_components/auth-fields";

export function LoginForm({ next }: { next: string }) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [remember, setRemember] = useState(true);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		setPending(true);
		setError(null);

		const { error } = await authClient.signIn.email({
			email: String(form.get("email")),
			password: String(form.get("password")),
			// Unchecked: the session ends when the browser closes (shared computers).
			rememberMe: remember,
		});

		if (error) {
			setPending(false);
			setError(
				error.status === 429
					? "Too many attempts. Wait a minute and try again."
					: "Wrong email or password.",
			);
			return;
		}
		router.replace(next);
		router.refresh();
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
			<div className="grid gap-2">
				<AuthLabel htmlFor="password">Password</AuthLabel>
				<PasswordInput
					id="password"
					name="password"
					autoComplete="current-password"
					placeholder="Your password"
					required
					className={authInputClass}
				/>
			</div>
			<div className="flex items-center justify-between gap-4">
				<label className="text-muted-foreground flex items-center gap-2.5 text-sm">
					<Checkbox
						checked={remember}
						onCheckedChange={(v) => setRemember(v === true)}
					/>
					Remember me
				</label>
				<Link
					href="/admin/forgot-password"
					className="text-sm font-medium hover:underline"
				>
					Forgot password?
				</Link>
			</div>
			{error && (
				<p role="alert" className="text-destructive -mt-2 text-sm">
					{error}
				</p>
			)}
			<Button type="submit" disabled={pending} className={authButtonClass}>
				{pending && <Loader className="size-4 animate-spin" />}
				{pending ? "Signing in…" : "Sign in"}
			</Button>
			<p className="text-muted-foreground text-center text-sm">
				No access yet?{" "}
				<span className="text-foreground">
					Ask the owner for an invite.
				</span>
			</p>
		</form>
	);
}
