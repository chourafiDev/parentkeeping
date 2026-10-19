// Free Medication List: the lead magnet (spec: "Free Medication List sign-up page").

export const FREE_LIST_SOURCE = "free-medication-list";
export const FREE_LIST_PATH = "/pages/free-medication-list";

/** Public, unlisted file URLs (it's free): shown only on the thank-you page and in the email. */
export const FREE_LIST_PDF = "/files/Parentkeeping-Free-Medication-List-and-Daily-Medication-Chart.pdf";
export const FREE_LIST_PDF_A4 = "/files/Parentkeeping-Free-Medication-List-and-Daily-Medication-Chart-A4.pdf";

// The real page copy (headline, subheads, "what's inside", article, FAQ) lives
// in lib/lead-magnets.ts (FREE_LIST) — that's what the page actually renders.

/** EU + EEA + UK + Switzerland: newsletter needs an explicit opt-in (unticked box). */
export const OPT_IN_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
]);
