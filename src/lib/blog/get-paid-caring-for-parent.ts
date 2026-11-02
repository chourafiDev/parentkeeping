import type { Post } from "./types";

// Quotes 2026 figures: VA pension rates from Dec 1, 2025, the IRS $3,000
// household-wage threshold, Medicaid limits and the state paid leave list.
// Recheck every December (next: December 2026).
export const getPaidCaringForParent: Post = {
  slug: "get-paid-caring-for-parent",
  title: "How to Get Paid for Caring for an Elderly Parent: 6 Ways That Work",
  seo: {
    title: "How to Get Paid for Caring for an Elderly Parent (2026)",
    description:
      "Six real ways to get paid for caring for an elderly parent: Medicaid, VA, paid leave, insurance and a family care agreement. What each pays, and the catch.",
  },
  category: "Costs",
  tags: ["Getting paid", "Medicaid", "Caregiver agreement"],
  publishedAt: "2026-11-02",
  sources: [
    "Caregiving in the US 2025, AARP",
    "Medicaid's Home Care Support for Family Caregivers in 2025, KFF",
    "Waiting Lists for Medicaid HCBS 2016 to 2024, KFF",
    "Structured Family Caregiving, Medicaid Planning Assistance",
    "VA Caregiver Support, AARP",
    "Veteran Directed Care, VA",
    "Veterans Pension Rates, VA",
    "The Pitfalls of Paying Family Members to Provide Care, Special Needs Alliance",
    "Topic 756, Household Employees, IRS",
    "Medicaid Waiver Tax Exclusion Rules, NATP",
    "Paid Family Leave by State, OnPay",
    "FMLA Family Caregiver Leave, U.S. Department of Labor",
    "GUIDE Model, CMS",
  ],
  body: [
    {
      type: "p",
      text: "Yes, you can get paid for caring for an elderly parent. There are six real routes: Medicaid, a state structured family caregiving program, the VA, your parent paying you under a written agreement, long-term care insurance, and paid family leave. Which one fits depends on three things: your parent's income and savings, whether they're a veteran, and whether you're still working.",
    },
    {
      type: "p",
      text: "Most family caregivers are never paid at all. Of the 59 million Americans caring for an adult, only about 1.9 million are paid family caregivers, and 23% of caregivers say caregiving has put them in debt ([AARP, Caregiving in the US 2025](https://www.aarp.org/caregiving/basics/caregiving-in-us-survey-2025.html)). Often that's because nobody told them the options existed, or because the paperwork looked impossible.",
    },
    { type: "p", text: "This guide walks through each route: who qualifies, roughly what it pays, and the catch nobody mentions." },

    { type: "h2", text: "The six ways at a glance" },
    {
      type: "table",
      head: ["Route", "Best fit if your parent...", "What it pays", "The catch"],
      rows: [
        [
          "Medicaid self-directed care",
          "Has low income and savings and needs a lot of daily help",
          "An hourly wage set by your state",
          "Waiting lists in many states; strict money rules",
        ],
        [
          "Structured family caregiving",
          "Is on Medicaid and lives with you",
          "A daily stipend (about $40 to $72 a day in two 2026 examples)",
          "Only 11 states; you must live together",
        ],
        [
          "VA programs",
          "Is a veteran (or a veteran's surviving spouse, for pension)",
          "A monthly stipend, a care budget, or extra pension",
          "Strict service and disability rules",
        ],
        ["Your parent pays you", "Has savings or income to pay for care", "What you agree, at a fair market rate", "Needs a written agreement and payroll taxes"],
        ["Long-term care insurance", "Has a policy", "Depends on the policy", "Many policies won't pay family members"],
        ["Paid family leave", "(This one is about you) You work in a state with a program", "Part of your wages for several weeks", "Short term; not every state"],
      ],
    },
    { type: "signup", magnet: "checklists" },

    { type: "h2", text: "1. Medicaid self-directed care" },
    {
      type: "p",
      text: "This is the biggest source of pay for family caregivers. Every state's Medicaid program has home and community-based services (often called HCBS or “waiver” programs) that pay for help at home instead of a nursing home. Under the **self-directed** or **consumer-directed** option, your parent chooses their own caregiver, and that caregiver can be you.",
    },
    {
      type: "p",
      text: "In KFF's 2025 survey, every responding state said it pays family caregivers in at least some circumstances, and Alaska was the only one that doesn't offer self-direction at all ([KFF, January 2026](https://www.kff.org/medicaid/medicaids-home-care-support-for-family-caregivers-in-2025/)).",
    },
    { type: "p", text: "**Who qualifies.** Your parent, not you, has to qualify:" },
    {
      type: "ul",
      items: [
        "**Medical need:** usually a “nursing home level of care”, meaning they need hands-on help with daily activities like bathing, dressing or getting around.",
        "**Money:** low income and savings. In many states the 2026 limits are around $2,982 a month in income and $2,000 in countable assets for a single person, though rules and exceptions vary by state ([Medicaid Planning Assistance](https://www.medicaidplanningassistance.org/structured-family-caregiving/)).",
      ],
    },
    {
      type: "p",
      text: "**What it pays.** An hourly wage set by your state, paid through a payroll agent that also handles the taxes. Pay is usually close to what a home care aide earns locally.",
    },
    {
      type: "p",
      text: "**The catch.** Many states have waiting lists for these programs. In 2024 more than 710,000 people were on waiting or interest lists, and the average wait was 40 months ([KFF](https://www.kff.org/medicaid/a-look-at-waiting-lists-for-medicaid-home-and-community-based-services-from-2016-to-2024/)). If your parent might qualify, apply now, even if you don't need the help yet.",
    },
    {
      type: "p",
      text: "**How to start.** Call your local Area Agency on Aging (find it through the Eldercare Locator at 1-800-677-1116) or your state Medicaid office. Ask: “Does my mother's program have a self-directed option, and can a family member be the paid caregiver?”",
    },

    { type: "h2", text: "2. Structured family caregiving" },
    {
      type: "p",
      text: "Some states pay a daily stipend to a family member who lives with a parent on Medicaid and provides their daily care. In 2026 the program runs in 11 states: Connecticut, Georgia, Indiana, Louisiana, Massachusetts, Missouri, Nevada, North Carolina, Ohio, Rhode Island and South Dakota, with a similar program in North Dakota.",
    },
    {
      type: "p",
      text: "Medicaid pays a daily rate to an agency, and the caregiver gets a share of it. Two examples from July 2026: in Missouri the caregiver receives at least 65% of $110.33 a day (about $72), and in South Dakota at least half of $82 to $115 a day (about $41 to $57) ([Medicaid Planning Assistance](https://www.medicaidplanningassistance.org/structured-family-caregiving/)). The agency also gives you training and a care coach.",
    },
    {
      type: "p",
      text: "You must live with your parent, either in your home or theirs. Some states don't allow spouses to be the paid caregiver, and Missouri's program is only for people with dementia.",
    },

    { type: "h2", text: "3. VA programs for veterans" },
    {
      type: "p",
      text: "If your parent served, check these three before anything else. A VA social worker at your parent's nearest VA medical center can tell you which apply.",
    },
    {
      type: "ul",
      items: [
        "**Program of Comprehensive Assistance for Family Caregivers (PCAFC).** A monthly stipend paid directly to the family caregiver, plus training, respite and, for uninsured caregivers, health coverage. The veteran needs a service-connected disability rating of 70% or higher and must need at least six months of continuous in-person care. The caregiver must be 18 or older and live with the veteran ([AARP](https://www.aarp.org/veterans/va-caregiver-support-benefits/)).",
        "**Veteran Directed Care.** The veteran gets a budget for help at home and hires their own workers, which can include a family member. It's available for veterans of any age who need help with daily activities, but not every VA location offers it ([VA](https://www.va.gov/geriatrics/pages/veteran-directed_care.asp)).",
        "**Aid and Attendance pension.** An extra monthly pension for wartime veterans and surviving spouses with limited income who need help with daily activities. From December 1, 2025, the maximum is $29,093 a year for a veteran with no dependents and $34,488 with one dependent ([VA pension rates](https://www.va.gov/pension/veterans-pension-rates/)). The money goes to your parent, who can use it toward care, including paying you under a written agreement (see route 4).",
      ],
    },

    { type: "h2", text: "4. Your parent pays you, under a written care agreement" },
    {
      type: "p",
      text: "If your parent has savings or a good pension, the most direct route is for them to pay you, the same way they would pay an agency. Done casually, this causes problems. Done properly, it's fair to everyone.",
    },
    {
      type: "p",
      text: "The written version is called a **personal care agreement** or **caregiver agreement**. It says what care you give, how many hours, and what you're paid.",
    },
    {
      type: "p",
      text: "**Why it has to be in writing.** If your parent later applies for Medicaid to pay for a nursing home, Medicaid reviews every transfer of money from the previous five years in most states. Payments to a family member without a written agreement are usually treated as gifts, which can delay your parent's eligibility.",
    },
    {
      type: "p",
      text: "The elder-law attorneys at the [Special Needs Alliance](https://specialneedsalliance.org/wp-content/uploads/2024/12/The-Pitfalls-of-Paying-Family-Members-to-Provide-Care.pdf) list the rules that make an agreement hold up:",
    },
    {
      type: "ul",
      items: [
        "**Sign it before any care is paid for.** Paying for care you already gave usually doesn't count.",
        "**List the specific services and hours,** and the pay.",
        "**Keep the rate reasonable,** at or below what a professional caregiver earns locally. (The 2025 national median for a home care worker was $35 an hour, according to CareScout. See our [guide to the cost of in-home care](/blogs/guides/cost-of-in-home-care).)",
        "**Get paid as you go,** not in one lump sum up front.",
        "**Keep a log** of the hours and tasks.",
        "**Get a letter from the doctor** confirming that your parent needs the help.",
        "**Have an elder-law attorney review it,** because state rules differ.",
      ],
    },
    {
      type: "p",
      text: "**Taxes: the part most families miss.** The pay is taxable income for you. And because your parent usually decides what you do and when, the IRS will often treat you as your parent's **household employee**. In 2026, if your parent pays you $3,000 or more in cash wages, they generally have to withhold and pay Social Security and Medicare taxes ([IRS Topic 756](https://www.irs.gov/taxtopics/tc756)). The IRS exemption for family members covers wages you pay your parent, not wages your parent pays you. A household payroll service can handle the filings for a small monthly fee. Ask a tax professional before the first payment.",
    },
    {
      type: "p",
      text: "One helpful exception: if Medicaid pays you through a waiver program and you live in the same home as your parent, those payments may be excluded from your taxable income under IRS Notice 2014-7 ([NATP](https://www.natptax.com/news-insights/blog/medicaid-waiver-tax-exclusion-rules-for-caregiver-clients/)).",
    },

    { type: "h2", text: "5. Long-term care insurance" },
    {
      type: "p",
      text: "If your parent bought long-term care insurance, find the policy now and read the benefit section. Some policies pay a set cash amount that your parent can spend on any care, including paying you. Many others only reimburse care from a licensed agency or worker, which usually rules out family. Call the insurer and ask two questions: “Does this policy pay a family member as caregiver?” and “What starts the benefits, and how long is the waiting period?”",
    },

    { type: "h2", text: "6. Paid family leave (and FMLA)" },
    {
      type: "p",
      text: "These don't pay you to be a caregiver long term. They protect your job and part of your income while you take time off to care for your parent.",
    },
    {
      type: "p",
      text: "**State paid family leave.** In 2026, 12 states and Washington, D.C. pay benefits to workers caring for a family member with a serious health condition: California, Colorado, Connecticut, Delaware, Maine, Massachusetts, Minnesota, New Jersey, New York, Oregon, Rhode Island and Washington. Maryland's program starts paying benefits in 2028 ([OnPay, September 2026](https://onpay.com/insights/paid-family-leave-by-state/)). Benefits replace part of your wages for several weeks a year.",
    },
    {
      type: "p",
      text: "**FMLA.** The federal Family and Medical Leave Act gives eligible workers up to 12 weeks a year of unpaid, job-protected leave to care for a parent with a serious health condition ([U.S. Department of Labor](https://www.dol.gov/agencies/whd/fmla/family-caregiver)). You're generally eligible if your employer has 50 or more employees nearby and you've worked there at least 12 months and 1,250 hours. FMLA covers your parents but not your in-laws.",
    },
    {
      type: "p",
      text: "Also ask HR about eldercare benefits. Some employers offer paid caregiver leave, backup care or care-navigation services that aren't widely advertised.",
    },

    { type: "h2", text: "What doesn't pay family caregivers" },
    {
      type: "ul",
      items: [
        "**Medicare** doesn't pay family members for care. If your parent has dementia, ask their doctor about Medicare's GUIDE program, which can cover up to $2,500 a year of respite care so you can take a break ([CMS](https://www.cms.gov/priorities/innovation/innovation-models/guide)).",
        "**Federal caregiver tax credits** have been proposed in Congress, such as the Credit for Caring Act, but none has passed. Some states offer their own caregiver tax credits; check your state's tax agency.",
      ],
    },

    { type: "h2", text: "Which route fits your family?" },
    { type: "p", text: "Work through these in order:" },
    {
      type: "ul",
      items: [
        "**Is your parent a veteran or a veteran's surviving spouse?** Call the VA first. These programs can pay without the strict Medicaid money limits.",
        "**Does your parent have low income and under about $2,000 in savings, and need hands-on daily help?** Apply for Medicaid home care and ask for the self-directed option. If you live together in a structured family caregiving state, ask about that too.",
        "**Does your parent have savings or a solid pension?** A written care agreement, reviewed by an elder-law attorney, is usually the cleanest route.",
        "**Are you still working and need time off?** Check your state's paid family leave program and your FMLA eligibility.",
        "**Does your parent have long-term care insurance?** Check the policy whichever route you choose.",
      ],
    },

    { type: "h2", text: "Before you're paid: talk to your siblings" },
    {
      type: "p",
      text: "Getting paid to care for Mom can feel awkward, especially if your brother or sister is footing other bills or simply isn't involved. Money between family members causes real damage when it's handled quietly and comes out later.",
    },
    { type: "p", text: "A few things keep it fair:" },
    {
      type: "ul",
      items: [
        "**Tell your siblings before you're paid, not after.** Payments from your parent's savings may reduce what everyone inherits. They deserve to hear that from you.",
        "**Count time as well as money.** If you give 20 hours a week and your brother sends $300 a month, both are contributions. Write both down where everyone can see them.",
        "**Put it in a written agreement,** even if no one is paid yet. Writing down who does what, how many hours and at what rate turns a vague resentment into something you can all look at and change.",
        "**Use the attorney meeting.** If your parent is paying you, siblings can join the conversation with the elder-law attorney, which keeps the arrangement transparent.",
      ],
    },

    { type: "h2", text: "FAQ" },
    {
      type: "faq",
      items: [
        {
          q: "Can I get paid to take care of my mom?",
          a: "Yes, through Medicaid self-directed care if she qualifies, a structured family caregiving program if you live together in one of 11 states, VA programs if she's a veteran or veteran's widow, or by her paying you from her own money under a written care agreement.",
        },
        {
          q: "How much do family caregivers get paid?",
          a: "It depends on the route and the state. Medicaid programs pay an hourly wage set by the state. Structured family caregiving pays a daily stipend; two 2026 examples are about $41 to $72 a day. A private care agreement should pay no more than local home care rates, which had a national median of $35 an hour in 2025.",
        },
        {
          q: "Does Medicare pay family caregivers?",
          a: "No. Medicare doesn't pay family members to provide care. Its GUIDE program can cover up to $2,500 a year in respite care for people with dementia.",
        },
        {
          q: "Can I get paid for caring for a parent with dementia?",
          a: "Yes, through the same routes. Dementia often helps a parent meet the “nursing home level of care” that Medicaid programs require, and Missouri's structured family caregiving program is specifically for people with dementia.",
        },
        {
          q: "Can I be paid for care I've already given?",
          a: "Usually not in a way that protects your parent's future Medicaid eligibility. Payments for past care are generally treated as gifts. Put a written agreement in place now, before any payment.",
        },
        {
          q: "Do I pay taxes on money I get for caring for my parent?",
          a: "Usually yes. Pay from your parent is taxable income, and your parent may owe household employment taxes once wages reach $3,000 in 2026. Some Medicaid waiver payments are tax-free if you live with your parent. Ask a tax professional.",
        },
        {
          q: "What is the government assistance for caregivers of elderly parents?",
          a: "The main federal and state sources are Medicaid home and community-based services, VA caregiver programs and pension, state paid family leave, and the National Family Caregiver Support Program, which funds respite care, counseling and training through your local Area Agency on Aging.",
        },
      ],
    },

    {
      type: "cta",
      title: "Write it down before anyone is paid.",
      text: [
        "The Family Caregiver Agreement Template lays out the services, hours, pay and a time log, plus a guide to the questions to settle as a family before you meet your attorney. $19.",
      ],
      button: { label: "See the Caregiver Agreement", href: "/products/caregiver-agreement-template" },
    },
    {
      type: "cta",
      title: "Want the costs visible to every sibling?",
      text: [
        "The Parentkeeping Family Care System includes the Agreement, a shared Google Sheet that tracks who does what and who pays what, and a Family Meeting Kit for the first conversation. One price, no app, no subscription.",
      ],
      button: { label: "See the Family Care System", href: "/products/family-care-system" },
    },
    {
      type: "small",
      text: "General information only, not legal, tax or financial advice. Program rules and amounts change and vary by state, so check with your state Medicaid office, the VA, an elder-law attorney or a tax professional before acting.",
    },
  ],
};
