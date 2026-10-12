// The store runs on US Eastern time: dates like "founding price until Oct 31"
// end at 11:59:59 PM in New York, whatever the server's time zone.

export const STORE_TIME_ZONE = "America/New_York";

/** Wall-clock parts of `date` in a time zone. */
function partsIn(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour"), min: get("minute"), s: get("second") };
}

/** "2026-10-31" → the instant 2026-10-31 23:59:59 in the store's time zone. */
export function endOfStoreDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 23, 59, 59);
  const p = partsIn(new Date(guess), STORE_TIME_ZONE);
  const offset = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - guess; // zone − UTC
  return new Date(guess - offset);
}

/** An instant → its "yyyy-MM-dd" date in the store's time zone. */
export function storeDate(date: Date): string {
  const p = partsIn(date, STORE_TIME_ZONE);
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}
