// Product page copy, word for word from the Phase 1 page copy (one tab per
// product). Buy-box prices come from the catalog; the few prices inside the
// SEO text (metas, the bump line) must be changed here if a price changes.
// Page counts are in only where the file is final (the System's four parts are).

import { AGREEMENT_ABOVE_BUTTON, AGREEMENT_DISCLAIMER_SHORT, AGREEMENT_LEGAL_LINE, BINDER_LEGAL_LINE, EMERGENCY_LEGAL_LINE, PRODUCT_DISCLAIMER_SHORT, SHEET_LEGAL_LINE } from "./legal";
import { FREE_LIST_PATH } from "./free-list";
import { type FaqItem, OFFER_FAQ, OFFER_HEADLINES, OFFER_MOMENT, OFFER_PARTS, ONLY_CHILD_NOTE, PARTS_TITLE, SYSTEM_FORMATS, SYSTEM_STEPS } from "./offer";

export type CopySection = {
  title: string;
  paragraphs?: string[];
  numbered?: string[];
  bullets?: { lead?: string; text: string }[];
  /** Paragraphs after the list. */
  after?: string[];
  link?: { label: string; href: string };
  steps?: readonly { title: string; text: string }[];
  /** A quoted sample (the Agreement's clause). */
  sample?: { label: string; text: string };
};

export type FactIcon = "download" | "format" | "family" | "guarantee" | "print" | "attorney";

/** "What it does" row: a two-tone title (second part in the brand color). */
export type Highlight = { tag: string; title: [string, string?]; text: string; meta?: string };

export type ProductCopy = {
  seo: { title: string; description: string };
  /** Product structured data name, when it differs from the H1. */
  schemaName?: string;
  /** Short product name (breadcrumb, sticky bar, dialogs) when the H1 is a headline. */
  name?: string;
  h1: string;
  subhead: string;
  /** Required line above the Buy button. */
  aboveButton?: string;
  /** First line under the Buy button (then BUY_GUARANTEE_LINE). */
  underButton: string;
  /** Story paragraphs under the hook (the subhead). */
  intro?: string[];
  /** Chips on the gallery's first image (format at a glance). Each must match the facts. */
  badges?: string[];
  /** Buy box: icon facts (format, delivery, who it covers). */
  facts: { icon: FactIcon; text: string }[];
  /** "Your first month": what the first weeks look like (answers "is this a lot of work?"). */
  firstMonth?: { title: string; text: string; items: { when: string; title: string; text: string }[] };
  /** "How it works": three steps. */
  steps: { title: string; items: readonly { title: string; text: string }[]; note?: string };
  /** "What it does": zig-zag rows, the strongest parts of "What's inside". */
  highlights: { title: string; items: Highlight[] };
  /** "Everything in the download": the full list. */
  inside: { title: string; items: { name: string; text: string; meta?: string }[] };
  /** The System parts this product is (comparison table); the System has all four. */
  parts: string[];
  /** Story sections that don't fit the blocks above (the Agreement's "Why families write one"). */
  sections: CopySection[];
  faq: FaqItem[];
  /** Small-print legal lines (each with an optional label). */
  legal: { label?: string; text: string }[];
  /** Closing block: the upgrade to the System, or the Emergency Binder's cross-sell. */
  upgrade?: { title: string; text: string; cta: string; href: string; priceLine: boolean };
};

const SYSTEM_PATH = "/products/family-care-system";

/** The System's part names, split for the two-tone titles (same order as OFFER_PARTS). */
const SYSTEM_PART_TITLES: [string, string][] = [
  ["Medical Binder", "for an Elderly Parent"],
  ["Shared Family", "Care Sheet"],
  ["Family Caregiver", "Agreement Template"],
  ["Family", "Meeting Kit"],
];

export const PRODUCT_COPY: Record<string, ProductCopy> = {
  "family-care-system": {
    seo: {
      title: "Family Care System for an Aging Parent | Parentkeeping",
      description:
        "A medical binder, a shared Google Sheet, a caregiver agreement and a family meeting kit, so Mom or Dad's care is in one place and shared fairly.",
    },
    schemaName: "Parentkeeping Family Care System",
    name: "Family Care System",
    h1: OFFER_HEADLINES.fairness,
    subhead:
      "Everything about Mom or Dad's care in one place, and the work and costs shared fairly between siblings, so it doesn't all fall on you.",
    underButton: PRODUCT_DISCLAIMER_SHORT,
    inside: {
      // DRAFT heading (the zig-zag above already uses "Four parts that work together").
      title: "Everything in the download",
      items: OFFER_PARTS.map((p) => ({ name: p.name, text: p.what, meta: p.format })),
    },
    intro: [
      "You know every pill, every doctor and every refill date. Nobody asked you to; it just happened, one phone call at a time. The Family Care System gives that job one place to live and a way to share it. Set it up in a weekend, with no new app and no subscription.",
    ],
    // No badges: image 1 carries its own part chips, and overlaid ones would cover its title.
    facts: [
      { icon: "download", text: "Instant download after checkout" },
      { icon: "print", text: "Every PDF in US Letter and A4: fill it in on screen or print it" },
      { icon: "format", text: "The Care Sheet is your own Google Sheets copy. Nothing to install." },
      { icon: "family", text: "Covers relatives who help care for the same parent" },
    ],
    // Same order as "Set it up in a weekend": meet, write it down, share. Facts from the What's Inside cards.
    firstMonth: {
      title: "Your first month",
      text: "You don't have to do it all at once. This is what the first weeks usually look like.",
      items: [
        {
          when: "Day 1",
          title: "Send the invite",
          text: "Pick a time for the first family conversation. The Family Meeting Kit has a short invite you can copy and send.",
        },
        {
          when: "First weekend",
          title: "Hold the first meeting",
          text: "Follow the 45-minute agenda. Every job gets a name, how often and a backup before anyone leaves.",
        },
        {
          when: "Week 1",
          title: "Write it down and share it",
          text: "Fill in the Medical Binder, starting with the medications page. Make your copy of the Care Sheet and share it with everyone who helps.",
        },
        {
          when: "Week 4",
          title: "It runs on a Sunday check-in",
          text: "A 10-minute weekly review: what changed, what's coming up, who's paid what. Nobody has to keep score in their head.",
        },
      ],
    },
    steps: { title: "Set it up in a weekend", items: SYSTEM_STEPS, note: ONLY_CHILD_NOTE },
    highlights: {
      title: PARTS_TITLE,
      items: OFFER_PARTS.map((p, i) => ({
        tag: p.pillar,
        title: SYSTEM_PART_TITLES[i],
        text: p.what,
        meta: p.format,
      })),
    },
    parts: OFFER_PARTS.map((p) => p.fileLabel),
    sections: [
      { title: OFFER_MOMENT.title, paragraphs: OFFER_MOMENT.paragraphs },
      { title: "Formats", paragraphs: [SYSTEM_FORMATS] },
    ],
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
    subhead: "Mom's medications, doctors, appointments, and paperwork, in one binder anyone in the family can pick up and use.",
    underButton: PRODUCT_DISCLAIMER_SHORT,
    intro: [
      "This medical binder is for the daughter or son who already knows every pill and every doctor and is tired of being the only one who does. Fill it in once on your computer, print it, and the answers live in the binder instead of in your head.",
    ],
    inside: {
      title: "What's inside",
      items: [
        { name: "Parent at a Glance", text: "About Mom or Dad, emergency contacts, family and helpers, daily routines, and an \"About me\" page for new aides and hospital staff." },
        { name: "Health History", text: "Conditions, surgeries and hospital stays, allergies, vaccinations, equipment and supplies." },
        { name: "Care Team", text: "Doctors and specialists with phone numbers, patient portals and what each one handles, plus pharmacy and other services." },
        { name: "Medications & Refills", text: "Prescription and over-the-counter lists, a daily medication chart, a changes log, a refill tracker and fold-over wallet cards. Bring it to appointments for the pharmacist to review." },
        { name: "Appointments & Visits", text: "Month at a glance, an appointment log with \"who's driving\", visit prep and notes, tests and referrals." },
        { name: "Daily Care", text: "Weekly care schedule, daily care log with a handover note, meals and sleep, health readings, symptoms, falls and incidents." },
        { name: "Hospital Stay", text: "A hospital bag checklist, stay notes and the questions to ask before discharge." },
        { name: "Insurance, Costs & Paperwork", text: "Medicare and other plans, an insurance call log, bills, medical expenses, mileage, and where important documents are kept (power of attorney, advance directive, will), without storing the originals." },
        { name: "Sharing the Care", text: "A \"Who does what\" page that names who handles refills, rides, bills and calls, a 10-minute Sunday check-in, a family update log and a backup plan. Plus notes pages, printable tab labels and a spine label." },
      ],
    },
    // No badges: image 1 carries its own chips, and overlaid ones would cover its title.
    facts: [
      { icon: "format", text: "Fillable PDF: type on screen, save it, print fresh copies anytime, or print it blank and fill in by hand" },
      { icon: "print", text: "Two files, US Letter and A4, with a clickable contents page to jump to any section" },
      { icon: "download", text: "Instant download after checkout. Print as many copies as your family needs." },
      { icon: "family", text: "Covers relatives caring for the same parent" },
    ],
    firstMonth: {
      title: "Your first month",
      text: "You don't have to fill it in all at once. This is what the first weeks usually look like.",
      items: [
        { when: "Day 1", title: "Start with the medications", text: "Fill in the medications page first, on your computer or by hand. It's the page you'll use most." },
        { when: "First weekend", title: "Add doctors and paperwork", text: "Doctors, upcoming appointments, insurance and benefits. Then print it." },
        { when: "Week 1", title: "Give every job a name", text: "Fill in the “Who does what” page and print a copy for each sibling, or keep one at Mom's house." },
        { when: "Week 4", title: "Keep it current on Sundays", text: "The 10-minute Sunday check-in page: what changed, what's coming up, what needs a hand." },
      ],
    },
    steps: {
      title: "How sharing works",
      items: [
        { title: "Print a copy for each sibling", text: "Print a copy for each sibling, or keep one at Mom's house by the phone." },
        { title: "Give every job a name", text: "The “Who does what” page turns “let me know if you need anything” into a named job with a date." },
      ],
    },
    highlights: {
      // DRAFT heading (from the System's binder line).
      title: "Anyone can pick it up and find the answer",
      items: [
        {
          tag: "Medications",
          title: ["One medication list", "the pharmacist can review"],
          text: "Prescriptions, over-the-counter medicines and supplements, plus a medication changes log. A medication binder the pharmacist can review in two minutes.",
        },
        {
          tag: "Appointments",
          title: ["Every visit,", "written down"],
          text: "Upcoming visits, questions to ask, and notes from each visit, so the next sibling knows what the cardiologist said.",
        },
        {
          tag: "Who does what",
          title: ["Jobs stop", "defaulting to you"],
          text: "One page that names who handles refills, rides, bills and calls, so jobs stop defaulting to you.",
        },
        {
          tag: "Sunday check-in",
          title: ["Ten minutes", "every Sunday"],
          text: "A 10-minute weekly review: what changed, what's coming up, what needs a hand.",
        },
      ],
    },
    parts: ["Medical Binder"],
    sections: [],
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
      title: "Family Caregiver Agreement Template (Fillable PDF + Word)",
      description:
        "A family caregiver agreement template to write down who does what and what's paid, then review with an elder-law attorney. Fillable PDF + Word, $19.",
    },
    h1: "Family Caregiver Agreement Template",
    subhead: "Write down who cares for Mom or Dad, what's paid and how, so nobody has to guess and nobody keeps score in silence.",
    aboveButton: AGREEMENT_ABOVE_BUTTON,
    underButton: AGREEMENT_DISCLAIMER_SHORT,
    intro: [
      "Most care starts with “I'll just help out.” A year later one sibling is there four days a week and nobody has said out loud what's fair. This caregiver agreement template (also called a personal care agreement or caregiver contract) puts the arrangement on paper, step by step, and gets your family ready for one short meeting with an elder-law attorney.",
    ],
    // No badges: image 1 carries its own chips, and overlaid ones would cover its title.
    facts: [
      { icon: "format", text: "Fillable PDF plus an editable Word document your attorney can mark up" },
      { icon: "print", text: "Two files, US Letter and A4" },
      { icon: "download", text: "Instant download after checkout" },
      { icon: "attorney", text: "Signature page with space for witnesses, a notary and the attorney's review" },
    ],
    // From the What's Inside cards (Talk First, the attorney tick list, the 17 sections, Signatures, Logs, What We Agreed).
    firstMonth: {
      title: "From first talk to a signed agreement",
      text: "Go at your family's pace. Nobody signs anything until an attorney has reviewed it.",
      items: [
        { when: "Week 1", title: "Talk first", text: "Settle the six questions as a family: what care is needed, how many hours, what it's worth, who decides, and what happens when health changes." },
        { when: "Week 2", title: "Fill it in and book the attorney", text: "Fill in the 17 short sections, then book an elder-law attorney. Bring the 14-question tick list so the meeting is shorter." },
        { when: "Before signing", title: "Attorney review, then signatures", text: "An elder-law attorney where your parent lives reviews it before anyone signs or any payment is made. Then sign, with space for witnesses and a notary." },
        { when: "From then on", title: "Keep the records", text: "Log hours, tasks and payments, and send each sibling the one-page “What We Agreed” summary." },
      ],
    },
    steps: {
      title: "From the kitchen table to a signed agreement",
      items: [
        {
          title: "Talk first",
          text: "Settle the six questions as a family: what care is needed, how many hours, what it's worth, who decides, and what happens when health changes.",
        },
        {
          title: "Fill in the agreement",
          text: "17 short sections in plain words with blanks: who is involved, the care and hours, pay and a fair rate, backup care, and how it changes or ends.",
        },
        {
          title: "Take it to an elder-law attorney",
          text: "Bring the 14-question tick list, and have an attorney where your parent lives review it before anyone signs or any payment is made.",
        },
      ],
    },
    highlights: {
      // DRAFT heading (from the subhead).
      title: "So nobody has to guess",
      items: [
        { tag: "The care", title: ["The care", "to be provided"], text: "From rides and meals to medication pickups and bill paying, with the schedule and expected hours, including live-in arrangements." },
        { tag: "Payments", title: ["Paid", "or unpaid"], text: "The rate, and how and when payments are made." },
        {
          tag: "Time & payment log",
          title: ["Time, task", "and payment log"],
          text: "The records that show what care was given and what was paid.",
        },
        {
          tag: "Talk first",
          title: ["Before you sign,", "talk first"],
          text: "Six questions to settle as a family first, plus a 14-question tick list for your elder-law attorney, so the meeting is shorter.",
        },
      ],
    },
    parts: ["Family Caregiver Agreement"],
    inside: {
      title: "What's inside the template",
      items: [
        { name: "Talk first", text: "Six questions to settle as a family before anyone writes a word." },
        { name: "Questions for your elder-law attorney", text: "A tick list that makes the attorney meeting shorter and cheaper." },
        {
          name: "The agreement, in plain words with blanks",
          text: "Who is involved and where the care happens; the care to be given, the schedule and the hours; live-in care and house rules; pay, and how to choose a fair rate; taxes and records; backup care when the caregiver is sick or away; emergencies and privacy; how the agreement changes or ends, and what to do if you disagree.",
        },
        { name: "Signature page", text: "Space for witnesses, a notary and the attorney's review." },
        { name: "Time and task log, and payment log", text: "The records that show what care was given and what was paid." },
        { name: "“What we agreed”", text: "A one-page summary to send each sibling." },
      ],
    },
    sections: [
      {
        title: "Why families write one",
        paragraphs: [
          "A caregiver agreement, sometimes called a personal care agreement or caregiver contract, puts the arrangement on paper: what care is given, how often, and whether it's paid. It helps families in two ways.",
        ],
        bullets: [
          { lead: "It makes the work visible.", text: "Siblings agree on the jobs and the hours instead of assuming." },
          {
            lead: "It records payments properly.",
            text: "If a parent pays a family member for care, Medicaid may later review those payments during its look-back period (five years in most states). Payments without a written agreement can be treated as gifts. An attorney can set the agreement up so it holds up for your family's situation.",
          },
        ],
        link: { label: "What does care cost? See Cost of In-Home Care for Elderly Parents.", href: "/blogs/guides/cost-of-in-home-care" },
      },
      {
        title: "Formats",
        paragraphs: [
          "Fillable PDF in US Letter and A4, plus an editable Word document your attorney can mark up. Fill it in on screen or print it.",
        ],
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
      title: "Emergency Binder for an Aging Parent (Fillable PDF)",
      description:
        "An emergency binder for an aging parent: a one-page summary for paramedics, a fridge sheet, contacts, medications, documents and wallet cards. $15.",
    },
    h1: "Emergency Binder for an Aging Parent",
    subhead: "When the call comes, everything the paramedics, the ER and your siblings will ask for is in one binder by the door.",
    underButton: PRODUCT_DISCLAIMER_SHORT,
    intro: [
      "In an emergency, the questions come fast. What medications does she take? Any allergies? Who's her doctor? Is there an advance directive? Which hospital?",
      "If the answers live in your head, or in a drawer at Mom's house, the person standing there may not have them. This 18-page binder puts them on paper anyone can hand over, with a one-page summary for the paramedics and a sheet for the fridge.",
    ],
    // Word for word from the finished file's pages (18 pages, US Letter and A4).
    inside: {
      title: "What's inside",
      items: [
        {
          name: "Emergency Summary",
          text: "Everything a paramedic or ER nurse asks first, on one page: conditions, allergies, key medications, devices, wishes and who to call.",
        },
        { name: "Fridge Sheet", text: "The key facts in a clear sleeve on the front of the fridge, where emergency crews may know to look." },
        { name: "Emergency Contacts", text: "Family, neighbors who can help and who has a key, doctors, pharmacy and home care, in the order to call them." },
        { name: "Medication List", text: "Prescriptions, over-the-counter medicines, vitamins, inhalers, drops and patches, copied exactly from the labels." },
        {
          name: "Conditions, Allergies & Devices",
          text: "Health conditions, allergies and reactions, surgeries and recent hospital stays, and devices like hearing aids or a pacemaker.",
        },
        { name: "Insurance", text: "Each plan and its member services number, with space to tape copies of the cards." },
        {
          name: "Legal Documents Locator",
          text: "Where the advance directive, POLST or DNR, powers of attorney and will are kept, who has copies, and who can speak for Mom or Dad.",
        },
        { name: "Hospital & Care Preferences", text: "Preferred hospital, language, faith, diet, what calms them and what matters most to them, in their own words." },
        { name: "The House & Pets", text: "Keys, alarm, shut-offs, pets and mail, for whoever looks after things. Where codes are kept, never the codes." },
        {
          name: "Grab-and-Go Checklist",
          text: "Papers, glasses, hearing aids, the pill bottles and what to do before you lock up, for whoever gets there first.",
        },
        { name: "The First 24 Hours & Hospital Stay Log", text: "A phone tree, what to do once they're safe, and a log of what the doctors said." },
        { name: "Wallet Cards & Door Labels", text: "Fold-over cards for Mom or Dad's wallet and yours, and labels that tell crews to look on the fridge." },
        { name: "The Conversation & Review Log", text: "Words for bringing it up with Mom or Dad, and a log to keep it current every few months." },
      ],
    },
    // No badges: kept consistent with the other products.
    facts: [
      { icon: "format", text: "Fillable PDF: type on screen, or print it and fill it in by hand" },
      { icon: "print", text: "18 pages, in US Letter and A4" },
      { icon: "download", text: "Instant download after checkout" },
      { icon: "family", text: "Tell every sibling and the nearest neighbor where it's kept" },
    ],
    // From the file's own "How to Use This Binder" page.
    firstMonth: {
      title: "Ready in an afternoon",
      text: "Set it up once. Then it waits by the door until the day you need it.",
      items: [
        { when: "Start here", title: "Sit down together", text: "Fill it in with Mom or Dad, not about them. Copy medicines straight from the labels, with the insurance cards and legal papers on the table." },
        { when: "Same afternoon", title: "Put the fridge sheet up", text: "Slip it into a clear sleeve on the front of the fridge, and stick the door label inside the front door." },
        { when: "That week", title: "Tell everyone where it is", text: "Keep the binder by the front door or in a kitchen drawer, tell every sibling and the nearest neighbor, and put a wallet card in Mom or Dad's wallet." },
        { when: "Every few months", title: "Keep it current", text: "And after every hospital stay, medication change or new doctor. Update the fridge sheet and wallet cards too." },
      ],
    },
    steps: {
      title: "Set it up once, then it waits by the door",
      items: [
        { title: "Fill it in together", text: "Sit down with Mom or Dad and copy medicines straight from the labels. Start with the easy pages if the subject is hard." },
        { title: "Put it where crews look", text: "The fridge sheet on the fridge, the door label inside the front door, the binder by the door, a wallet card in the wallet." },
        { title: "When the call comes", text: "Call your local emergency number first. Then hand the crew the summary page, grab the bag using the checklist, and start the phone tree." },
      ],
    },
    highlights: {
      // Heading from the doc's FAQ ("built to be handed to a stranger").
      title: "Built to be handed to a stranger",
      items: [
        {
          tag: "Summary",
          title: ["One page", "for the paramedic"],
          text: "Name, date of birth, conditions, allergies and medications, ready to hand to a paramedic.",
        },
        {
          tag: "Documents",
          title: ["Where the", "originals are"],
          text: "Where the originals of the advance directive, POLST or DNR form and power of attorney are kept, and who has copies.",
        },
        { tag: "Grab and go", title: ["For the person", "who arrives first"], text: "What to take to the hospital, for the person who arrives first." },
        { tag: "Fridge sheet", title: ["The key facts,", "on the fridge"], text: "A single page for the refrigerator door, so the key facts are easy to find." },
      ],
    },
    parts: [],
    sections: [],
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
        q: "Can I use it outside the US?",
        a: "Yes. It comes in US Letter and A4 and lists the emergency numbers for the US and Canada, the EU, the UK and Australia. Ask your parent's doctor which advance directive or DNR form applies where they live.",
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
      text: "Once Mom or Dad is home again, the work starts: appointments, medicines, bills, and deciding who does what. The Family Care System keeps it in one place and shares it fairly between siblings.",
      cta: "See the Family Care System",
      href: SYSTEM_PATH,
      priceLine: false,
    },
  },
};
