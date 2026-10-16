import type { Metadata } from "next";
import Link from "next/link";
import { HiStar } from "react-icons/hi2";
import { hasPermission } from "@/server/auth/permissions";
import { requireStaffPage } from "@/server/auth/session";
import { type AdminReviewTab, getAdminReviews } from "@/server/queries/reviews";
import { cn } from "@/lib/utils";
import { ListHeader } from "../_components/shared/list-header";
import { ListTransitionProvider } from "../_components/shared/list-transition";
import { ReviewCardAdmin } from "./_components/review-card";

export const metadata: Metadata = { title: "Reviews" };

const TABS: { id: AdminReviewTab; label: string }[] = [
	{ id: "pending", label: "To review" },
	{ id: "published", label: "Published" },
	{ id: "hidden", label: "Hidden" },
];

export default async function ReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
	const { user } = await requireStaffPage({ review: ["read"] });
	const { tab: raw } = await searchParams;
	const tab = TABS.some((t) => t.id === raw) ? (raw as AdminReviewTab) : "pending";
	const { rows, counts } = await getAdminReviews(tab);
	const canEdit = hasPermission(user.role, { review: ["update"] });

	return (
		<ListTransitionProvider>
			<ListHeader icon={<HiStar />} total={counts[tab]} label={{ singular: "Review", plural: "Reviews" }} />

			<div className="bg-muted/60 mb-4 rounded-lg p-3 text-xs leading-relaxed">
				Buyers write these from the one email sent 15 days after purchase, so every review is a verified purchase. Publish
				them whether they&apos;re good or bad. Hide one only for spam, offensive language, private information, if it isn&apos;t about
				the product, or if the buyer asks: hiding reviews because they&apos;re negative is illegal under the FTC&apos;s 2024 rule on
				reviews.
			</div>

			<nav className="mb-4 flex gap-1 border-b" aria-label="Review status">
				{TABS.map((t) => (
					<Link
						key={t.id}
						href={t.id === "pending" ? "/admin/reviews" : `/admin/reviews?tab=${t.id}`}
						className={cn(
							"-mb-px border-b-2 px-3 py-2 text-sm",
							t.id === tab ? "border-primary text-foreground font-medium" : "text-muted-foreground hover:text-foreground border-transparent",
						)}
					>
						{t.label} <span className="tabular-nums">({counts[t.id]})</span>
					</Link>
				))}
			</nav>

			{rows.length === 0 ? (
				<p className="text-muted-foreground py-16 text-center text-sm">
					{tab === "pending" ? "No reviews waiting. They'll arrive here as buyers write them." : "Nothing here yet."}
				</p>
			) : (
				<ul className="grid gap-3">
					{rows.map((r) => (
						<ReviewCardAdmin
							key={r.id}
							review={{ ...r, createdAt: r.createdAt.toISOString(), publishedAt: r.publishedAt?.toISOString() ?? null }}
							canEdit={canEdit}
						/>
					))}
				</ul>
			)}
		</ListTransitionProvider>
	);
}
