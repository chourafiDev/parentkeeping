import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { requireStaffPage } from "@/server/auth/session";
import { PasswordCard } from "./_components/password-card";
import { ProfileCard } from "./_components/profile-card";
import { SessionsCard } from "./_components/sessions-card";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
	const { user, session } = await requireStaffPage();
	const sessions = await auth.api.listSessions({ headers: await headers() });

	return (
		<div className="mx-auto grid w-full max-w-3xl gap-4">
			<div>
				<h1 className="text-lg font-semibold">Account</h1>
				<p className="text-muted-foreground text-sm">Your login to the Parentkeeping admin.</p>
			</div>
			<ProfileCard name={user.name} email={user.email} />
			<PasswordCard />
			<SessionsCard
				currentToken={session.token}
				sessions={sessions
					.map((s) => ({
						token: s.token,
						userAgent: s.userAgent ?? null,
						ipAddress: s.ipAddress ?? null,
						createdAt: new Date(s.createdAt).toISOString(),
						updatedAt: new Date(s.updatedAt).toISOString(),
					}))
					.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))}
			/>
		</div>
	);
}
