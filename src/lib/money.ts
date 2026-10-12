// Money is stored in cents (integers), as Stripe sends it. Format for display only.
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** 2900 → "$29.00" */
export function formatPrice(cents: number) {
  return usd.format(cents / 100);
}

const usdRounded = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** 124850 → "$1,249" (no cents, for totals and charts). */
export function formatUsd(cents: number) {
  return usdRounded.format(Math.round(cents / 100));
}

/** Store pages: 3900 → "$39", 1950 → "$19.50" (no ".00" on whole dollars). */
export function formatStorePrice(cents: number) {
  return cents % 100 === 0 ? usdRounded.format(cents / 100) : formatPrice(cents);
}
