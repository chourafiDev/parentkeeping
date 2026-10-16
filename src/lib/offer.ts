// Family Care System copy (home + /products/family-care-system), word for word
// from "Family Care System (home)" in the Phase 1 page copy.
// Rules: no reviews, customer counts or founder story until real; never
// "command center", "keeps your parent safe", "app" for the brand, etc.

/** Title tags and metas (SEO plan). The product URL canonicals to "/". */
export const HOME_SEO = {
  title: "Parentkeeping: Your Parent's Care in One Place, Shared Fairly",
  description:
    "One binder and one shared Google Sheet for Mom or Dad's medications, doctors, jobs and costs. Split fairly between siblings. No app. One price.",
};

/** H1 test: variant A (fairness) and variant B (one place). */
export const OFFER_HEADLINES: Record<"fairness" | "one_place", string> = {
  fairness: "Your parent's care, kept in one place. And shared fairly.",
  one_place: "Stop carrying your parent's care in your head.",
};

export const OFFER_SUBHEAD =
  "The Parentkeeping Family Care System puts Mom or Dad's medications, doctors and paperwork in one binder, and the jobs and costs in one sheet your siblings can see. Set it up in a weekend. No new app, no subscription.";

export const SYSTEM_BUTTON = "Get the Family Care System";

export const ONE_PRICE_BADGE = "One price. No app. No subscription.";

/** "The moment": the sibling hook. */
export const OFFER_MOMENT = {
  title: "“Do whatever you think is best.”",
  paragraphs: [
    "You asked your brother what to do about Dad's new prescription. That was his whole answer.",
    "So it lands on you again. You know every pill, every doctor, every refill date and where the insurance card is. Nobody asked you to. It just happened, one phone call at a time.",
    "You're not failing. The job is too big for one head. It needs one place to live, and it needs to be shared.",
  ],
};

export const PARTS_TITLE = "Four parts that work together";

/** The four parts. `fileLabel` links a part to its file for "arrives by" dates. */
export const OFFER_PARTS = [
  {
    name: "Medical Binder for an Elderly Parent",
    what: "Medications, doctors, appointments, insurance and paperwork in one place, plus a “Who does what” page and a weekly Sunday check-in page. Anyone can pick it up and find the answer.",
    format: "Fillable PDF + printable",
    pillar: "One place",
    fileLabel: "Medical Binder",
  },
  {
    name: "Shared Family Care Sheet",
    what: "One Google Sheet with three tabs: a medication tracker, a job board (who does what, by when) and a cost tracker that shows each sibling's share. Everyone sees the same page.",
    format: "Google Sheets, your own copy",
    pillar: "Shared fairly · No new app",
    fileLabel: "Shared Family Care Sheet",
  },
  {
    name: "Family Caregiver Agreement Template",
    what: "Writes down who provides care, whether anyone is paid, and how. A template to start the conversation and take to your attorney.",
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

/** Shown while some parts are on pre-sale. */
export const presaleNote = (deliveryDate: string) =>
  `The Medical Binder and Family Meeting Kit download right away. The Shared Family Care Sheet and the Agreement arrive by ${deliveryDate}. If we miss that date, you can have a full refund.`;

export const SHARING_TITLE = "Sharing takes about 30 seconds. Nobody installs anything.";

export const SHARING_STEPS = [
  { title: "Make your copy", text: "Click the “Make a copy” link and the sheet lands in your own Google account. We never see it." },
  { title: "Add your siblings", text: "Share it like any Google Sheet. They open it on their phone or laptop." },
  {
    title: "Split the jobs and costs",
    text: "Use the Family Meeting Kit for the first conversation. Each person takes named jobs, and the cost tracker shows everyone's share.",
  },
] as const;

export const ONLY_CHILD_NOTE =
  "Only child, or siblings far away? The job board works the same way with a friend, a neighbor or paid help.";

/** Price anchor. Prices come from the catalog so the sentence never drifts. */
export const PRICE_ANCHOR_TITLE = "Less than buying the pieces";

export const GUARANTEE_TITLE = "If it doesn't help, you get your money back";
/** `email` = the support address from Settings (falls back to "us"). */
export const guaranteeText = (email: string | null) =>
  `Use it for 14 days. If it doesn't help your family, email ${email ?? "us"} and we'll refund you. No forms, no hard feelings.`;

export type FaqItem = { q: string; a: string; link?: { label: string; href: string } };

export const OFFER_FAQ: FaqItem[] = [
  {
    q: "Is this an app?",
    a: "No. It's a printable binder and a Google Sheet. Your family already knows how to use both, and there's nothing to install or pay for each month.",
  },
  {
    q: "Do my siblings need to buy it too?",
    a: "No. Your purchase covers relatives who help care for the same parent. Print as many copies as you need and share the sheet with them.",
  },
  {
    q: "My siblings won't use anything. Is it still worth it?",
    a: "Yes. The binder gets everything out of your head even if you're the only one using it. And a job written on a shared sheet, with a name and a date beside it, is much harder to ignore than a group text.",
  },
  {
    q: "Is the Caregiver Agreement legal advice?",
    a: "No. It's a template to help your family talk through and write down care arrangements. Paying a family caregiver can affect taxes and Medicaid eligibility, so have an elder-law attorney in your parent's state review it before anyone signs.",
  },
  {
    q: "Does it tell me what medications or doses to give?",
    a: "No. You record what the doctor or pharmacist prescribed, exactly as prescribed. Bring the list to appointments and ask the pharmacist to review it whenever something changes.",
  },
  {
    q: "Who can see my family's information?",
    a: "Only the people you share it with. You fill in the binder on paper or your own device, and the sheet lives in your own Google account. We never receive what you write.",
  },
  {
    q: "When do the pre-sale parts arrive?",
    a: "By the date shown on the page. We'll email you the moment each part is ready. If we miss the date, ask for a full refund.",
  },
];

/**
 * "I'm not in the US. Can I buy it?" — the one FAQ answer that depends on
 * Settings → Checkout → Sell worldwide, so it's computed per request rather
 * than baked into OFFER_FAQ. Appended wherever OFFER_FAQ is shown.
 */
export const worldwideFaqItem = (worldwideEnabled: boolean): FaqItem =>
  worldwideEnabled
    ? {
        q: "I'm not in the US. Can I buy it?",
        a: "Yes. The System sells worldwide, in your own currency, with sales tax or VAT already included in the price. A handful of countries aren't supported yet by our payment processor; checkout will tell you if yours is one of them.",
      }
    : {
        q: "I'm not in the US. Can I buy it?",
        a: "Not yet, but we're working on it. Join the free Medication List and we'll let you know the moment it opens in your country.",
        link: { label: "Get the free Medication List", href: "/pages/free-medication-list" },
      };

/** Strips at the end of the home page. */
export const DOWNSELL_STRIP = {
  text: "Just need the binder? Get the Medical Binder for an Elderly Parent on its own for",
  cta: "See the Medical Binder",
};
export const FREE_LIST_STRIP = {
  text: "Not ready to buy? Start with our free printable Medication List & Daily Medication Chart.",
  cta: "Get the free list",
};
