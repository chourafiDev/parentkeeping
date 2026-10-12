// Free downloads (email sign-up → PDF), word for word from the Phase 1 page
// copy. Each has its own page, thank-you page, subscriber source and PDF.

import { FREE_LIST_PATH, FREE_LIST_PDF, FREE_LIST_SOURCE } from "./free-list";
import { GENERAL_INFO_LINE, MEDICATION_LEGAL_LINE } from "./legal";
import type { FaqItem } from "./offer";
import type { CopySection } from "./product-copy";

export type LeadMagnet = {
  /** Stored on the subscriber (first sign-up wins). */
  source: string;
  path: string;
  /** Public, unlisted file (it's free): shown on the thank-you page and in the email. */
  pdf: string;
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
  seo: {
    title: "Free Printable Medication List & Daily Medication Chart",
    description: "Free printable medication list template and daily medication chart for an elderly parent. Fillable PDF with wallet cards, sent to your inbox.",
  },
  h1: "Free Printable Medication List & Daily Medication Chart",
  subheads: {
    one_place: "Stop carrying your parent's care in your head.",
    fairness: "One medication list the whole family can see, so it doesn't all sit with you.",
  },
  intro:
    "A free medication list template made for adult children keeping track of a parent's medications. Fill it in on your computer or print it, bring it to every appointment, and keep a copy in Mom's wallet. Nine pages, US Letter, fillable PDF.",
  button: "Send me the free list",
  noticeWhat: "the list",
  inside: {
    title: "What's inside the free PDF",
    items: [
      { title: "About Mom or Dad", text: "Allergies, conditions, doctors, pharmacy and emergency contacts on one page." },
      { title: "Prescription Medication List", text: "Name, strength, how it's taken, prescriber and why, exactly as the label says." },
      { title: "Over-the-Counter & Supplements list", text: "The vitamins and pain relievers doctors always ask about and families forget." },
      {
        title: "Daily Medication Chart",
        text: "One week per page, with a box to initial each dose, so two people never wonder “did she already take it?”",
      },
      { title: "Medication Changes Log", text: "What changed, when and who said so." },
      { title: "Two fold-over wallet cards", text: "A free printable medication list for a wallet or purse, for the ER or a new specialist." },
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
        "A medication list template only helps if it matches the pill bottles. Update the list the same day a medication starts, stops or changes, and note it in the Medication Changes Log. Ask the pharmacist to review the whole list at least once a year and whenever something changes.",
      ],
    },
    {
      title: "Printable PDF or a medication log app?",
      paragraphs: [
        "Apps are useful if the whole family uses the same one. Paper works for everyone, including Mom, the home health aide and the ER. Many families keep both: the printable medication list in the binder and wallet, and a shared sheet for day-to-day tracking.",
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
      a: "Yes. It's a fillable PDF. Type in it with any PDF reader, save it, then print as many copies as you need.",
    },
    {
      q: "Is there a Word or Excel version?",
      a: "The free list is a PDF. The paid Family Care System includes a Google Sheets medication tracker your siblings can share.",
    },
    { q: "What paper size is it?", a: "US Letter (8.5 × 11 in). It also prints on A4." },
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
  "A caregiver daily checklist template, plus the aging-parent checklists that get the big conversations started. Four printable pages, free.";

export const CHECKLISTS: LeadMagnet = {
  source: "caregiver-checklists",
  path: "/pages/caregiver-checklists",
  pdf: "/files/Parentkeeping-Free-Caregiver-Checklists.pdf",
  seo: {
    title: "Free Printable Caregiver Checklists (Daily + Aging Parents)",
    description: "Free printable caregiver daily checklist template, plus aging-parent checklists: questions to ask, finances and documents. PDF by email.",
  },
  h1: "Free Printable Caregiver Checklists",
  subheads: { one_place: CHECKLISTS_SUBHEAD, fairness: CHECKLISTS_SUBHEAD },
  button: "Send me the checklists",
  noticeWhat: "the checklists",
  inside: {
    title: "What's inside",
    items: [
      {
        title: "Caregiver Daily Checklist",
        text: "A free printable caregiver daily checklist for an elderly parent, morning to night, so whoever's on duty knows what's done.",
      },
      {
        title: "Questions to Ask Aging Parents",
        text: "30 questions about health, money, home and wishes, grouped so you can cover one area per visit.",
      },
      { title: "Aging Parents Finances & Documents Checklist", text: "The accounts, bills and papers to locate before you need them." },
      { title: "Caregiver Self-Care Checklist", text: "A weekly check on you, because the person doing the caring counts too." },
    ],
  },
  previews: [
    { file: "checklists-page-1", title: "Caregiver Daily Checklist" },
    { file: "checklists-page-2", title: "Questions to Ask Aging Parents" },
  ],
  article: [
    {
      title: "How to use a caregiver daily checklist",
      paragraphs: [
        "Print a week of pages and keep them with the medication chart. Each person who helps ticks what they did and adds a note. At the end of the week you can see what's happening without a single phone call, and you'll spot changes, like skipped meals or poor sleep, early enough to mention to the doctor.",
      ],
    },
    {
      title: "Questions to ask aging parents, and when",
      paragraphs: [
        "Don't try to cover everything in one sitting. Pick one area per visit: health and doctors first, then money, then the home, then wishes. Ask open questions, listen more than you talk, and write down the answers while you have them.",
      ],
      link: {
        label: "Our post on 8 things not to say to your aging parents covers how to phrase the hard ones.",
        href: "/blogs/guides/things-not-to-say-to-aging-parents",
      },
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
    { q: "Are the checklists really free?", a: "Yes. Enter your email and they arrive in a minute." },
    { q: "Can I edit them?", a: "They're fillable PDFs. Type in them or print them blank." },
    { q: "Is there a questions to ask aging parents checklist PDF?", a: "Yes, it's one of the four checklists in the download." },
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
    text: "Your printable Caregiver Checklists are ready: the daily checklist, questions to ask aging parents, the finances and documents checklist, and a weekly self-care check.",
    button: "Download the PDF",
    legal: GENERAL_INFO_LINE,
  },
};

export const LEAD_MAGNETS: Record<string, LeadMagnet> = { [FREE_LIST.source]: FREE_LIST, [CHECKLISTS.source]: CHECKLISTS };
