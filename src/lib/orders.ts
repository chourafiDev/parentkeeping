// Order labels and rules shared by the admin and the buyer pages.

export type OrderStatus = "paid" | "refunded" | "flagged_non_us";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Paid",
  refunded: "Refunded",
  flagged_non_us: "Non-US",
};

export const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  paid: "border-transparent bg-[color-mix(in_oklab,var(--success)_14%,white)] text-[color-mix(in_oklab,var(--success)_70%,black)]",
  refunded: "border-transparent bg-secondary text-muted-foreground",
  flagged_non_us: "border-transparent bg-amber-50 text-amber-800",
};

/** Downloads allowed per file per order (support can reset the count). */
export const DOWNLOAD_LIMIT = 20;

/** 1001 → "#1001" */
export const formatOrderNumber = (n: number) => `#${n}`;

/** ISO country code → name, e.g. "US" → "United States". */
export function countryName(code: string | null) {
  if (!code) return "—";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
