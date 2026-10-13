"use client";

import Image from "next/image";
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
								<Image
									src="/logo.svg"
									alt={SITE.name}
									width={100}
									height={40}
									className="object-cover"
								/>
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
