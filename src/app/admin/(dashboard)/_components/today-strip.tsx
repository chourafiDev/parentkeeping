"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RangeId } from "@/lib/analytics-ranges";
import { api } from "@/lib/api-client";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { OverviewStats } from "@/server/queries/analytics";
import { LiveGlobe } from "../analytics/live/_components/live-globe";
import { RangePicker } from "../analytics/live/_components/range-picker";
import { Sparkline } from "../analytics/live/_components/sparkline";

const POLL_MS = 15_000;
const percent = (orders: number, sessions: number) => (sessions > 0 ? (orders / sessions) * 100 : null);

function Stat({ label, value, spark }: { label: string; value: React.ReactNode; spark: number[] }) {
	return (
		<div className="grid gap-1">
			<span className="text-muted-foreground decoration-muted-foreground/50 text-sm underline decoration-dotted underline-offset-4">{label}</span>
			<span className="flex items-center gap-2.5">
				<span className="text-base font-semibold tabular-nums">{value}</span>
				<Sparkline values={spark} currentHour={spark.length - 1} size="inline" />
			</span>
		</div>
	);
}

/**
 * Shopify's strip on the Overview: sessions, sales, orders and conversion
 * rate for a date range (US Eastern days), plus live visitors right now and
 * the Live View globe faintly behind. Refreshes every 15 seconds.
 */
export function TodayStrip({ initial }: { initial: OverviewStats }) {
	const [range, setRange] = useState<RangeId>(initial.range);
	const [data, setData] = useState(initial);
	const [loading, setLoading] = useState(false);
	const [stale, setStale] = useState(false);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			if (document.visibilityState !== "visible") return;
			const res = await api.api.admin.analytics.overview.$get({ query: { range } }).catch(() => null);
			if (cancelled) return;
			if (res?.ok) {
				setData(await res.json());
				setStale(false);
			} else setStale(true);
			setLoading(false);
		}
		// The first render already has today's numbers from the server.
		if (range !== data.range) void load();
		const timer = setInterval(load, POLL_MS);
		document.addEventListener("visibilitychange", load);
		return () => {
			cancelled = true;
			clearInterval(timer);
			document.removeEventListener("visibilitychange", load);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on range change only
	}, [range]);

	const { series } = data;
	const conversion = percent(data.orders, data.sessions);
	const conversionSeries = series.sessions.map((s, i) => percent(series.orders[i], s) ?? 0);

	return (
		<section className="bg-card relative isolate mb-3 min-h-[150px] overflow-hidden rounded-xl border p-5">
			{/* The Live View globe, faded into the card's right edge. */}
			<div
				aria-hidden
				className="absolute -top-10 -right-12 -z-10 w-[380px] opacity-70 [mask-image:linear-gradient(to_right,transparent,black_40%)] max-md:hidden"
			>
				<LiveGlobe markers={data.markers} decorative />
			</div>

			<div className="flex flex-wrap items-start gap-x-10 gap-y-5 md:pe-[260px]">
				<div className="w-full lg:w-auto lg:min-w-40">
					<RangePicker
						value={range}
						onChange={(next) => {
							setLoading(true);
							setRange(next);
						}}
					/>
				</div>

				<div className={cn("grid grid-cols-2 gap-x-10 gap-y-5 transition-opacity sm:flex sm:flex-wrap", loading && "opacity-50")} aria-busy={loading}>
					<Stat label="Sessions" value={data.sessions} spark={series.sessions} />
					{data.sales !== null && series.sales && <Stat label="Total sales" value={formatUsd(data.sales)} spark={series.sales} />}
					<Stat label="Orders" value={data.orders} spark={series.orders} />
					<Stat
						label="Conversion rate"
						value={conversion === null ? "—" : `${conversion.toFixed(conversion < 10 ? 1 : 0)}%`}
						spark={conversionSeries}
					/>
				</div>
			</div>

			<Link
				href="/admin/analytics/live"
				className="text-foreground mt-5 flex w-fit items-center gap-2 text-sm hover:underline md:absolute md:top-5 md:right-5 md:mt-0"
			>
				Live visitors
				<span className="font-semibold tabular-nums">{data.visitorsNow}</span>
				<span className={cn("relative flex size-2.5", stale && "opacity-40")}>
					{!stale && data.visitorsNow > 0 && <span className="bg-green absolute inline-flex size-full animate-ping rounded-full opacity-60" />}
					<span className="border-green relative inline-flex size-2.5 rounded-full border-2" />
				</span>
			</Link>
		</section>
	);
}
