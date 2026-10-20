// Free downloads (email sign-up → PDF), word for word from the Phase 1 page
// copy. Each has its own page, thank-you page, subscriber source and PDF.

import { FREE_LIST_PATH, FREE_LIST_PDF, FREE_LIST_PDF_A4, FREE_LIST_SOURCE } from "./free-list";
import { GENERAL_INFO_LINE, MEDICATION_LEGAL_LINE, QUIZ_RESULT_FOOTER } from "./legal";
import type { FaqItem } from "./offer";
import type { CopySection } from "./product-copy";

export type LeadMagnet = {
  /** Stored on the subscriber (first sign-up wins). */
  source: string;
  path: string;
  /** Public, unlisted file (it's free): shown on the thank-you page and in the email. */
  pdf: string;
  /** A4 version of the same file, when one exists (US Letter stays the default download). */
  pdfA4?: string;
  seo: { title: string; description: string };
  h1: string;
  /** Headline test: the H1 keeps the keyword, the subhead carries the angle. */
  subheads: Record<"fairness" | "one_place", string>;
  intro?: string;
  button: string;
  /** "We'll email you {what}, then our weekly caregiving emails." */
  noticeWhat: string;
  inside: { title: string; items: { title: string; text: string }[] };
  /** Page previews: public/files/previews/<file>.png once they exist, sketches until then. */
  previews: { file: string; title: string }[];
  previewLegal?: string;
  /** SEO text below the form. */
  article: CopySection[];
  faq: FaqItem[];
  /** Small print at the end of the page. */
  legal: string;
  closingTitle: string;
  thanks: { h1: string; line: string };
  email: { subject: string; preheader: string; heading: string; text: string; button: string; legal: string };
};

export const FREE_LIST: LeadMagnet = {
  source: FREE_LIST_SOURCE,
  path: FREE_LIST_PATH,
  pdf: FREE_LIST_PDF,
  pdfA4: FREE_LIST_PDF_A4,
  seo: {
    title: "Free Printable Medication List & Daily Medication Chart",
    description:
      "Free printable medication list template and daily medication chart for an elderly parent. Fillable PDF with wallet cards, sent straight to your inbox.",
  },
  h1: "Free Printable Medication List & Daily Medication Chart",
  subheads: {
    one_place: "Stop carrying your parent's care in your head.",
    fairness: "One medication list the whole family can see, so it doesn't all sit with you.",
  },
  intro:
    "A free medication list template made for adult children keeping track of a parent's medications. Fill it in on your computer or print it, bring it to every appointment, and keep a copy in Mom's wallet. 9 pages, fillable PDF, in US Letter and A4.",
  button: "Send me the free list",
  noticeWhat: "the list",
  inside: {
    title: "What's inside the free PDF",
    items: [
      { title: "About Mom or Dad", text: "Allergies, conditions, doctors, pharmacy and an emergency contact on one page." },
      { title: "Prescription Medication List", text: "Name, strength, how it's taken, who prescribed it and why, copied exactly from the label." },
      { title: "Over-the-Counter & Supplements", text: "The vitamins and pain relievers doctors always ask about and families forget." },
      {
        title: "Daily Medication Chart",
        text: "One week per page, with a box to initial each dose, so two people never wonder “did she already take it?”",
      },
      { title: "Medication Changes Log", text: "What changed, when, and who said so." },
      { title: "Two fold-over wallet cards", text: "A free printable medication list for a wallet or purse, ready for the ER or a new specialist." },
    ],
  },
  previews: [
    { file: "page-1", title: "About Mom or Dad" },
    { file: "page-2", title: "Daily Medication Chart" },
    { file: "page-3", title: "Wallet card" },
  ],
  previewLegal: MEDICATION_LEGAL_LINE,
  article: [
    {
      title: "What to put on a medication list",
      paragraphs: ["A good medication list answers the questions every doctor, pharmacist and ER nurse asks. For each medication, write down:"],
      numbered: [
        "The name on the label (brand and generic if both are shown)",
        "The strength, such as 10 mg",
        "How and when it's taken, copied from the label",
        "Who prescribed it, and what it's for",
        "The date it started",
      ],
      after: [
        "Then add over-the-counter medicines, vitamins and supplements, and any allergies. Leave nothing out because it seems minor. A daily aspirin or a sleep aid matters to the pharmacist.",
      ],
    },
    {
      title: "How to use the daily medication chart",
      paragraphs: [
        "Print one chart per week and keep it where the pills are. Whoever helps with a dose initials the box. When siblings take turns, the chart shows at a glance what's been taken today, with no group text needed.",
      ],
    },
    {
      title: "Keep it current",
      paragraphs: [
        "A medication list template only helps if it matches the pill bottles. Update the list the same day a medication starts, stops or changes, and note it in the Medication Changes Log. Ask the pharmacist to review the list whenever a medication changes.",
      ],
    },
    {
      title: "Printable PDF or a medication log app?",
      paragraphs: [
        "Apps work if the whole family uses the same one. Paper works for everyone, including Mom, the home health aide and the ER. Many families keep both: the printable list in the binder and wallet, and a shared sheet for day-to-day tracking.",
      ],
    },
  ],
  faq: [
    {
      q: "Is it really free?",
      a: "Yes. Enter your email and the PDF arrives in a minute. You'll also get our weekly emails, and you can unsubscribe anytime.",
    },
    {
      q: "Can I fill it in on my computer?",
      a: "Yes. It's a fillable PDF. Type in it with any PDF reader, including free Adobe Acrobat Reader, save it, and print as many copies as you need.",
    },
    {
      q: "Is there a Word or Excel version?",
      a: "The free list is a PDF. The Family Care System includes a Google Sheets medication tracker your siblings can share.",
    },
    { q: "What paper size is it?", a: "You get both US Letter (8.5 × 11 in) and A4." },
  ],
  legal: GENERAL_INFO_LINE,
  closingTitle: "Get the free medication list",
  thanks: {
    h1: "Your medication list is ready",
    line: "We've also emailed it to you. Check your spam folder if it isn't there in five minutes.",
  },
  email: {
    subject: "Your free Medication List & Daily Medication Chart",
    preheader: "Here's your printable list. Fill it in once, keep a copy in your wallet.",
    heading: "Your medication list is ready",
    text: "Your printable Medication List & Daily Medication Chart is ready. Print it, fill it in with your parent's medications exactly as prescribed, and keep the wallet card with you.",
    button: "Download the PDF",
    legal: MEDICATION_LEGAL_LINE,
  },
};

const CHECKLISTS_SUBHEAD =
  "Four printable checklists for the family caring for Mom or Dad: the daily routine, the big questions, the papers to find, and you.";

export const CHECKLISTS: LeadMagnet = {
  source: "caregiver-checklists",
  path: "/pages/caregiver-checklists",
  pdf: "/files/Parentkeeping-Free-Caregiver-Checklists.pdf",
  pdfA4: "/files/Parentkeeping-Free-Caregiver-Checklists-A4.pdf",
  seo: {
    title: "Free Printable Caregiver Checklists (Daily + Aging Parents)",
    description:
      "Free caregiver checklists: a daily checklist, 30 questions to ask aging parents, a finances & documents list and a self-care check. Fillable PDF.",
  },
  h1: "Free Printable Caregiver Checklists",
  subheads: { one_place: CHECKLISTS_SUBHEAD, fairness: CHECKLISTS_SUBHEAD },
  intro:
    "Made for adult children helping an aging parent. Print what you need or type straight into the PDF, then share a section with each sibling. 7 pages, fillable PDF, in US Letter and A4.",
  button: "Send me the checklists",
  noticeWhat: "the checklists",
  inside: {
    title: "What's inside the free PDF",
    items: [
      {
        title: "Caregiver Daily Checklist",
        text: "Morning, midday, afternoon and evening tick boxes with a note for each, mood and sleep, anything to mention to the doctor, and a handover note for tomorrow's helper.",
      },
      {
        title: "30 Questions to Ask Aging Parents",
        text: "Six questions each on health, daily life, money, home, and wishes & documents, with space to write the answers down.",
      },
      {
        title: "Finances & Documents Checklist",
        text: "14 papers to find, from the will to the Medicare card, each with a “found it” box and where it's kept. Never passwords or account numbers.",
      },
      {
        title: "Caregiver Self-Care Checklist",
        text: "A daily grid for the week, four weekly checks and a “people I can call” list, because the person doing the caring counts too.",
      },
    ],
  },
  previews: [
    { file: "checklists-page-1", title: "Caregiver Daily Checklist" },
    { file: "checklists-page-2", title: "30 Questions to Ask Aging Parents" },
    { file: "checklists-page-3", title: "Finances & Documents Checklist" },
    { file: "checklists-page-4", title: "Caregiver Self-Care Checklist" },
  ],
  article: [
    {
      title: "How to use a caregiver daily checklist",
      paragraphs: [
        "Print a week of copies and keep them with the medication chart. Whoever is on duty ticks what's done and writes one line for the next helper. At the end of the week you can see how things are going without a single phone call, and you'll spot changes, like skipped meals or poor sleep, early enough to mention to the doctor.",
        "The medicine lines only say “as listed on the medication chart”. The checklist never suggests what to give or when; that stays with your parent's doctors and pharmacist.",
      ],
      link: { label: "Need a medication chart? Get our free Medication List & Daily Medication Chart.", href: FREE_LIST_PATH },
    },
    {
      title: "Questions to ask aging parents, and when",
      paragraphs: [
        "Don't try to cover everything in one sitting. Pick one area per visit: health first, then daily life, money, home and wishes. Listen more than you talk, and write the answers down while you have them.",
      ],
      link: {
        label: "Our post on 8 things not to say to your aging parents covers how to phrase the hard ones.",
        href: "/blogs/guides/things-not-to-say-to-aging-parents",
      },
    },
    {
      title: "Which documents to find first",
      paragraphs: [
        "The finances and documents checklist covers the 14 papers families most often need in a hurry: bank and card accounts, bills, Social Security and pension, Medicare and insurance cards, tax returns, the will, any trust, both powers of attorney, the advance directive, the deed or lease, the car title, an online accounts list and the safe deposit box.",
        "Write down where each one is kept, not what's in it. Never put passwords, PINs or account numbers on the page. Keep originals somewhere safe and copies in the binder.",
      ],
    },
    {
      title: "A caregiver self-care checklist that takes two minutes",
      paragraphs: [
        "Tick four things each day: sleep, real meals, moving, and a few minutes that were just yours. Once a week, check that you talked to a friend about something else, kept your own appointments, asked for help with one thing and said no to one thing.",
        QUIZ_RESULT_FOOTER,
      ],
    },
    {
      title: "A caring for aging parents checklist for siblings",
      paragraphs: [
        "Checklists are easier to share than worries. Once the list exists, each sibling can take a section. That's the idea behind the job board in the Family Care System.",
      ],
      link: { label: "See the Family Care System", href: "/products/family-care-system" },
    },
  ],
  faq: [
    {
      q: "Are the checklists really free?",
      a: "Yes. Enter your email and the PDF arrives in a minute. You'll also get our weekly emails, and you can unsubscribe anytime.",
    },
    {
      q: "Can I fill them in on my computer?",
      a: "Yes. It's a fillable PDF. Type in it with any PDF reader, including free Adobe Acrobat Reader, or print the pages blank and write by hand.",
    },
    { q: "What paper size is it?", a: "You get both US Letter (8.5 × 11 in) and A4." },
    {
      q: "Can my siblings use them?",
      a: "Yes. Print as many copies as you need and share them with relatives who help care for the same parent. Please don't resell or repost the file.",
    },
    { q: "Is there a questions to ask aging parents checklist PDF?", a: "Yes. The 30 questions are one of the four checklists in the download." },
  ],
  legal: GENERAL_INFO_LINE,
  closingTitle: "Get the free checklists",
  thanks: {
    h1: "Your checklists are ready",
    line: "We've also emailed them to you. Check your spam folder if they aren't there in five minutes.",
  },
  email: {
    subject: "Your free Caregiver Checklists",
    preheader: "Four printable checklists: daily care, questions to ask, finances and documents, and you.",
    heading: "Your checklists are ready",
    text: "Your printable Caregiver Checklists are ready: the daily checklist, 30 questions to ask aging parents, the finances and documents checklist, and a weekly self-care check.",
    button: "Download the PDF",
    legal: GENERAL_INFO_LINE,
  },
};

export const LEAD_MAGNETS: Record<string, LeadMagnet> = { [FREE_LIST.source]: FREE_LIST, [CHECKLISTS.source]: CHECKLISTS };
