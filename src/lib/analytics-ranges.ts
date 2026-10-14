// Date ranges for the Overview strip. Days run on store time (US Eastern).

export const RANGES = [
  { id: "today", label: "Today", days: 1, offset: 0 },
  { id: "yesterday", label: "Yesterday", days: 1, offset: 1 },
  { id: "7d", label: "Last 7 days", days: 7, offset: 0 },
  { id: "30d", label: "Last 30 days", days: 30, offset: 0 },
  { id: "90d", label: "Last 90 days", days: 90, offset: 0 },
] as const;

export type RangeId = (typeof RANGES)[number]["id"];
export const RANGE_IDS = RANGES.map((r) => r.id) as [RangeId, ...RangeId[]];
export const rangeById = (id: RangeId) => RANGES.find((r) => r.id === id)!;
