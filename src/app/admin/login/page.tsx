import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/server/auth/session";
import { AuthCard } from "../_components/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
	title: "Sign in",
	robots: { index: false },
};

// Only allow redirecting back inside the admin (prevents open redirects).
function safeNext(next: string | string[] | undefined) {
	return typeof next === "string" && next.startsWith("/admin")
		? next
		: "/admin";
}

export default async function LoginPage({
	searchParams,
}: PageProps<"/admin/login">) {
	const next = safeNext((await searchParams).next);
	if (await getStaffSession()) redirect(next);

	return (
		<AuthCard
			title="Welcome back"
			description="Sign in to manage your store."
		>
			<LoginForm next={next} />
		</AuthCard>
	);
}
