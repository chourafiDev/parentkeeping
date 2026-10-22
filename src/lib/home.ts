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

/**
 * "Parentkeeping vs. the usual way" (home). Approved copy.
 * No competitor names; the app column describes caregiving apps in general,
 * so every "no" must hold for that category as a whole.
 */
export type UsualWayCell = { mark: "yes" | "no" | "some"; text?: string };
export const USUAL_WAY_COLUMNS = ["Parentkeeping", "Group texts + memory", "Caregiving apps"] as const;
export const USUAL_WAY: { label: string; cells: [UsualWayCell, UsualWayCell, UsualWayCell] }[] = [
  {
    label: "Everyone can see who does what",
    cells: [{ mark: "yes" }, { mark: "no", text: "Lost in the thread" }, { mark: "yes" }],
  },
  {
    label: "Medications, doctors and insurance in one place",
    cells: [{ mark: "yes" }, { mark: "no", text: "In one person's head" }, { mark: "yes" }],
  },
  {
    label: "Who paid what, written down",
    cells: [{ mark: "yes" }, { mark: "no" }, { mark: "some", text: "Some apps" }],
  },
  {
    label: "Nothing to install, no new app to learn",
    cells: [{ mark: "yes" }, { mark: "yes" }, { mark: "no", text: "Everyone needs the app" }],
  },
  {
    label: "Works on paper, for Mom, aides and the ER",
    cells: [{ mark: "yes" }, { mark: "no" }, { mark: "some", text: "Mostly on a screen" }],
  },
  {
    label: "One price, no subscription",
    cells: [{ mark: "yes" }, { mark: "yes", text: "Free" }, { mark: "some", text: "Often a monthly fee" }],
  },
];
