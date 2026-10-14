import type { Metadata } from "next";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { RANGE_IDS, type RangeId } from "@/lib/analytics-ranges";
import { getLiveView } from "@/server/queries/analytics";
import { LiveView } from "./_components/live-view";

export const metadata: Metadata = { title: "Live View" };
export const dynamic = "force-dynamic";

export default async function LiveViewPage({ searchParams }: PageProps<"/admin/analytics/live">) {
	const { user } = await requireStaffPage({ analytics: ["read"] });
	const requested = (await searchParams).range;
	const range: RangeId = RANGE_IDS.includes(requested as RangeId) ? (requested as RangeId) : "today";
	const initial = await getLiveView({ range, withSales: hasPermission(user.role, { finance: ["read"] }) });
	return <LiveView initial={initial} />;
}
