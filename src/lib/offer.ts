// Family Care System sales page (home + /products/family-care-system).
// DRAFT COPY from the Main Offer doc: final words come from the copy work.
// Rules: no reviews or customer counts until real; never "keeps your parent
// safe" or "command center".

export const OFFER_HEADLINES: Record<"fairness" | "one_place", string> = {
  one_place: "Your parent's care, kept in one place. And shared fairly.",
  fairness: "Your parent's care, shared fairly. And kept in one place.",
};

export const OFFER_SUBHEAD =
  "Get every medication, doctor and job out of your head and split fairly with your siblings. Set up in one weekend, without a new app or a subscription.";

export const ONE_PRICE_BADGE = "One price. No app. No subscription.";

/** "The moment": the sibling hook, paraphrased into her situation. */
export const OFFER_MOMENT = {
  title: "“Do whatever you think is best.”",
  paragraphs: [
    "You asked your brother to help. That's what he said. And just like that, the pills, the appointments, the insurance calls and the worrying all landed on you. Again.",
    "It isn't that your family doesn't care. It's that nobody can see what you're carrying, so nobody knows what to pick up.",
    "The Family Care System puts it all on paper and in one shared sheet, so the work is visible and can finally be split.",
  ],
};

/** The four parts. `fileLabel` links a part to its file for "arrives by" dates. */
export const OFFER_PARTS = [
  {
    name: "Medical Binder for an Elderly Parent",
    what: "Medications, doctors, appointments, insurance and paperwork in one binder, plus a “Who does what” page and a weekly Sunday check-in.",
    format: "Fillable PDF + printable",
    pillar: "One place",
    fileLabel: "Medical Binder",
  },
  {
    name: "Shared Family Care Sheet",
    what: "One Google Sheet with three tabs: a medication tracker, a job board (who does what, by when) and a cost tracker that shows each sibling's share.",
    format: "Google Sheets, “Make a copy” link",
    pillar: "Shared fairly · No new app",
    fileLabel: "Shared Family Care Sheet",
  },
  {
    name: "Family Caregiver Agreement Template",
    what: "Writes down who provides care, paid or unpaid, so everyone agrees on the same thing. A template to start the conversation and take to your attorney.",
    format: "Fillable PDF + editable doc",
    pillar: "Shared fairly",
    fileLabel: "Family Caregiver Agreement",
  },
  {
    name: "Family Meeting Kit",
    what: "A one-page agenda and a plain-words script for the first sibling conversation: what needs doing, who takes which job, how costs split.",
    format: "PDF",
    pillar: "Shared fairly",
    fileLabel: "Family Meeting Kit",
  },
] as const;

export const SHARING_STEPS = [
  { title: "Make your copy of the sheet", text: "One click copies the Shared Family Care Sheet into your own Google account." },
  { title: "Add your siblings", text: "Share it like any Google Sheet. Nobody installs anything or creates an account with us." },
  { title: "Split jobs and costs at the first meeting", text: "Use the Meeting Kit's agenda to agree who does what, by when, and who pays for what." },
] as const;

export const ONLY_CHILD_NOTE =
  "Only child? It works for you too: the job board becomes a list of tasks to hand to a friend, a neighbor or paid help.";

export const GUARANTEE_TEXT =
  "Use the System for 14 days. If it doesn't help you get your parent's care organized and shared, email us and we'll refund you in full. No forms, no hoops.";

export const OFFER_FAQ = [
  {
    q: "Is it an app?",
    a: "No. It's printable and fillable PDFs plus one Google Sheet you copy into your own account. Nothing to install, no logins with us, no subscription.",
  },
  {
    q: "Do my siblings need to buy it too?",
    a: "No. Your license covers relatives caring for the same parent. Share your copy of the sheet and print pages for whoever needs them.",
  },
  {
    q: "Is the Caregiver Agreement legal advice?",
    a: "No. It's a template to start the conversation and write things down. Have it reviewed by an elder-law attorney in your state before anyone signs.",
  },
  {
    q: "When do the pre-sale parts arrive?",
    a: "You get everything that's ready right away. Parts marked “arrives by” come on that date, by email, at no extra cost. If a date is missed, you can ask for a full refund.",
  },
  {
    q: "I live outside the US. Can I buy it?",
    a: "Not yet: paid products are US-only for now because of US-specific forms and sales tax. The free Medication List works anywhere.",
  },
] as const;
