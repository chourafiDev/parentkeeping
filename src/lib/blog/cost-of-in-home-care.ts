import type { Post } from "./types";

// Figures: CareScout's 2025 Cost of Care Survey (published March 2026).
// Update them each spring when the new survey comes out (next: ~March 2027).
export const costOfInHomeCare: Post = {
  slug: "cost-of-in-home-care",
  title: "Cost of In-Home Care for Elderly Parents (and Who Pays)",
  seo: {
    title: "Cost of In-Home Care for Elderly Parents (and Who Pays)",
    description: "What in-home care for an elderly parent costs per hour and per year, what Medicare and Medicaid cover, and how families split the bill.",
  },
  category: "Costs",
  tags: ["In-home care", "Medicare", "Splitting costs"],
  publishedAt: "2026-10-12",
  sources: [
    "CareScout Releases 2025 Cost of Care Survey Results, Business Wire, March 2026",
    "CareScout 2025 median cost data tables (PDF)",
    "Home health services, Medicare.gov",
    "A Caregiver's Journey: Getting Paid to Care for Family, AARP Foundation",
    "Eldercare Locator, ACL",
  ],
  body: [
    {
      type: "p",
      text: "The national median cost of in-home care for an elderly parent is $35 an hour for a non-medical caregiver, according to CareScout's 2025 Cost of Care Survey. At 44 hours a week, that's about $80,080 a year (CareScout).",
    },
    {
      type: "p",
      text: "Most families don't start at 44 hours, though. And most are surprised by how little Medicare pays toward it. Here's what in-home care really costs, what changes the price, and who pays.",
    },
    { type: "h2", text: "How much does in-home care cost for the elderly?" },
    {
      type: "p",
      text: "In-home care usually means a non-medical caregiver (sometimes called a home health aide, homemaker or companion) who helps with bathing, dressing, meals, housekeeping, errands and company. CareScout now reports homemakers and home health aides as one category because their prices have converged.",
    },
    { type: "p", text: "What that costs at the 2025 national median of $35 an hour:" },
    {
      type: "table",
      head: ["Schedule", "Per week", "Per month (approx.)", "Per year"],
      rows: [
        ["10 hours a week (a few short visits)", "$350", "$1,517", "$18,200"],
        ["20 hours a week (4 hours, weekdays)", "$700", "$3,033", "$36,400"],
        ["44 hours a week (full-time)", "$1,540", "$6,673", "$80,080"],
        ["Around the clock, hourly (168 hours)", "$5,880", "$25,480", "$305,760"],
      ],
      note: "Monthly figures are the yearly cost divided by 12. Round-the-clock care billed by the hour is rare; agencies often quote a lower daily rate for live-in care, where the caregiver sleeps at the home. Ask for both.",
    },
    { type: "h3", text: "Skilled care at home costs more" },
    {
      type: "p",
      text: "If your parent needs a nurse (for wound care, injections or monitoring), CareScout's 2025 national median for a private duty nurse is $90 an hour, or $160 per visit for short task-based visits.",
    },
    { type: "signup", magnet: "checklists" },
    { type: "h2", text: "How it compares with other options" },
    {
      type: "table",
      head: ["Type of care", "2025 national median"],
      rows: [
        ["In-home non-medical caregiver", "$35 an hour"],
        ["Adult day health care", "$95 a day ($24,700 a year, 5 days a week)"],
        ["Assisted living (private one-bedroom)", "$6,200 a month ($74,400 a year)"],
        ["Nursing home, semi-private room", "$315 a day ($114,975 a year)"],
        ["Nursing home, private room", "$355 a day ($129,575 a year)"],
      ],
      note: "Source: CareScout 2025 median cost tables.",
    },
    {
      type: "p",
      text: "In-home care is usually the cheaper option for part-time help. Once a parent needs help most of the day and night, assisted living or a nursing home can cost less than paying for care hour by hour.",
    },
    { type: "h2", text: "What changes the price" },
    {
      type: "ul",
      items: [
        "**Where your parent lives.** Hourly medians in 2025 ranged from $24 in Mississippi to $46 in Wyoming. Look up your state in the CareScout tables.",
        "**Agency or independent caregiver.** Agencies cost more but handle background checks, payroll, insurance and backup when a caregiver is sick. Hiring directly costs less, but you become the employer.",
        "**Minimum shifts.** Many agencies require 3- or 4-hour minimum visits.",
        "**Nights, weekends and holidays** often carry a higher rate.",
        "**Level of care.** Help with dementia, lifting or two-person transfers may cost more.",
      ],
    },
    { type: "h2", text: "Does Medicare cover in-home care for the elderly?" },
    {
      type: "p",
      text: "Only a narrow kind. Medicare pays for home health care, which is skilled, short-term care for an illness or injury, not ongoing help with daily life.",
    },
    {
      type: "p",
      text: "According to Medicare.gov, your parent may qualify if a doctor orders the care, they're homebound, and they need part-time or intermittent skilled nursing or therapy. When they qualify, they pay nothing for covered services, and a home health aide can be covered too, but only alongside that skilled care. Coverage is usually limited to a combined 8 hours a day and 28 hours a week.",
    },
    { type: "p", text: "Medicare doesn't pay for:" },
    {
      type: "ul",
      items: [
        "24-hour care at home",
        "Homemaker services like shopping and cleaning that aren't part of the care plan",
        "Personal care (bathing, dressing, using the bathroom) when that's the only care needed",
        "Meal delivery",
      ],
    },
    {
      type: "p",
      text: "In other words, the help most families are looking for, someone to be with Mom and help her through the day, is usually not covered by Original Medicare. If your parent has a Medicare Advantage plan, call and ask whether it includes any extra in-home support benefits; some plans offer limited hours.",
    },
    { type: "h2", text: "Who pays for in-home care?" },
    {
      type: "p",
      text: "**1. Your parent's own money.** Most in-home care is paid privately, from savings, pensions, Social Security or home equity. If your parent has long-term care insurance, check the policy now: what triggers benefits, the daily maximum and any waiting period.",
    },
    {
      type: "p",
      text: "**2. Medicaid.** For parents with limited income and assets, every state's Medicaid program covers some home and community-based services. Many programs let the person direct their own care and hire a family member as the paid caregiver (AARP Foundation). Eligibility rules differ by state, many programs require a nursing-home level of care, and some have waitlists. Your local Area Agency on Aging can explain your state's options; find it through the Eldercare Locator at 1-800-677-1116.",
    },
    {
      type: "p",
      text: "**3. Veterans' benefits.** If your parent or their late spouse served, ask the VA about pension benefits for help at home and about Veteran Directed Care, which can pay for home services the veteran directs, including a family caregiver.",
    },
    {
      type: "p",
      text: "**4. The family.** This is where it gets hard. In many families, one sibling gives the time, another gives money, and a third gives neither. Nobody has written any of it down.",
    },
    { type: "h2", text: "How siblings can split the cost fairly" },
    {
      type: "p",
      text: "Money is the topic families avoid longest, and it's usually the one that does the most damage when it finally comes up. A few ground rules help:",
    },
    {
      type: "ul",
      items: [
        "Put every cost in one place that everyone can see: the agency invoices, the pharmacy, the groceries, the gas money.",
        "Count time as well as money. The sister who covers 15 hours a week of care is contributing, even if she sends no checks.",
        "Agree on the split out loud, whether that's equal shares, by income, or time-for-money. Then write it down.",
        "If a family member is paid for care, put it in a written [caregiver agreement](/products/caregiver-agreement-template) reviewed by an elder-law attorney. Payments made without one may be treated as gifts if your parent later applies for Medicaid, which can affect eligibility.",
        "Talk to a professional about taxes. Some care costs may be deductible, and a paid family caregiver may owe tax on that income.",
      ],
    },
    {
      type: "cta",
      title: "Make the costs visible.",
      text: [
        "The Parentkeeping Family Care System includes a shared Google Sheet with a cost tracker that shows each sibling's share, a job board for who does what, and the Family Caregiver Agreement Template to take to your attorney if anyone is being paid. One price, no app, no subscription.",
      ],
      button: { label: "See the Family Care System", href: "/products/family-care-system" },
    },
    { type: "signup", magnet: "checklists" },
    {
      type: "small",
      text: "General information only, not financial, legal or tax advice. Costs and program rules change and vary by state, so check with the professionals involved in your parent's care.",
    },
  ],
};
