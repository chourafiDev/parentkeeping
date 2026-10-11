import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { AuthCard } from "../_components/auth-card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
	const params = await searchParams;
	const token = typeof params.token === "string" ? params.token : null;
	const isInvite = params.invite === "1";
	// Better Auth redirects here with ?error=INVALID_TOKEN for expired/used links.
	const invalid = !token || typeof params.error === "string";

	return (
		<AuthCard
			title={isInvite ? "Welcome to the team" : "New password"}
			description={
				isInvite
					? `Choose your password to access the ${SITE.name} admin.`
					: "Choose a new password for your account."
			}
		>
			{invalid ? (
				<div className="mt-10 grid gap-4 text-sm">
					<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
						This link is no longer valid (expired or already used).
					</p>
					<Link href="/admin/forgot-password" className="text-center font-medium hover:underline">
						Get a new link
					</Link>
				</div>
			) : (
				<ResetPasswordForm token={token} />
			)}
		</AuthCard>
	);
}
