// Free Medication List: the lead magnet (spec: "Free Medication List sign-up page").

export const FREE_LIST_SOURCE = "free-medication-list";
export const FREE_LIST_PATH = "/pages/free-medication-list";

/** Public, unlisted file URL (it's free): shown only on the thank-you page and in the email. */
export const FREE_LIST_PDF = "/files/Parentkeeping-Free-Medication-List-and-Daily-Medication-Chart.pdf";

// Headline test: the H1 keeps the main keyword; the subhead carries the angle.
// Draft wording: final words come from the SEO/copy work.
export const FREE_LIST_HEADLINE = "Free Printable Medication List & Daily Medication Chart";
export const FREE_LIST_SUBHEADS: Record<"fairness" | "one_place", string> = {
  one_place: "Stop carrying your parent's care in your head. Every medication, dose and change, kept in one place.",
  fairness: "Stop carrying your parent's care in your head. Write it down once, so the whole family can share the load.",
};

/** What's inside the PDF (from the PDF itself). */
export const FREE_LIST_CONTENTS = [
  { title: "About Mom or Dad", text: "Allergies, conditions, doctors and pharmacy on one page." },
  { title: "Prescription Medication List", text: "Name, dose, when, what it's for, and who prescribed it." },
  { title: "Over-the-Counter & Supplements", text: "The pills and vitamins that are easy to forget." },
  { title: "Daily Medication Chart", text: "Tick off morning, midday, evening and bedtime doses." },
  { title: "Medication Changes Log", text: "What changed, when, and why: handy at every appointment." },
  { title: "2 fold-over wallet cards", text: "A free printable medication list for the wallet or purse." },
] as const;

/** EU + EEA + UK + Switzerland: newsletter needs an explicit opt-in (unticked box). */
export const OPT_IN_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
]);
