// Roles & permissions for the admin. Shared by the server and the auth client,
// so keep this file free of secrets and server-only imports.
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statements = {
  ...defaultStatements, // user + session management (team accounts)
  product: ["create", "read", "update", "delete"], // includes product files & pre-sale dates
  order: ["read", "update", "refund"], // update = resend email, reissue download link
  subscriber: ["read", "export", "delete"], // delete = privacy erasure requests
  settings: ["read", "update"],
  finance: ["read"], // revenue figures
} as const;

export const ac = createAccessControl(statements);

// Store owner: everything.
export const owner = ac.newRole({
  ...adminAc.statements,
  product: ["create", "read", "update", "delete"],
  order: ["read", "update", "refund"],
  subscriber: ["read", "export", "delete"],
  settings: ["read", "update"],
  finance: ["read"],
});

// One account: the store owner. The permission checks stay in place (they
// always pass for the owner) in case a second account is ever needed.
export const roles = { owner };

export type Role = keyof typeof roles;
export type Permissions = {
  [K in keyof typeof statements]?: (typeof statements)[K][number][];
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && value in roles;
}

/** True if any of the user's roles (comma-separated) grants all `permissions`. */
export function hasPermission(
  role: string | null | undefined,
  permissions: Permissions,
): boolean {
  if (!role) return false;
  return role
    .split(",")
    .some(
      (r) =>
        isRole(r) &&
        roles[r].authorize(permissions as Record<string, string[]>).success,
    );
}
