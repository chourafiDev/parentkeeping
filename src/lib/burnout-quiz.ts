// Caregiver Burnout Quiz, word for word from the Phase 1 page copy. The
// questions are original (not a validated clinical scale; never say they
// are). Legal rules: score in the browser, save no answers, no ad pixels on
// the page or its results, "not a diagnosis" before question 1, 988 on every result.

import { FREE_LIST_PATH } from "./free-list";
import type { CopySection } from "./product-copy";

export const QUIZ_PATH = "/pages/caregiver-burnout-quiz";
export const QUIZ_SOURCE = "caregiver-burnout-quiz";

export const QUIZ_SEO = {
  title: "Caregiver Burnout Quiz: A 2-Minute Self-Check",
  description: "A free 12-question caregiver burnout quiz. Scored privately in your browser, with practical next steps for your result. Not a diagnosis.",
};

export const QUIZ_INTRO = {
  h1: "Caregiver Burnout Quiz",
  subhead: "Twelve questions, about two minutes. A quick self-check to see how you're really doing, for the person who usually asks everyone else.",
  text: "Answer for the last two weeks. There are no right answers, and your answers never leave your browser.",
  button: "Start the quiz",
};

export const QUIZ_SCALE = [
  { label: "Never", value: 0 },
  { label: "Sometimes", value: 1 },
  { label: "Often", value: 2 },
  { label: "Almost always", value: 3 },
] as const;

export const QUIZ_QUESTIONS = [
  "I feel tired even after a full night's sleep.",
  "I think about Mom or Dad's care when I'm trying to rest or sleep.",
  "I'm the one who remembers the appointments, refills and paperwork.",
  "I feel the care is not shared fairly in my family.",
  "I've stopped doing things I used to enjoy because there's no time.",
  "I snap at people I love, then feel guilty about it.",
  "I feel I can't take a day off without something going wrong.",
  "I worry about money because of caregiving costs.",
  "I've put off my own doctor's appointments or health needs.",
  "I feel alone in this, even when people are around.",
  "I feel resentful, and then guilty for feeling resentful.",
  "I feel like I'm just getting through each day.",
];

/** A run of text, optionally a link (the copy's [bracketed] links). */
export type Segment = { text: string; href?: string };

const SYSTEM_PATH = "/products/family-care-system";

/** Score bands (score = sum of answers, 0 to 36). */
export const QUIZ_RESULTS: { min: number; max: number; title: string; text: string; next: Segment[] }[] = [
  {
    min: 0,
    max: 9,
    title: "Steady for now",
    text: "You're carrying a lot, and you're carrying it well. Protect what's working: keep one evening a week that's yours, and get the care details out of your head and onto paper before life gets busier.",
    next: [{ text: "Next step: " }, { text: "Get the free Medication List", href: FREE_LIST_PATH }, { text: " so one big piece is already in order." }],
  },
  {
    min: 10,
    max: 19,
    title: "Stretched",
    text: "The load is starting to show. That's normal when one person holds most of the details. The fastest relief is usually handing off one specific job, not “let me know if you need anything”.",
    next: [
      { text: "Next step: write down three jobs you do every week and ask one person to take one by name. The " },
      { text: "Family Care System", href: SYSTEM_PATH },
      { text: " has a job board for exactly this." },
    ],
  },
  {
    min: 20,
    max: 27,
    title: "Running on empty",
    text: "You're doing too much alone, for too long. This isn't a personal failing. It's a sign the work needs to be shared and that you need support too. Talk to your own doctor about how you're feeling, and look into respite care in your parent's area.",
    next: [
      { text: "Next step: call a family meeting this month. The Family Meeting Kit in the " },
      { text: "Family Care System", href: SYSTEM_PATH },
      { text: " gives you an agenda and the words to start." },
    ],
  },
  {
    min: 28,
    max: 36,
    title: "Overloaded",
    text: "Your answers say you're carrying more than one person should. Please talk to your doctor or a counselor soon, and tell someone in your family today, plainly, that you need help. You can also call the Eldercare Locator at 1-800-677-1116 to find local caregiver support and respite services.",
    next: [{ text: "Next step: pick one thing to put down this week. Everything else can wait." }],
  },
];

export const resultFor = (score: number) => QUIZ_RESULTS.find((r) => score >= r.min && score <= r.max) ?? QUIZ_RESULTS[0];

/** Optional email box under the result. Everyone gets the same email with all four plans. */
export const QUIZ_EMAIL_BOX = {
  title: "Want a copy of your result and a short plan for your band?",
  button: "Email me my result",
  checkbox: "Also send me Parentkeeping's weekly emails",
  smallPrint: "We store only your email. Your answers stay in your browser.",
};

/** SEO text below the quiz. */
export const QUIZ_ARTICLE: CopySection[] = [
  {
    title: "What is caregiver burnout?",
    paragraphs: [
      "Caregiver burnout is the physical and emotional exhaustion that can build when you care for someone for a long time with too little rest or help. It often creeps in slowly, so the people living it are the last to notice.",
    ],
  },
  {
    title: "Common signs of caregiver burnout",
    bullets: [
      { text: "Tiredness that sleep doesn't fix" },
      { text: "Irritability, then guilt about it" },
      { text: "Pulling away from friends and things you enjoy" },
      { text: "Putting your own health last" },
      { text: "Resentment toward family members who help less" },
      { text: "Feeling that nothing you do is enough" },
    ],
  },
  {
    title: "What helps",
    paragraphs: [
      "Share specific jobs instead of general asks. Write things down so you don't have to hold them all in your head. Take real breaks, even short ones, and use respite care if it's available. And talk to your doctor about how you're feeling. You matter in this too.",
    ],
  },
];

export const QUIZ_LINKS = [
  { label: "Free Medication List", href: FREE_LIST_PATH },
  { label: "Family Care System", href: SYSTEM_PATH },
];
