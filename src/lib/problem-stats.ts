// "The problem" tabs (home and the System's page). Approved; every figure was
// checked against its source (Oct 2026). Re-check the source before changing a
// figure, and keep the source line.

export type StatSource = { label: string; href: string };

export type ProblemTab = {
  tab: string;
  stat: string;
  /** The sentence the stat starts. */
  text: string;
  source: StatSource;
  /** How Parentkeeping answers it. */
  answer: string;
};

const CAREGIVING_IN_THE_US_2025: StatSource = {
  label: "AARP and National Alliance for Caregiving, Caregiving in the US 2025",
  href: "https://doi.org/10.26419/ppi.00373.003",
};
const OUT_OF_POCKET_2021: StatSource = {
  label: "AARP, Caregiving Out-of-Pocket Costs Study, 2021",
  href: "https://www.aarp.org/pri/topics/ltss/family-caregiving/family-caregivers-cost-survey/",
};

export const PROBLEM_TITLE = "The caring isn't the hardest part. Carrying it alone is.";
export const PROBLEM_SUBTITLE = "What family caregivers across the US report, from the national surveys.";

export const PROBLEM_TABS: ProblemTab[] = [
  {
    tab: "One person carries it",
    stat: "27 hours",
    text: "a week is how long family caregivers spend on care, on average. About 1 in 4 (24%) give 40 hours or more.",
    source: CAREGIVING_IN_THE_US_2025,
    answer: "The job board in the Shared Family Care Sheet puts a name and a date beside every task, so the hours can be split.",
  },
  {
    tab: "Help is uneven",
    stat: "53%",
    text: "of family caregivers have any unpaid help at all. Nearly half have none.",
    source: CAREGIVING_IN_THE_US_2025,
    answer: "The Family Meeting Kit turns “let me know if you need anything” into named jobs, agreed at one table.",
  },
  {
    tab: "It all lives in your head",
    stat: "64%",
    text: "of family caregivers talk with their care recipient's doctors and other providers, and 70% keep track of their health.",
    source: CAREGIVING_IN_THE_US_2025,
    answer: "The Medical Binder puts medications, doctors and appointments on paper anyone in the family can pick up.",
  },
  {
    tab: "Costs nobody tracks",
    stat: "$7,242",
    text: "a year is what family caregivers with out-of-pocket costs spend on caregiving, on average. Nearly 8 in 10 have those costs.",
    source: OUT_OF_POCKET_2021,
    answer: "The cost tracker shows who paid what, so the money conversation starts from facts instead of memory.",
  },
];
