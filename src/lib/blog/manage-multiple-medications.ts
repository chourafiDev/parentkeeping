import type { Post } from "./types";

export const manageMultipleMedications: Post = {
  slug: "manage-multiple-medications",
  title: "How to Manage Multiple Medications for an Elderly Parent",
  seo: {
    title: "How to Manage Multiple Medications for an Elderly Parent",
    description:
      "Seven practical steps to keep track of an elderly parent's medications: one master list, one pharmacy, a brown-bag review and a shared chart.",
  },
  category: "Medications",
  tags: ["Medication management", "Prescriptions", "Medication tracking"],
  publishedAt: "2026-10-12",
  sources: [
    "Polypharmacy among adults aged 65 years and older in the United States: 1988–2010",
    "Medication Therapy Management in Medicare Part D, NCOA",
  ],
  body: [
    {
      type: "p",
      text: "First it was one blood pressure pill. Now there are eight bottles on Mom's counter, two of them look almost the same, and a new specialist just added a ninth.",
    },
    {
      type: "p",
      text: "You're not imagining it. In a national study, the share of Americans 65 and older taking five or more prescription medications tripled between 1988 and 2010, to about 39% (Charlesworth et al., Journals of Gerontology). More medications means more refills, more doctors who don't talk to each other, and more ways for something to slip.",
    },
    {
      type: "p",
      text: "Here's how to manage multiple prescriptions effectively without carrying it all in your head. None of this replaces the doctor or pharmacist. It's how you keep track, so you can bring them the right information.",
    },
    { type: "h2", text: "1. Make one master medication list" },
    { type: "p", text: "Every good medication management system starts with a single list. Not three lists in three notebooks. One." },
    {
      type: "p",
      text: "For each medication, write the name on the label, the strength, how it's taken (copied exactly from the label), who prescribed it, what it's for and the date it started. Then add every over-the-counter medicine, vitamin and supplement. Pharmacists need to know about the daily aspirin and the sleep aid too.",
    },
    {
      type: "p",
      text: "Our [free printable Medication List](/pages/free-medication-list) has these columns ready, plus a page for allergies and doctors.",
    },
    { type: "signup", magnet: "medication-list" },
    { type: "h2", text: "2. Do a brown-bag review" },
    {
      type: "p",
      text: "Put every bottle in the house, prescription and not, into a bag and take it to the pharmacist or the primary doctor. Ask them to compare the bottles with your list and with what each doctor thinks your parent takes.",
    },
    {
      type: "p",
      text: "This is where duplicates, expired bottles and “I stopped that months ago” turn up. Do it at least once a year, and any time a hospital stay or new specialist changes things.",
    },
    { type: "p", text: "Questions to bring:" },
    {
      type: "ul",
      items: [
        "Are any of these doing the same job?",
        "Is there anything here she no longer needs?",
        "Which ones should never be taken together, or with food or alcohol?",
        "What side effects should we tell you about?",
      ],
    },
    { type: "h2", text: "3. Use one pharmacy" },
    {
      type: "p",
      text: "When all prescriptions go through one pharmacy, its system can flag interactions across every doctor's orders. Split them across a big-box pharmacy, a mail-order plan and a specialist's in-house dispensary, and nobody sees the whole picture.",
    },
    {
      type: "p",
      text: "While you're there, ask about refill synchronization. Many pharmacies can line refills up so they're ready on the same day each month, which means one trip instead of five.",
    },
    { type: "h2", text: "4. Ask about Medicare's free medication review" },
    {
      type: "p",
      text: "If your parent has a Medicare Part D drug plan and takes several medications for chronic conditions, they may qualify for the plan's Medication Therapy Management program. It typically includes a one-on-one comprehensive medication review with a pharmacist and a written medication list and action plan, at no extra cost. Each plan sets its own criteria, often based on the number of medications, chronic conditions and yearly drug costs (NCOA). Call the number on the plan card and ask.",
    },
    { type: "h2", text: "5. Build a simple weekly routine" },
    { type: "p", text: "Medication management tips only work if they fit into a real week. A few that families use:" },
    {
      type: "ul",
      items: [
        "**One person fills the pill organizer** on the same day each week, from the master list. Ask the pharmacist whether a weekly organizer suits your parent's medications, or whether the pharmacy offers pre-packaged doses.",
        "**A daily chart by the pills.** Whoever helps with a dose initials the box. No more “Did Dad take his evening ones?” texts.",
        "**A Sunday check-in.** Ten minutes to look at the chart, the refill dates and the week's appointments.",
      ],
    },
    { type: "h2", text: "6. Log every change the same day" },
    {
      type: "p",
      text: "An out-of-date list is worse than no list. When a doctor starts, stops or changes a medication, update the master list that day and note what changed, when and who said so. Tell whoever fills the organizer. Then throw the old list away so nobody uses it by mistake.",
    },
    {
      type: "p",
      text: "After any hospital stay, ask for the discharge medication list and go through it with the pharmacist before restarting the old routine. Hospital stays are a common time for medications to change.",
    },
    { type: "h2", text: "7. Share it, so it isn't all on you" },
    { type: "p", text: "Medication tracking for parents usually falls to one sibling. That works until she's sick, traveling or simply worn out." },
    { type: "p", text: "Give the job a structure the whole family can see:" },
    {
      type: "ul",
      items: [
        "One person owns the master list. Everyone else can read it.",
        "Name who handles refills, who does the weekly organizer and who goes to appointments.",
        "Keep the list where anyone can find it: in a binder at your parent's home, in their wallet, and in a shared sheet.",
      ],
    },
    { type: "h2", text: "When to call the doctor or pharmacist" },
    {
      type: "p",
      text: "Call promptly if you notice new confusion, dizziness, falls, unusual sleepiness, or a change in eating or mood, especially after a medication change. Don't stop or change a medication on your own. Write down what you saw and when, and bring the list.",
    },
    { type: "p", text: "In an emergency, call 911." },
    { type: "h2", text: "Apps or paper?" },
    {
      type: "p",
      text: "A medication reminder app can help if your parent uses a smartphone confidently. But apps don't help the ER nurse, the home health aide or the brother who never installed it. Most families do best with paper for the house and the wallet, plus one shared sheet for the people helping.",
    },
    {
      type: "signup",
      magnet: "medication-list",
      title: "Start with the list.",
      text: [
        "Get our free printable Medication List & Daily Medication Chart: the master list, a weekly chart to initial, a changes log and two wallet cards.",
        "When you're ready for the rest (doctors, appointments, insurance and a “Who does what” page), see the [Medical Binder for an Elderly Parent](/products/medical-binder), or the [Family Care System](/products/family-care-system) with a shared Google Sheet for medications, jobs and costs.",
      ],
    },
    {
      type: "small",
      text: "General information only. Every family's situation is different, so check with the professionals involved in your parent's care. Parentkeeping products are organizing tools, not medical advice.",
    },
  ],
};
