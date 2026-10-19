// Seeds the catalog from the build spec (4 products, default settings) and,
// in development only, a dev owner account so a fresh clone can sign in
// right away. Run with: pnpm db:seed — safe to re-run (skips what's already there).
// Stripe ids stay empty until the Stripe catalog is created.
// Production admin accounts are never seeded: use `pnpm auth:create-owner` instead.
import { eq } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

// Overridable so a teammate can pick their own dev login; same fixed
// defaults otherwise so the printed credentials below stay accurate.
const SEED_OWNER = {
	name: process.env.SEED_OWNER_NAME ?? "Dev Owner",
	email: process.env.SEED_OWNER_EMAIL ?? "owner@parentkeeping.test",
	password: process.env.SEED_OWNER_PASSWORD ?? "dev-password-123",
};

/**
 * Dev-only admin login, so a fresh clone can sign in without the interactive
 * `auth:create-owner` prompt. Never runs in production, and never overwrites
 * a real owner account that already exists.
 */
async function seedOwner() {
	if (process.env.NODE_ENV === "production") return;

	const [existing] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.role, "owner"))
		.limit(1);
	if (existing) {
		console.log("An owner account already exists — nothing to do.");
		return;
	}

	await auth.api.createUser({ body: { ...SEED_OWNER, role: "owner", data: {} } });
	console.log(
		`\nDev owner created. Sign in at /admin/login with:\n  ${SEED_OWNER.email}\n  ${SEED_OWNER.password}`,
	);
}

async function main() {
	await seedOwner();
}

main()
	.catch((err: unknown) => {
		console.error(err);
		process.exitCode = 1;
	})
	.finally(() => db.$client.end());
