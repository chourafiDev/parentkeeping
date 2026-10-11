"use client";

import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";
import { AuthLabel, authButtonClass, authInputClass } from "../_components/auth-fields";

const MIN_LENGTH = 10;

export function ResetPasswordForm({ token }: { token: string }) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expired, setExpired] = useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const password = String(form.get("password"));
		if (password.length < MIN_LENGTH) return setError(`At least ${MIN_LENGTH} characters.`);
		if (password !== String(form.get("confirm"))) return setError("The two passwords don't match.");

		setPending(true);
		setError(null);
		const { error } = await authClient.resetPassword({ newPassword: password, token });
		setPending(false);
		if (error) {
			if (error.code === "INVALID_TOKEN") setExpired(true);
			else setError("Couldn't save the password. Try again.");
			return;
		}
		toast.success("Password saved. You can sign in now.");
		router.replace("/admin/login");
	}

	if (expired) {
		return (
			<div className="mt-10 grid gap-4 text-sm">
				<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
					This link is no longer valid (expired or already used).
				</p>
				<Link href="/admin/forgot-password" className="text-center font-medium hover:underline">
					Get a new link
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className="mt-10 grid gap-6">
			<div className="grid gap-2">
				<AuthLabel htmlFor="password">Password</AuthLabel>
				<PasswordInput
					id="password"
					name="password"
					autoComplete="new-password"
					minLength={MIN_LENGTH}
					placeholder="Choose a password"
					required
					className={authInputClass}
				/>
				<span className="text-muted-foreground text-xs">At least {MIN_LENGTH} characters.</span>
			</div>
			<div className="grid gap-2">
				<AuthLabel htmlFor="confirm">Confirm password</AuthLabel>
				<PasswordInput
					id="confirm"
					name="confirm"
					autoComplete="new-password"
					placeholder="Type it again"
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
				Save password
			</Button>
		</form>
	);
}
