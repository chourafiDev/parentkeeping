"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SITE } from "@/lib/site";
import { hasPermission } from "@/server/auth/permissions";
import { findNavItem, navGroups } from "./nav";

export function AppSidebar({ role }: { role?: string | null }) {
	const pathname = usePathname();
	const active = findNavItem(pathname);

	const groups = navGroups
		.map((group) => ({
			...group,
			items: group.items.filter(
				(item) => !item.permission || hasPermission(role, item.permission),
			),
		}))
		.filter((group) => group.items.length > 0);

	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/admin" aria-label={`${SITE.name} — overview`}>
								<div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
									{SITE.name.charAt(0)}
								</div>
								<span className="truncate font-semibold">{SITE.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{groups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarMenu>
							{group.items.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={active?.href === item.href}
										tooltip={item.title}
									>
										<Link href={item.href}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>
		</Sidebar>
	);
}
