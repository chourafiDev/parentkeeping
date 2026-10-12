// Home page content (Glozin "EchoZone" layout, Parentkeeping offer).
// DRAFT COPY: final words come from the copy work. Rules from the spec: no
// reviews or customer counts until real; never "keeps your parent safe" or
// "command center". Offer facts live in ./offer.ts.

/** Scrolling strip under the hero. */
export const MARQUEE = [
  "One place for your parent's care",
  "Shared fairly with your siblings",
  "No new app",
  "No subscription",
  "Set up in one weekend",
  "14-day “if it doesn't help” guarantee",
];

/** "Sound familiar?" (replaces Glozin's testimonials: no names, no stars, not reviews). */
export const SOUND_FAMILIAR = [
  {
    text: "I'm the one who knows every pill, every doctor and every refill date. If I got sick tomorrow, nobody would know where to start.",
    part: "Medical Binder for an Elderly Parent",
    slug: "medical-binder",
  },
  {
    text: "I asked my brother to help. He said “do whatever you think is best.” So I do all of it, again.",
    part: "Shared Family Care Sheet",
    slug: "family-care-system",
  },
  {
    text: "I've been driving Mom to every appointment for two years. We've never talked about whether that's fair, or what happens to the house.",
    part: "Family Caregiver Agreement Template",
    slug: "caregiver-agreement",
  },
] as const;

/** "Why Parentkeeping" icon boxes. */
export const WHY = [
  { icon: "one-place", title: "One place", text: "Medications, doctors, appointments, insurance and paperwork in one binder and one sheet, not in your head." },
  { icon: "fair", title: "Shared fairly", text: "A job board and a cost tracker that show who does what and who pays what, so the work can finally be split." },
  { icon: "no-app", title: "No new app", text: "Printable PDFs and a Google Sheet you already know how to use. Nobody installs anything or creates an account." },
  { icon: "guarantee", title: "14-day guarantee", text: "If it doesn't help you get organized and shared, email us within 14 days for a full refund." },
] as const;
