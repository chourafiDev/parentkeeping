import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SITE } from "@/lib/site";
import { requireStaffPage } from "@/server/auth/session";
import { AppSidebar } from "./_components/app-sidebar";
import { ExcludeFromAnalytics } from "./_components/exclude-from-analytics";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";

export const metadata: Metadata = {
  title: { template: `%s · ${SITE.adminName}`, default: SITE.adminName },
  robots: { index: false },
};

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const { user } = await requireStaffPage();
  // Remember whether the sidebar was collapsed (cookie set by the sidebar).
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <ExcludeFromAnalytics />
      <AppSidebar role={user.role} />
      {/* min-w-0 lets wide content (tables) scroll inside instead of widening the page */}
      {/* Inset panel: fixed frame on desktop, the page scrolls inside it. */}
      <SidebarInset className="min-w-0 md:h-[calc(100svh-1rem)] md:overflow-y-auto md:border md:border-black/5">
        <SiteHeader user={{ name: user.name, email: user.email, role: user.role }} />
        <div className="flex min-w-0 flex-1 flex-col p-4">{children}</div>
        <SiteFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
