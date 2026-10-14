"use client";

import Link from "next/link";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { LiveView } from "@/server/queries/analytics";
import { LiveGlobe } from "../analytics/live/_components/live-globe";
import { Sparkline } from "../analytics/live/_components/sparkline";
import { useLiveData } from "../analytics/live/_components/use-live-data";

const percent = (orders: number, sessions: number) => (sessions > 0 ? (orders / sessions) * 100 : null);

function Stat({ label, value, spark, currentHour }: { label: string; value: React.ReactNode; spark: number[]; currentHour: number }) {
	return (
		<div className="grid gap-1">
			<span className="text-muted-foreground decoration-muted-foreground/50 text-sm underline decoration-dotted underline-offset-4">{label}</span>
			<span className="flex items-center gap-2.5">
				<span className="text-base font-semibold tabular-nums">{value}</span>
				<Sparkline values={spark} currentHour={currentHour} size="inline" />
			</span>
		</div>
	);
}

/**
 * Shopify's "Today" strip on the Overview: sessions, sales, orders and
 * conversion rate for today (US Eastern), live visitors, and the Live View
 * globe faintly behind. Refreshes every 15 seconds; clicking opens Live View.
 */
export function TodayStrip({ initial }: { initial: LiveView }) {
	const { data, stale } = useLiveData(initial, 15_000);
	const { currentHour } = data;
	const conversion = percent(data.ordersToday, data.sessionsToday);
	const conversionByHour = data.sessionsByHour.map((s, h) => percent(data.ordersByHour[h], s) ?? 0);

	return (
		<Link
			href="/admin/analytics/live"
			aria-label="Today's store activity — open Live View"
			className="bg-card hover:border-foreground/20 relative isolate mb-3 block min-h-[150px] overflow-hidden rounded-xl border p-5 transition-colors"
		>
			{/* The Live View globe, faded into the card's right edge. */}
			<div
				aria-hidden
				className="absolute -top-10 -right-12 -z-10 w-[380px] opacity-70 [mask-image:linear-gradient(to_right,transparent,black_40%)] max-md:hidden"
			>
				<LiveGlobe markers={data.markers} decorative />
			</div>

			<div className="flex flex-wrap items-start gap-x-10 gap-y-5 md:pe-[260px]">
				<p className="text-muted-foreground w-full text-sm lg:w-auto lg:min-w-40">Today · All channels</p>
				<div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:flex sm:flex-wrap">
					<Stat label="Sessions" value={data.sessionsToday} spark={data.sessionsByHour} currentHour={currentHour} />
					{data.salesToday !== null && data.salesByHour && (
						<Stat label="Total sales" value={formatUsd(data.salesToday)} spark={data.salesByHour} currentHour={currentHour} />
					)}
					<Stat label="Orders" value={data.ordersToday} spark={data.ordersByHour} currentHour={currentHour} />
					<Stat
						label="Conversion rate"
						value={conversion === null ? "—" : `${conversion.toFixed(conversion < 10 ? 1 : 0)}%`}
						spark={conversionByHour}
						currentHour={currentHour}
					/>
				</div>
			</div>

			<p className="text-foreground mt-5 flex items-center gap-2 text-sm md:absolute md:top-5 md:right-5 md:mt-0">
				Live visitors
				<span className="font-semibold tabular-nums">{data.visitorsNow}</span>
				<span className={cn("relative flex size-2.5", stale && "opacity-40")}>
					{!stale && data.visitorsNow > 0 && <span className="bg-green absolute inline-flex size-full animate-ping rounded-full opacity-60" />}
					<span className="border-green relative inline-flex size-2.5 rounded-full border-2" />
				</span>
			</p>
		</Link>
	);
}
