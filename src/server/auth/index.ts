import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { SITE } from "@/lib/site";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { resetPasswordEmail } from "@/server/emails/templates";
import { sendEmail } from "@/server/lib/email";
import { ac, roles } from "./permissions";

// Admin/team authentication only — buyers check out as guests on Stripe.
export const auth = betterAuth({
  appName: SITE.name,
  database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // team accounts are created by the owner only
    minPasswordLength: 10,
    // "Forgot password?" → email with a 1-hour link to /admin/reset-password.
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: { email: user.email, name: user.name }, ...resetPasswordEmail({ name: user.name, url }) });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day while active
  },
  rateLimit: {
    enabled: true,
    storage: "database", // shared across serverless instances
    customRules: {
      "/sign-in/email": { window: 60, max: 5 }, // brute-force protection
      "/request-password-reset": { window: 300, max: 3 }, // no email flooding
    },
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "owner", // single-owner store
      adminRoles: ["owner"],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
