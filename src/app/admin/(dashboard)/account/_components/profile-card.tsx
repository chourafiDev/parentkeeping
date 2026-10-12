"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { FormCard } from "../../_components/shared/form-card";

export function ProfileCard({ name, email }: { name: string; email: string }) {
	const router = useRouter();
	const [value, setValue] = useState(name);
	const [saving, setSaving] = useState(false);
	const changed = value.trim() !== name && value.trim() !== "";

	async function save(e: React.FormEvent) {
		e.preventDefault();
		if (!changed) return;
		setSaving(true);
		const { error } = await authClient.updateUser({ name: value.trim() });
		setSaving(false);
		if (error) {
			toast.error("Couldn't save your name");
			return;
		}
		toast.success("Name saved");
		router.refresh();
	}

	return (
		<FormCard title="Profile">
			<form onSubmit={save} className="grid gap-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel htmlFor="name">Name</FieldLabel>
						<Input id="name" value={value} onChange={(e) => setValue(e.target.value)} maxLength={100} autoComplete="name" />
						<FieldDescription>Shown in the admin and on order notes.</FieldDescription>
					</Field>
					<Field>
						<FieldLabel htmlFor="email">Login email</FieldLabel>
						<Input id="email" value={email} readOnly disabled />
						<FieldDescription>Password reset links are sent here.</FieldDescription>
					</Field>
				</div>
				<Button type="submit" className="justify-self-end" disabled={!changed || saving}>
					{saving && <Loader className="size-4 animate-spin" />}
					Save
				</Button>
			</form>
		</FormCard>
	);
}
