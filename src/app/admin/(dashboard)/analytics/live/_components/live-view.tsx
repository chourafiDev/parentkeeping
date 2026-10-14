"use client";

import { useEffect, useState } from "react";
import { LuInfo } from "react-icons/lu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { LiveView as LiveData } from "@/server/queries/analytics";
import { type RangeId, rangeById } from "@/lib/analytics-ranges";
import { LiveGlobe } from "./live-globe";
import { RangePicker } from "./range-picker";
import { Sparkline } from "./sparkline";
import { useLiveData } from "./use-live-data";

function Hint({ text }: { text: string }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button type="button" aria-label={text} className="text-muted-foreground hover:text-foreground">
					<LuInfo className="size-3.5" />
				</button>
			</TooltipTrigger>
			<TooltipContent className="max-w-60">{text}</TooltipContent>
		</Tooltip>
	);
}

/** Card title with Shopify's dotted underline (the hint is in the tooltip). */
function Title({ children, hint }: { children: React.ReactNode; hint?: string }) {
	return (
		<div className="flex items-center justify-between gap-2">
			<h2 className="decoration-muted-foreground/60 text-sm font-semibold underline decoration-dotted underline-offset-4">{children}</h2>
			{hint && <Hint text={hint} />}
		</div>
	);
}

function Metric({ title, value, hint, spark }: { title: string; value: React.ReactNode; hint?: string; spark?: number[] }) {
	return (
		<div className="bg-card grid gap-2 rounded-xl border p-4">
			<Title hint={hint}>{title}</Title>
			<div className="flex items-end justify-between gap-3">
				<p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
				{spark && <Sparkline values={spark} currentHour={spark.length - 1} />}
			</div>
		</div>
	);
}

/** Horizontal bar list (sessions by location, new vs returning, top products). */
function Bars({ rows, empty }: { rows: { label: string; value: number }[]; empty: string }) {
	const max = Math.max(1, ...rows.map((r) => r.value));
	if (rows.every((r) => r.value === 0)) return <p className="text-muted-foreground py-6 text-center text-sm">{empty}</p>;
	return (
		<ul className="grid gap-3">
			{rows.map((r) => (
				<li key={r.label} className="grid gap-1.5">
					<span className="text-muted-foreground truncate text-xs">{r.label}</span>
					<span className="flex items-center gap-3">
						<span className="bg-muted h-6 flex-1 overflow-hidden rounded-md">
							<span className="bg-primary/80 block h-full rounded-md transition-[width] duration-500" style={{ width: `${(r.value / max) * 100}%` }} />
						</span>
						<span className="w-8 text-right text-sm font-medium tabular-nums">{r.value}</span>
					</span>
				</li>
			))}
		</ul>
	);
}

function useAgo(iso: string) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const t = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(t);
	}, []);
	const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
	return s < 5 ? "Just now" : s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago`;
}

/**
 * Shopify-style Live View: what's happening on the store right now and
 * today (US Eastern), refreshed every 10 seconds while the tab is open.
 */
/** "today", "yesterday", "in the last 7 days"… for hints and empty states. */
function period(range: RangeId) {
	return range === "today" || range === "yesterday" ? range : `in the ${rangeById(range).label.toLowerCase()}`;
}

export function LiveView({ initial }: { initial: LiveData }) {
	const { data, range, setRange, stale, loading } = useLiveData(initial);
	const ago = useAgo(data.at);
	const when = period(range);

	const { behavior, customers, series } = data;
	const visitors = data.markers.filter((m) => m.kind === "visitor").length;
	const orders = data.markers.length - visitors;

	function changeRange(next: RangeId) {
		setRange(next);
		// Keep the range in the URL, so a refresh or a shared link shows the same view.
		window.history.replaceState(null, "", next === "today" ? window.location.pathname : `?range=${next}`);
	}

	return (
		<div className="grid gap-4">
			<div className="flex flex-wrap items-center gap-3">
				<h1 className="text-lg font-semibold">Live View</h1>
				<span className="text-muted-foreground flex items-center gap-1.5 text-sm">
					<span className={cn("relative flex size-2", stale && "opacity-40")}>
						{!stale && <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-60" />}
						<span className="bg-primary relative inline-flex size-2 rounded-full" />
					</span>
					{stale ? "Reconnecting…" : ago}
				</span>
				<div className="ms-auto">
					<RangePicker value={range} onChange={changeRange} />
				</div>
			</div>

			<div className={cn("grid gap-4 transition-opacity xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:items-start", loading && "opacity-60")} aria-busy={loading}>
				<div className="grid gap-3">
					<div className="grid gap-3 sm:grid-cols-2">
						<Metric title="Visitors right now" value={data.visitorsNow} hint="Visits active on the store in the last 5 minutes, whatever the date range." />
						{data.sales !== null && (
							<Metric
								title="Total sales"
								value={formatUsd(data.sales)}
								hint={`Paid orders ${when} (US Eastern), minus refunds. Includes sales tax.`}
								spark={series.sales ?? undefined}
							/>
						)}
						<Metric
							title="Sessions"
							value={data.sessions}
							hint={`Visits that started ${when} (US Eastern). One visit = one browser tab.`}
							spark={series.sessions}
						/>
						<Metric title="Orders" value={data.orders} hint={`Paid orders ${when} (US Eastern).`} spark={series.orders} />
					</div>

					<div className="bg-card grid gap-4 rounded-xl border p-4">
						<Title hint="What visitors did in the last 10 minutes, whatever the date range. There's no cart: Buy buttons go straight to Stripe Checkout.">
							Customer behavior
						</Title>
						<dl className="grid grid-cols-3 divide-x">
							{[
								{ label: "Viewing products", value: behavior.viewingProducts },
								{ label: "Checking out", value: behavior.checkingOut },
								{ label: "Purchased", value: behavior.purchased },
							].map((b, i) => (
								<div key={b.label} className={cn("grid gap-1", i > 0 && "ps-4")}>
									<dt className="text-muted-foreground text-xs">{b.label}</dt>
									<dd className="text-xl font-semibold tabular-nums">{b.value}</dd>
								</div>
							))}
						</dl>
					</div>

					<div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
						<div className="bg-card grid content-start gap-4 rounded-xl border p-4">
							<Title hint={`Where visits ${when} came from, by country, region and city.`}>Sessions by location</Title>
							<Bars rows={data.locations.map((l) => ({ label: l.label, value: l.sessions }))} empty={range === "today" ? "No sessions yet today" : `No sessions ${when}`} />
						</div>
						<div className="bg-card grid content-start gap-4 rounded-xl border p-4">
							<Title hint={`Orders ${when}: a first purchase, or a buyer who paid before.`}>New vs returning customers</Title>
							<Bars
								rows={[
									{ label: "New", value: customers.new },
									{ label: "Returning", value: customers.returning },
								]}
								empty={range === "today" ? "No orders yet today" : `No orders ${when}`}
							/>
						</div>
					</div>

					<div className="bg-card grid content-start gap-4 rounded-xl border p-4">
						<Title hint={`Products in paid orders ${when}.`}>Top products</Title>
						<Bars rows={data.topProducts.map((p) => ({ label: p.title, value: p.orders }))} empty={range === "today" ? "No orders yet today" : `No orders ${when}`} />
					</div>
				</div>

				<div className="bg-card grid gap-3 rounded-xl border p-4 xl:sticky xl:top-20">
					<div className="mx-auto w-full max-w-[640px]">
						<LiveGlobe markers={data.markers} />
					</div>
					<div className="text-muted-foreground flex flex-wrap items-center justify-end gap-4 text-xs">
						<span className="flex items-center gap-1.5">
							<span className="size-2.5 rounded-full bg-[#6c4cf1]" />
							Orders {when} · {orders}
						</span>
						<span className="flex items-center gap-1.5">
							<span className="bg-primary size-2.5 rounded-full" />
							Visitors right now · {visitors}
						</span>
					</div>
					{data.visitorsNow > visitors && (
						<p className="text-muted-foreground text-right text-[11px]">
							{data.visitorsNow - visitors} visitor{data.visitorsNow - visitors === 1 ? "" : "s"} without a known location (e.g. local development)
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
