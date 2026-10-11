import type { Metadata } from "next";
import { AuthCard } from "../_components/auth-card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
	return (
		<AuthCard
			title="Forgot password"
			description="We'll email you a link to choose a new password."
		>
			<ForgotPasswordForm />
		</AuthCard>
	);
}
