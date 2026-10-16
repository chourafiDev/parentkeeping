// Social proof from real data only (copy rule + FTC): every number here is
// computed from orders and reviews, rounded so it never overstates,
// and stays hidden until there's enough data to mean something.

/** Star rating summary next to the title: hidden below this many published reviews. */
export const MIN_REVIEWS_FOR_SUMMARY = 3;
/** "Bought by N+ families": hidden below this many buyers. */
export const MIN_FAMILIES = 100;
/** Refund rate: hidden until this many orders have passed their 14-day window. */
export const MIN_ORDERS_FOR_REFUND_RATE = 50;
/** Days after purchase before the one review request goes out (after the guarantee window). */
export const REVIEW_REQUEST_AFTER_DAYS = 15;
/** Orders older than this never get a request (too late to ask). */
export const REVIEW_REQUEST_MAX_DAYS = 60;

/** 137 → "130+", 1,284 → "1,200+": always rounded down. */
export function familiesLabel(count: number) {
  const step = count >= 1000 ? 100 : 10;
  return `${(Math.floor(count / step) * step).toLocaleString("en-US")}+`;
}

/** 0.013 → "under 2%": the next whole percent up, so it's never understated. */
export function refundRateLabel(rate: number) {
  return `under ${Math.floor(rate * 100) + 1}%`;
}

/** 4.666 → "4.7". */
export const averageLabel = (avg: number) => (Math.round(avg * 10) / 10).toFixed(1);
