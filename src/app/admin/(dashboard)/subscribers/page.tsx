import type { Metadata } from "next";
import { HiEnvelope } from "react-icons/hi2";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import {
	getSubscriberFacets,
	getSubscribersList,
	getSubscriberStats,
	getSubscriberTabCounts,
} from "@/server/queries/subscribers";
import { ListHeader } from "../_components/shared/list-header";
import { ListTransitionProvider } from "../_components/shared/list-transition";
import { SubscriberStats } from "./_components/subscriber-stats";
import { SubscribersList } from "./_components/subscribers-list";
import { subscribersSearchParamsCache } from "./_lib/search-params";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage({ searchParams }: PageProps<"/admin/subscribers">) {
	const { user } = await requireStaffPage({ subscriber: ["read"] });
	const { status, q, source, country, page } = subscribersSearchParamsCache.parse(await searchParams);
	const filters = { q, source, country };

	const [{ rows, total, pageCount }, counts, facets, stats] = await Promise.all([
		getSubscribersList({ tab: status, ...filters }, Math.max(1, page)),
		getSubscriberTabCounts(filters),
		getSubscriberFacets(),
		getSubscriberStats(),
	]);

	return (
		<ListTransitionProvider>
			<ListHeader icon={<HiEnvelope />} total={stats.total} label={{ singular: "Subscriber", plural: "Subscribers" }} />
			<SubscriberStats stats={stats} />
			<SubscribersList
				rows={rows}
				counts={counts}
				total={total}
				pageCount={pageCount}
				facets={facets}
				canExport={hasPermission(user.role, { subscriber: ["export"] })}
				canDelete={hasPermission(user.role, { subscriber: ["delete"] })}
			/>
		</ListTransitionProvider>
	);
}
