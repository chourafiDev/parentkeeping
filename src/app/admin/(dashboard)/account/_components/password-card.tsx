"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { FormCard } from "../../_components/shared/form-card";

const MIN_LENGTH = 10;

/** Change password. Every other device is signed out at the same time. */
export function PasswordCard() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	async function save(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget;
		const data = new FormData(form);
		const current = String(data.get("current"));
		const next = String(data.get("next"));
		if (next.length < MIN_LENGTH) return setError(`Use at least ${MIN_LENGTH} characters.`);
		if (next !== String(data.get("confirm"))) return setError("The two new passwords don't match.");
		if (next === current) return setError("Choose a password different from the current one.");

		setSaving(true);
		setError(null);
		const { error } = await authClient.changePassword({
			currentPassword: current,
			newPassword: next,
			revokeOtherSessions: true,
		});
		setSaving(false);
		if (error) {
			setError(
				error.code === "INVALID_PASSWORD"
					? "Your current password is wrong."
					: error.status === 429
						? "Too many attempts. Wait a minute and try again."
						: "Couldn't change the password. Try again.",
			);
			return;
		}
		form.reset();
		toast.success("Password changed. Other devices were signed out.");
		router.refresh();
	}

	return (
		<FormCard title="Password">
			<form onSubmit={save} className="grid gap-4">
				<Field>
					<FieldLabel htmlFor="current">Current password</FieldLabel>
					<PasswordInput id="current" name="current" autoComplete="current-password" required />
				</Field>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel htmlFor="next">New password</FieldLabel>
						<PasswordInput id="next" name="next" autoComplete="new-password" minLength={MIN_LENGTH} required />
						<FieldDescription>At least {MIN_LENGTH} characters.</FieldDescription>
					</Field>
					<Field>
						<FieldLabel htmlFor="confirm">Confirm new password</FieldLabel>
						<PasswordInput id="confirm" name="confirm" autoComplete="new-password" required />
					</Field>
				</div>
				{error && <FieldError>{error}</FieldError>}
				<Button type="submit" className="justify-self-end" disabled={saving}>
					{saving && <Loader className="size-4 animate-spin" />}
					Change password
				</Button>
			</form>
		</FormCard>
	);
}
