"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { findNavItem } from "./nav";
import { type SessionUser, UserMenu } from "./user-menu";

export function SiteHeader({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const title = findNavItem(pathname)?.title ?? "Overview";

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:rounded-t-xl">
      <SidebarTrigger className="-ms-1" />
      <Separator
        orientation="vertical"
        className="me-2 my-auto data-[orientation=vertical]:h-6"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ms-auto flex flex-1 items-center justify-end gap-3">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
