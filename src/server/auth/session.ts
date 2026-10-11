import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from ".";
import { hasPermission, isRole, type Permissions } from "./permissions";

/** Current staff session, or null (no session, not staff, or banned). */
export async function getStaffSession() {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  const isStaff = (result.user.role ?? "").split(",").some(isRole);
  if (!isStaff || result.user.banned) return null;
  return result;
}

/** For admin pages: redirects to the login page when not signed in as staff. */
export async function requireStaffPage(permissions?: Permissions) {
  const result = await getStaffSession();
  if (!result) redirect("/admin/login");
  if (permissions && !hasPermission(result.user.role, permissions)) {
    redirect("/admin");
  }
  return result;
}
