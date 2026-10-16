import type { IconType } from "react-icons";
// Heroicons v2, solid style (react-icons "Hi*"; outline versions are "HiOutline*").
import {
  HiCog6Tooth,
  HiGlobeAmericas,
  HiCube,
  HiEnvelope,
  HiShoppingCart,
  HiSquares2X2,
  HiStar,
  HiUserCircle,
} from "react-icons/hi2";
import type { Permissions } from "@/server/auth/permissions";

export type NavItem = {
  title: string;
  href: string;
  icon: IconType;
  /** Hidden from roles that lack this permission. */
  permission?: Permissions;
};

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Store",
    items: [
      { title: "Overview", href: "/admin", icon: HiSquares2X2 },
      {
        title: "Orders",
        href: "/admin/orders",
        icon: HiShoppingCart,
        permission: { order: ["read"] },
      },
      {
        title: "Products",
        href: "/admin/products",
        icon: HiCube,
        permission: { product: ["read"] },
      },
      {
        title: "Reviews",
        href: "/admin/reviews",
        icon: HiStar,
        permission: { review: ["read"] },
      },
      {
        title: "Subscribers",
        href: "/admin/subscribers",
        icon: HiEnvelope,
        permission: { subscriber: ["read"] },
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        title: "Live View",
        href: "/admin/analytics/live",
        icon: HiGlobeAmericas,
        permission: { analytics: ["read"] },
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Account",
        href: "/admin/account",
        icon: HiUserCircle,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: HiCog6Tooth,
        permission: { settings: ["read"] },
      },
    ],
  },
];

export const allNavItems = navGroups.flatMap((g) => g.items);

/** The nav item matching the current path (longest href wins). */
export function findNavItem(pathname: string) {
  return allNavItems
    .filter((i) =>
      i.href === "/admin"
        ? pathname === "/admin"
        : pathname === i.href || pathname.startsWith(`${i.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}
