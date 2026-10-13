import type { Metadata } from "next";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { getLiveView } from "@/server/queries/analytics";
import { LiveView } from "./_components/live-view";

export const metadata: Metadata = { title: "Live View" };
export const dynamic = "force-dynamic";

export default async function LiveViewPage() {
	const { user } = await requireStaffPage({ analytics: ["read"] });
	const initial = await getLiveView({ withSales: hasPermission(user.role, { finance: ["read"] }) });
	return <LiveView initial={initial} />;
}
