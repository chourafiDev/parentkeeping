"use client";

import { ChevronDown, CircleUser, ExternalLink, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { hasPermission } from "@/server/auth/permissions";

export type SessionUser = { name: string; email: string; role?: string | null };

function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]!.toUpperCase())
		.join("");
}

/** Avatar + name in the header, with the account menu. */
export function UserMenu({ user }: { user: SessionUser }) {
	const router = useRouter();

	async function signOut() {
		await authClient.signOut();
		router.replace("/admin/login");
		router.refresh();
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="hover:bg-muted data-[state=open]:bg-muted flex items-center gap-2 rounded-lg p-1 pe-2 transition-colors"
				>
					<Avatar className="size-8 rounded-lg">
						<AvatarFallback className="bg-primary text-primary-foreground rounded-lg text-xs font-semibold">
							{initials(user.name)}
						</AvatarFallback>
					</Avatar>
					<span className="hidden text-start leading-tight md:grid">
						<span className="max-w-36 truncate text-sm font-medium">{user.name}</span>
						<span className="text-muted-foreground max-w-36 truncate text-xs">
							{user.email}
						</span>
					</span>
					<ChevronDown className="text-muted-foreground size-4" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" sideOffset={6} className="min-w-72 rounded-lg">
				<DropdownMenuLabel className="font-normal">
					<div className="grid text-sm leading-tight">
						<span className="truncate font-medium">{user.name}</span>
						<span className="text-muted-foreground truncate text-xs">{user.email}</span>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{hasPermission(user.role, { settings: ["read"] }) && (
						<DropdownMenuItem asChild>
							<Link href="/admin/settings">
								<Settings />
								Settings
							</Link>
						</DropdownMenuItem>
					)}
					<DropdownMenuItem asChild>
						<Link href="/admin/account">
							<CircleUser />
							Account
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<a href="/" target="_blank" rel="noreferrer">
							<ExternalLink />
							View store
						</a>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onSelect={signOut}>
					<LogOut />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
