"use client";

import { CalendarIcon, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RANGES, type RangeId, rangeById } from "@/lib/analytics-ranges";
import { cn } from "@/lib/utils";

/** Date-range menu (Today, Yesterday, Last 7 / 30 / 90 days) for the analytics views. */
export function RangePicker({ value, onChange }: { value: RangeId; onChange: (range: RangeId) => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-1.5">
					<CalendarIcon className="text-muted-foreground" />
					{rangeById(value).label}
					<ChevronDown className="text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-44">
				{RANGES.map((r) => (
					<DropdownMenuItem key={r.id} onSelect={() => r.id !== value && onChange(r.id)}>
						<Check className={cn("size-4", r.id === value ? "opacity-100" : "opacity-0")} />
						{r.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
