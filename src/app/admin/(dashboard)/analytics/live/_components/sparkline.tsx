"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

/**
 * Today so far, hour by hour (stops at the current hour). "card" is the Live
 * View size; "inline" is the small dash next to a number (Overview strip).
 */
export function Sparkline({ values, currentHour, size = "card" }: { values: number[]; currentHour: number; size?: "card" | "inline" }) {
	// Each chart needs its own gradient id: several share a page.
	const gradient = `spark-${useId().replace(/:/g, "")}`;
	const data = values.slice(0, currentHour + 1).map((v, h) => ({ h, v }));
	return (
		<div className={cn("shrink-0", size === "card" ? "h-9 w-24" : "h-5 w-14")} aria-hidden>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
					<defs>
						<linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="var(--primary)" stopOpacity={size === "card" ? 0.25 : 0.15} />
							<stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
						</linearGradient>
					</defs>
					<Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={1.5} fill={`url(#${gradient})`} isAnimationActive={false} />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
