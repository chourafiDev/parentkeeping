import { LuMailCheck, LuMailPlus, LuMailX, LuUsers } from "react-icons/lu";
import type { SubscriberStats as Stats } from "@/server/queries/subscribers";
import { FormCard } from "../../_components/shared/form-card";
import { KpiCard } from "../../_components/shared/kpi-card";
import { VARIANT_LABELS } from "../_lib/variants";

/** KPI row + the headline test split. */
export function SubscriberStats({ stats }: { stats: Stats }) {
	const tested = stats.variants.filter((v) => v.variant !== "none");
	const testedTotal = tested.reduce((n, v) => n + v.total, 0);

	return (
		<section className="mb-4 grid gap-3">
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<KpiCard icon={LuUsers} title="Sign-ups" value={stats.total.toLocaleString("en-US")} period="All time" hint="Everyone who asked for the free Medication List." />
				<KpiCard
					icon={LuMailPlus}
					title="New"
					value={stats.last30.toLocaleString("en-US")}
					change={stats.change}
					period="Last 30 days"
					hint="Sign-ups in the last 30 days, compared with the 30 days before."
				/>
				<KpiCard
					icon={LuMailCheck}
					title="Newsletter opt-in"
					value={stats.optInRate ?? "—"}
					suffix={stats.optInRate === null ? undefined : "%"}
					period="All time"
					hint="Share who agreed to the weekly emails. Outside the EU/UK the notice under the button counts as consent; EU/UK visitors tick a box."
				/>
				<KpiCard
					icon={LuMailX}
					title="Unsubscribed"
					value={stats.unsubscribed.toLocaleString("en-US")}
					period="All time"
					hint="Marked unsubscribed when the email tool reports it."
				/>
			</div>

			<FormCard title="Headline test · sign-ups by variant">
				{testedTotal === 0 ? (
					<p className="text-muted-foreground text-sm">
						No sign-ups with a headline variant yet. Once the free-list page runs the 50/50 test, the split appears here.
					</p>
				) : (
					<div className="grid gap-3">
						{tested
							.sort((a, b) => b.total - a.total)
							.map((v) => {
								const share = Math.round((v.total / testedTotal) * 100);
								return (
									<div key={v.variant} className="grid gap-1.5">
										<div className="flex items-baseline justify-between gap-2 text-sm">
											<span className="font-medium">{VARIANT_LABELS[v.variant] ?? v.variant}</span>
											<span className="text-muted-foreground tabular-nums">
												{v.total.toLocaleString("en-US")} sign-ups · {share}% · {v.last30} in 30 days
											</span>
										</div>
										<div className="bg-muted h-2 overflow-hidden rounded-full">
											<div className="bg-primary h-full rounded-full" style={{ width: `${share}%` }} />
										</div>
									</div>
								);
							})}
						<p className="text-muted-foreground text-xs">
							Traffic is split 50/50, so a variant well above 50% of sign-ups converts better. For the exact conversion
							rate, divide by each variant&apos;s visitors from analytics.
						</p>
					</div>
				)}
			</FormCard>
		</section>
	);
}
