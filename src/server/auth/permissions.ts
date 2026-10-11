// Roles & permissions for the admin. Shared by the server and the auth client,
// so keep this file free of secrets and server-only imports.
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statements = {
  ...defaultStatements, // user + session management (team accounts)
  product: ["create", "read", "update", "delete"], // includes product files & pre-sale dates
  order: ["read", "update", "refund"], // update = resend email, reissue download link
  subscriber: ["read", "export"],
  settings: ["read", "update"],
  finance: ["read"], // revenue figures
} as const;

export const ac = createAccessControl(statements);

// Store owner: everything, including team accounts and settings.
export const owner = ac.newRole({
  ...adminAc.statements,
  product: ["create", "read", "update", "delete"],
  order: ["read", "update", "refund"],
  subscriber: ["read", "export"],
  settings: ["read", "update"],
  finance: ["read"],
});

// Support: answers buyers (resends links, looks up orders), no money or settings.
export const support = ac.newRole({
  product: ["read"],
  order: ["read", "update"],
  subscriber: ["read"],
});

export const roles = { owner, support };

export type Role = keyof typeof roles;
export type Permissions = {
  [K in keyof typeof statements]?: (typeof statements)[K][number][];
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  support: "Support",
};

/** What each role can do (shown when inviting / changing a member's role). */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Full access: products, orders, refunds, subscribers, settings and the team.",
  support: "Looks up orders and subscribers, resends download links. No refunds, revenue or settings.",
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
