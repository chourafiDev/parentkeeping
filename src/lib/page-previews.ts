// "Look inside" carousel (home + product pages): one tab per part, one card
// per section, so visitors see what they're buying before they buy it.
//
// Images: public/images/pages/<group>/<slug>.webp (or .jpg / .png), square
// on #f5f5f5 so they fill the card. Until a file is there, the page is drawn
// (DocMockup). Never use AI-made page images: they must be the real pages.

import type { DocKind } from "@/app/(store)/_components/home/doc-mockup";
import { PRODUCT_COPY } from "./product-copy";

export type PreviewPage = { name: string; text: string; slug: string };
/** `product` is the full product name, used in each card's alt text. */
export type PreviewGroup = { id: string; label: string; product: string; kind: DocKind; pages: PreviewPage[] };

/** "“Who does what” page" → "who-does-what-page". */
export const pageSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const fromCopy = (slug: string) =>
  PRODUCT_COPY[slug].inside.items.map((i) => ({ name: i.name, text: i.text, slug: pageSlug(i.name) }));

// The four System parts: word for word from "Parentkeeping What's Inside Cards".
// `slug` is the image file name in public/images/pages/<group>/.
export const PREVIEW_GROUPS: Record<string, PreviewGroup> = {
  "medical-binder": {
    id: "medical-binder",
    label: "Medical Binder",
    product: "Medical Binder for an Elderly Parent",
    kind: "binder",
    pages: [
      {
        slug: "binder-01-parent-at-a-glance",
        name: "Parent at a Glance",
        text: "About Mom or Dad, emergency contacts, family and helpers, daily routines, and an \"About me\" page for new aides and hospital staff.",
      },
      { slug: "binder-02-health-history", name: "Health History", text: "Conditions, surgeries and hospital stays, allergies, vaccinations, equipment and supplies." },
      {
        slug: "binder-03-care-team",
        name: "Care Team",
        text: "Doctors and specialists with phone numbers, patient portals and what each one handles, plus pharmacy and other services.",
      },
      {
        slug: "binder-04-medications-refills",
        name: "Medications & Refills",
        text: "Prescription and over-the-counter lists, a daily medication chart, a changes log, a refill tracker and fold-over wallet cards. Bring it to appointments for the pharmacist to review.",
      },
      {
        slug: "binder-05-appointments-visits",
        name: "Appointments & Visits",
        text: "Month at a glance, an appointment log with \"who's driving\", visit prep and notes, tests and referrals.",
      },
      {
        slug: "binder-06-daily-care",
        name: "Daily Care",
        text: "Weekly care schedule, daily care log with a handover note, meals and sleep, health readings, symptoms, falls and incidents.",
      },
      { slug: "binder-07-hospital-stay", name: "Hospital Stay", text: "A hospital bag checklist, stay notes and the questions to ask before discharge." },
      {
        slug: "binder-08-insurance-costs-paperwork",
        name: "Insurance, Costs & Paperwork",
        text: "Medicare and other plans, an insurance call log, bills, medical expenses, mileage, and where important documents are kept (power of attorney, advance directive, will), without storing the originals.",
      },
      {
        slug: "binder-09-sharing-the-care",
        name: "Sharing the Care",
        text: "A \"Who does what\" page that names who handles refills, rides, bills and calls, a 10-minute Sunday check-in, a family update log and a backup plan. Plus notes pages, printable tab labels and a spine label.",
      },
    ],
  },
  "care-sheet": {
    id: "care-sheet",
    label: "Shared Care Sheet",
    product: "Shared Family Care Sheet",
    kind: "sheet",
    pages: [
      {
        slug: "sheet-01-dashboard",
        name: "Dashboard",
        text: "Everything that needs attention this week at a glance: overdue jobs, the next appointments, refill dates and this month's costs and hours. It fills itself in.",
      },
      {
        slug: "sheet-02-job-board-rota",
        name: "Job Board & Weekly Rota",
        text: "Every recurring job gets an owner, a backup and a due date, flagged when it's overdue. The rota shows who covers mornings, afternoons, evenings and nights, with a color for each helper.",
      },
      {
        slug: "sheet-03-care-hours",
        name: "Care Hours",
        text: "A simple log of the time each person spends on care, from a pharmacy run to a weekend visit. It works on any phone.",
      },
      {
        slug: "sheet-04-shared-costs",
        name: "Shared Costs",
        text: "What was paid, by whom, and whether the family shares it. Costs paid from Mom or Dad's own money are tracked but never split.",
      },
      {
        slug: "sheet-05-fair-share",
        name: "Fair Share",
        text: "Each helper's share of the costs, who owes whom, and a settle-up grid, with hours, jobs and rota slots side by side. Split equally or your own way.",
      },
      {
        slug: "sheet-06-medications-appointments",
        name: "Medications & Appointments",
        text: "Medicines as written on the label, refill dates and who picks up. Appointments with who drives, who goes in, what to ask and what was said.",
      },
      {
        slug: "sheet-07-care-team-documents",
        name: "Care Team & Documents",
        text: "Doctors, pharmacy, agencies and neighbors in one list, plus where every important paper is kept and when it needs renewing. Never passwords.",
      },
      {
        slug: "sheet-08-updates-options",
        name: "Family Updates & Care Options",
        text: "A running log of Sunday check-ins and decisions, a side-by-side comparison of home care and a move, and an optional Monthly Money tab.",
      },
    ],
  },
  "caregiver-agreement": {
    id: "caregiver-agreement",
    label: "Caregiver Agreement",
    product: "Family Caregiver Agreement Template",
    kind: "agreement",
    pages: [
      {
        slug: "agreement-01-talk-first",
        name: "Before You Sign, Talk First",
        text: "Six questions to settle as a family: what care is needed, how many hours, what it's worth, who decides, and what happens when health changes.",
      },
      {
        slug: "agreement-02-attorney-questions",
        name: "Questions for an Elder-Law Attorney",
        text: "A tick list of 14 questions about Medicaid, pay, taxes and notarizing, plus space for the appointment and the answers.",
      },
      {
        slug: "agreement-03-the-agreement",
        name: "The Agreement, in Plain Words",
        text: "17 short sections with blanks: who is involved, the care and hours, live-in terms, pay and a fair rate, backup care, emergencies, privacy, changes and ending it.",
      },
      {
        slug: "agreement-04-signatures",
        name: "Signatures",
        text: "Space for the parent or their agent, the caregiver, witnesses, a notary and the attorney's review, plus an optional line for siblings to say they've read it.",
      },
      {
        slug: "agreement-05-time-payment-logs",
        name: "Time & Payment Logs",
        text: "Hours and tasks for each day of care, and a line for every payment and expense. These are the records that show the arrangement clearly later.",
      },
      {
        slug: "agreement-06-what-we-agreed",
        name: "What We Agreed",
        text: "A one-page summary to send each sibling, so everyone hears the plan from you and nobody finds out later.",
      },
    ],
  },
  "meeting-kit": {
    id: "meeting-kit",
    label: "Family Meeting Kit",
    product: "Family Meeting Kit",
    kind: "meeting",
    pages: [
      {
        slug: "kit-01-before-you-invite",
        name: "Before You Invite Everyone",
        text: "Who to invite, when and where, the one rule for the room, and a short invite you can copy and send.",
      },
      {
        slug: "kit-02-prep-sheet",
        name: "Prep Sheet",
        text: "Each sibling writes down what they do, what they pay for and what worries them, before the meeting. It takes about 15 minutes.",
      },
      {
        slug: "kit-03-the-agenda",
        name: "The Agenda",
        text: "A 45-minute meeting in four parts: where Mom or Dad are now, what needs doing, who takes what, and money and the next check-in.",
      },
      {
        slug: "kit-04-what-to-say",
        name: "What to Say",
        text: "Opening lines, calmer ways to say the hard things, and what to do if it gets heated or someone says no.",
      },
      {
        slug: "kit-05-jobs-decisions",
        name: "Jobs & Decisions",
        text: "Every job gets a name, how often and a backup before anyone leaves. How costs are shared, or when you'll decide.",
      },
      {
        slug: "kit-06-after-the-meeting",
        name: "After the Meeting",
        text: "A summary to send within two days, ideas for a sibling far away or an only child, and how to keep the plan going.",
      },
    ],
  },
  "emergency-binder": {
    id: "emergency-binder",
    label: "Emergency Binder",
    product: "Emergency Binder for an Aging Parent",
    kind: "binder",
    pages: fromCopy("emergency-binder"),
  },
};

/** Which groups each product page shows (the System: its four parts, in OFFER_PARTS order). */
export const PREVIEWS_BY_PRODUCT: Record<string, string[]> = {
  "family-care-system": ["medical-binder", "care-sheet", "caregiver-agreement", "meeting-kit"],
  "medical-binder": ["medical-binder"],
  "caregiver-agreement": ["caregiver-agreement"],
  "emergency-binder": ["emergency-binder"],
};

