// Where paid checkout is open. Shared by the checkout service, the Stripe
// webhook and every storefront component that shows or hides the Buy
// button, so they can never disagree with each other.

/**
 * Stripe Managed Payments' blocked buyer countries (Stripe Docs, checked
 * 16 Oct 2026): Checkout itself declines these, but we check first so the
 * page can show a plain message instead of a Stripe error.
 */
export const MANAGED_PAYMENTS_BLOCKED_COUNTRIES = new Set(["CN", "CU", "IR", "KP", "RU", "SY"]);

/**
 * true once a visitor from `country` can complete checkout, given whether
 * worldwide selling is switched on (Settings → Checkout → Sell worldwide).
 * Off: US only, as before. On: everywhere except Stripe's blocked list.
 * `country` is null in development or when the edge can't tell (never
 * blocks on an unknown country — the real check happens again at checkout).
 */
export function canCheckout(country: string | null, worldwideEnabled: boolean) {
  if (!country) return true;
  return worldwideEnabled ? !MANAGED_PAYMENTS_BLOCKED_COUNTRIES.has(country) : country === "US";
}

/** What to show instead of the Buy button, for the rare visitor `canCheckout` says no to. */
export function buyGateCopy(worldwideEnabled: boolean) {
  return worldwideEnabled
    ? { heading: "Checkout isn't available in your country yet.", cta: "Get the free Medication List instead" }
    : { heading: "Available to US customers only for now.", cta: "Get the free Medication List while you wait" };
}
