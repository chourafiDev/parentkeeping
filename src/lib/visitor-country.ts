// The visitor's country, set as a cookie by the proxy (from Vercel's edge
// header) so shared pages can stay cached and read it in the browser instead.
// Display only: the subscribe API re-checks the country on the server.

import { OPT_IN_COUNTRIES } from "./free-list";

export const COUNTRY_COOKIE = "pk_country";

/** Two-letter country from the cookie; null when there's no cookie (or on the server). */
export function readCountryCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COUNTRY_COOKIE}=([A-Z]{2})(?:;|$)`));
  return match ? match[1] : null;
}

/** EU/EEA/UK/Switzerland: newsletter needs the unticked box (same rule as the server). */
export const isOptInCountry = (country: string | null) => !!country && OPT_IN_COUNTRIES.has(country);
