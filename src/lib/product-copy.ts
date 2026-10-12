// Product page copy, word for word from the Phase 1 page copy (one tab per
// product). Buy-box prices come from the catalog; the few prices inside the
// SEO text (metas, the bump line) must be changed here if a price changes.
// Page counts ("[X] pages") are left out until the files are final.

import { AGREEMENT_ABOVE_BUTTON, AGREEMENT_DISCLAIMER_SHORT, AGREEMENT_LEGAL_LINE, BINDER_LEGAL_LINE, EMERGENCY_LEGAL_LINE, PRODUCT_DISCLAIMER_SHORT, SHEET_LEGAL_LINE } from "./legal";
import { FREE_LIST_PATH } from "./free-list";
import { type FaqItem, OFFER_FAQ, OFFER_PARTS, OFFER_SUBHEAD, ONLY_CHILD_NOTE, PARTS_TITLE, SHARING_STEPS, SHARING_TITLE } from "./offer";

export type CopySection = {
  title: string;
  paragraphs?: string[];
  bullets?: { lead?: string; text: string }[];
  steps?: readonly { title: string; text: string }[];
  /** A quoted sample (the Agreement's clause). */
  sample?: { label: string; text: string };
};

export type ProductCopy = {
  seo: { title: string; description: string };
  /** Product structured data name, when it differs from the H1. */
  schemaName?: string;
  h1: string;
  subhead: string;
  /** Required line above the Buy button. */
  aboveButton?: string;
  /** First line under the Buy button (then BUY_GUARANTEE_LINE). */
  underButton: string;
  intro?: string[];
  inside: { title: string; items: { name: string; text: string; meta?: string }[] };
  /** Full-width sections after "What's inside", in page order. */
  sections: CopySection[];
  faq: FaqItem[];
  /** Small-print legal lines (each with an optional label). */
  legal: { label?: string; text: string }[];
  /** Closing block: the upgrade to the System, or the Emergency Binder's cross-sell. */
  upgrade?: { title: string; text: string; cta: string; href: string; priceLine: boolean };
};

const SYSTEM_PATH = "/products/family-care-system";

export const PRODUCT_COPY: Record<string, ProductCopy> = {
  "family-care-system": {
    seo: {
      title: "Family Care System: Parent Care Binder + Shared Sheet",
      description:
        "One binder and one shared Google Sheet for Mom or Dad's medications, doctors, jobs and costs. Split fairly between siblings. No app. One price.",
    },
    h1: "Family Care System",
    subhead: OFFER_SUBHEAD,
    underButton: PRODUCT_DISCLAIMER_SHORT,
    inside: {
      title: PARTS_TITLE,
      items: OFFER_PARTS.map((p) => ({ name: p.name, text: p.what, meta: p.format })),
    },
    sections: [{ title: SHARING_TITLE, steps: SHARING_STEPS, paragraphs: [ONLY_CHILD_NOTE] }],
    faq: OFFER_FAQ,
    legal: [
      { label: "Medical Binder", text: BINDER_LEGAL_LINE },
      { label: "Shared Family Care Sheet", text: SHEET_LEGAL_LINE },
      { label: "Caregiver Agreement", text: AGREEMENT_LEGAL_LINE },
    ],
  },

  "medical-binder": {
    seo: {
      title: "Medical Binder for an Elderly Parent (Fillable + Printable)",
      description:
        "A medical binder for an elderly parent: medications, doctors, appointments, insurance and a sibling \"who does what\" page. Fillable PDF, $19.",
    },
    schemaName: "Parentkeeping Medical Binder for an Elderly Parent",
    h1: "Medical Binder for an Elderly Parent",
    subhead: "Mom's medications, doctors, appointments and paperwork in one binder anyone in the family can pick up and use. Fillable PDF and printable.",
    underButton: PRODUCT_DISCLAIMER_SHORT,
    intro: [
      "This medical binder is for the daughter or son who already knows every pill and every doctor, and is tired of being the only one who does. Fill it in once on your computer, print it, and the answers live in the binder instead of in your head.",
    ],
    inside: {
      title: "What's inside",
      items: [
        {
          name: "Medications",
          text: "Prescriptions, over-the-counter medicines and supplements, plus a medication changes log. A medication binder the pharmacist can review in two minutes.",
        },
        { name: "Doctors and specialists", text: "Names, numbers, portals and what each one handles." },
        {
          name: "Appointments",
          text: "Upcoming visits, questions to ask, and notes from each visit, so the next sibling knows what the cardiologist said.",
        },
        { name: "Insurance and benefits", text: "Medicare, supplemental and drug plan details, member numbers and who to call." },
        {
          name: "Paperwork",
          text: "Where the important documents are kept (power of attorney, advance directive, will), without storing the originals in the binder.",
        },
        { name: "“Who does what” page", text: "One page that names who handles refills, rides, bills and calls, so jobs stop defaulting to you." },
        { name: "Sunday check-in page", text: "A 10-minute weekly review: what changed, what's coming up, what needs a hand." },
      ],
    },
    sections: [
      {
        title: "Format and delivery",
        bullets: [
          { lead: "Fillable PDF:", text: "type in it, save it, print it. Also prints blank for handwriting." },
          { text: "US Letter, prints on A4." },
          { text: "Instant download after checkout. Print as many copies as your family needs." },
        ],
      },
      {
        title: "How sharing works",
        paragraphs: [
          "Print a copy for each sibling, or keep one at Mom's house by the phone. The “Who does what” page turns “let me know if you need anything” into a named job with a date.",
        ],
      },
    ],
    faq: [
      {
        q: "What's the difference between a medical binder and a caregiver binder?",
        a: "Same idea. A caregiver binder or caregiver log book is the family's record of a parent's care; we call ours a medical binder because that's where most of the work is.",
      },
      {
        q: "Are there free medical binder printables?",
        a: "Our free Medication List & Daily Medication Chart covers the medication pages. The binder adds everything else.",
        link: { label: "Get it free", href: FREE_LIST_PATH },
      },
      {
        q: "Is this an official medical record?",
        a: "No. It's your family's personal record. The doctors, hospital and pharmacy keep the official ones.",
      },
      { q: "Can my siblings use it?", a: "Yes. Your purchase covers relatives caring for the same parent." },
      {
        q: "I'd rather track things online.",
        a: "The Family Care System includes this binder plus a shared Google Sheet for medications, jobs and costs. See below.",
      },
    ],
    legal: [{ text: BINDER_LEGAL_LINE }],
    upgrade: {
      title: "Want the jobs and costs shared fairly too?",
      text: "The Family Care System includes this Medical Binder, plus a Shared Family Care Sheet (medication tracker, job board and cost tracker with each sibling's share), the Family Caregiver Agreement Template and a Family Meeting Kit for the first sibling conversation.",
      cta: "Get the Family Care System",
      href: SYSTEM_PATH,
      priceLine: true,
    },
  },

  "caregiver-agreement": {
    seo: {
      title: "Family Caregiver Agreement Template (Fillable PDF + Doc)",
      description:
        "A family caregiver agreement template to write down who does what and what's paid, then review with an elder-law attorney. Fillable PDF, $19.",
    },
    h1: "Family Caregiver Agreement Template",
    subhead:
      "Write down who cares for Mom or Dad, what's paid and how, so nobody has to guess and nobody keeps score in silence. A template to start the conversation and take to your attorney.",
    aboveButton: AGREEMENT_ABOVE_BUTTON,
    underButton: AGREEMENT_DISCLAIMER_SHORT,
    inside: {
      title: "What's inside the template",
      items: [
        { name: "Who's involved", text: "The parent, the caregiver, and any siblings or agents signing." },
        { name: "The care to be provided", text: "From rides and meals to medication pickups and bill paying." },
        { name: "Schedule and expected hours", text: "Including live-in arrangements." },
        { name: "Paid or unpaid", text: "The rate, and how and when payments are made." },
        { name: "Time and task log", text: "A simple log to keep with the agreement." },
        { name: "Backup care", text: "What happens when the caregiver is sick or away." },
        { name: "Reviews and changes", text: "How and when the agreement is reviewed, changed or ended." },
        { name: "Signature page", text: "With space for the attorney's review." },
        {
          name: "A plain-words guide",
          text: "Questions to settle as a family before your attorney meeting, so the billed hour goes further.",
        },
      ],
    },
    sections: [
      {
        title: "Why families write one",
        paragraphs: [
          "Most care arrangements start with “I'll just help out.” A year later one sibling is there four days a week, another sends money now and then, and nobody has said out loud what's fair.",
          "A caregiver agreement, sometimes called a personal care agreement or caregiver contract, puts the arrangement on paper: what care is given, how often, and whether it's paid. It helps families in two ways.",
        ],
        bullets: [
          { lead: "It makes the work visible.", text: "Siblings agree on the jobs and the hours instead of assuming." },
          {
            lead: "It records payments properly.",
            text: "If a parent pays a family member for care, Medicaid may later review those payments during its look-back period (five years in most states). Payments without a written agreement can be treated as gifts. An attorney can set the agreement up so it holds up for your family's situation.",
          },
        ],
      },
      {
        title: "Formats",
        paragraphs: ["Fillable PDF plus an editable document your attorney can mark up. US Letter."],
        sample: {
          label: "Sample clause (shows the style)",
          text: "Services. [Caregiver] will provide the following care to [Parent]: transportation to medical appointments; picking up prescriptions; grocery shopping; preparing [number] meals per week. [Caregiver] will record hours and tasks on the attached log.",
        },
      },
    ],
    faq: [
      {
        q: "Is this legally binding?",
        a: "A template on its own isn't tailored to your state. Fill it in as a family, then have an elder-law attorney review and adjust it before anyone signs.",
      },
      {
        q: "Do we need this if nobody is being paid?",
        a: "It still helps. Writing down who does what is the fairest way to split care, and it gives you a starting point if payment comes up later.",
      },
      {
        q: "Does paying a family caregiver affect taxes?",
        a: "It can. Payments are usually income to the caregiver, and the family may have employer responsibilities. Ask the attorney or a tax professional.",
      },
      {
        q: "What does an attorney review cost?",
        a: "Many elder-law attorneys offer flat-fee document reviews, and hourly rates commonly run about $100 to $500. Arriving with a filled-in draft keeps the time short.",
      },
      {
        q: "Is this a sample caregiver agreement I can copy for free?",
        a: "Free samples exist. This template adds the time log, the sibling and backup-care sections, and a guide for the family conversation.",
      },
    ],
    legal: [{ text: AGREEMENT_LEGAL_LINE }],
    upgrade: {
      title: "Get the agreement and the tools to share the work",
      text: "The Family Care System includes this Agreement Template, plus the Medical Binder, a Shared Family Care Sheet (job board and cost tracker with each sibling's share) and a Family Meeting Kit with a script for the first conversation.",
      cta: "Get the Family Care System",
      href: SYSTEM_PATH,
      priceLine: true,
    },
  },

  // The only page allowed to use crisis framing.
  "emergency-binder": {
    seo: {
      title: "Emergency Binder for an Aging Parent (Printable PDF)",
      description:
        "An emergency binder for an aging parent: the one-page facts, contacts, medications and documents a paramedic or ER asks for. Printable PDF, $15.",
    },
    h1: "Emergency Binder for an Aging Parent",
    subhead: "When the call comes, everything the paramedics, the ER and your siblings will ask for is in one binder by the door.",
    underButton: PRODUCT_DISCLAIMER_SHORT,
    intro: [
      "In an emergency, the questions come fast. What medications does she take? Any allergies? Who's her doctor? Is there an advance directive? Which hospital?",
      "If the answers live in your head, or in a drawer at Mom's house, the person standing there may not have them. This binder puts them on a few pages anyone can hand over.",
    ],
    inside: {
      title: "What's inside",
      items: [
        {
          name: "One-page emergency summary",
          text: "Name, date of birth, conditions, allergies and medications, ready to hand to a paramedic.",
        },
        { name: "Emergency contacts", text: "Family, neighbors with a key, doctors, pharmacy." },
        { name: "Medication list", text: "Blank, to copy from your parent's current list exactly as prescribed." },
        { name: "Insurance", text: "Where to tape copies of the Medicare and supplemental cards." },
        {
          name: "Legal documents locator",
          text: "Where the originals of the advance directive, POLST or DNR form and power of attorney are kept, and who has copies.",
        },
        { name: "Hospital and care preferences", text: "Preferred hospital, faith or language needs, hearing aids and glasses." },
        { name: "Home page", text: "Pets, keys, alarm codes location, who to call to check the house." },
        { name: "Grab-and-go checklist", text: "What to take to the hospital, for the person who arrives first." },
        { name: "Fridge sheet", text: "A single page for the refrigerator door, so the key facts are easy to find." },
        { name: "Emergency binder checklist", text: "How to set it up in an afternoon and when to update it." },
      ],
    },
    sections: [
      { title: "Format", paragraphs: ["Printable PDF, fillable on screen. US Letter. Instant download."] },
      {
        title: "Where to keep it",
        paragraphs: [
          "Keep the binder by the front door or with the fridge sheet, and give each sibling a copy or a photo of the summary page. Update it whenever a medication or doctor changes.",
        ],
      },
    ],
    faq: [
      {
        q: "What's the difference between this and the Medical Binder?",
        a: "The Medical Binder is for everyday keeping: appointments, insurance, who does what. The Emergency Binder is the short version for the worst day, built to be handed to a stranger.",
      },
      {
        q: "Does it replace an advance directive or power of attorney?",
        a: "No. It tells people where those documents are. Store the originals safely and keep copies in the binder.",
      },
      {
        q: "Are there free emergency binder printables?",
        a: "Our free Medication List & Daily Medication Chart includes two wallet cards.",
        link: { label: "Get it free", href: FREE_LIST_PATH },
      },
    ],
    legal: [{ text: EMERGENCY_LEGAL_LINE }],
    upgrade: {
      title: "Ready for the worst day. Now for every other day.",
      text: "The Family Care System keeps the everyday care in one place and shares the jobs and costs fairly between siblings. Add the Emergency Binder at checkout for $15.",
      cta: "See the Family Care System",
      href: SYSTEM_PATH,
      priceLine: false,
    },
  },
};
