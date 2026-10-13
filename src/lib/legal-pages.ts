// Terms of Service, Privacy Policy and Refund Policy. Written in plain
// language and grounded in what this store actually does (Stripe for
// payment, Resend for email, Cloudflare R2 for files, the 14-day guarantee,
// US-only checkout, the no-cookie analytics, the quiz's browser-only
// scoring). Have a lawyer review before launch — this is a solid first
// draft, not legal advice.
//
// `[support email]` / `[postal address]` are filled in at render time from
// Settings → Business details, so these pages always match what's live.

import {
  AGREEMENT_LEGAL_LINE,
  BINDER_LEGAL_LINE,
  EMERGENCY_LEGAL_LINE,
  GENERAL_INFO_LINE,
  MEDICATION_LEGAL_LINE,
  PRODUCT_DISCLAIMER_SHORT,
  QUIZ_RESULT_FOOTER,
  SHEET_LEGAL_LINE,
} from "./legal";
import type { CopySection } from "./product-copy";

export const LAST_UPDATED = "October 13, 2026";

/** Fills in "[support email]" etc. with the real values from Settings → Business details. */
export function fillContact(sections: CopySection[], contact: { supportEmail: string | null; privacyEmail: string | null }) {
  const support = contact.supportEmail ?? "our support address";
  const privacy = contact.privacyEmail ?? support;
  const replace = (s: string) => s.replace(/\[support email\]/g, support).replace(/\[privacy email or support email\]/g, privacy);
  return sections.map((section) => ({
    ...section,
    paragraphs: section.paragraphs?.map(replace),
    bullets: section.bullets?.map((b) => ({ ...b, text: replace(b.text) })),
  }));
}

export const TERMS_SEO = {
  title: "Terms of Service",
  description: "The terms for buying and using Parentkeeping's digital products: what you're buying, how refunds work, and your right to cancel.",
};

export const TERMS_SECTIONS: CopySection[] = [
  {
    title: "Who we are",
    paragraphs: [
      "Parentkeeping (“we,” “us” or “our”) makes printable and fillable organizing tools for adult children caring for an aging parent. These terms cover your use of parentkeeping.com and the products you buy here.",
      "By placing an order or using this site, you agree to these terms. If you don't agree, please don't use the site or buy a product.",
    ],
  },
  {
    title: "What you're buying",
    paragraphs: [
      "Every product on this site is a digital download: fillable and printable PDFs, and for the Family Care System, a Google Sheets template you copy into your own Google account. Nothing is shipped to you, and no physical copy is included.",
    ],
  },
  {
    title: "Who can buy",
    paragraphs: [
      "Paid products are available to customers billing from the United States only, for now. We check this at checkout and again when your payment is confirmed. If an order is placed from outside the US, we'll refund it automatically and email you to explain.",
      "Our free downloads (the Medication List, the Caregiver Checklists) and the Caregiver Burnout Quiz are available to anyone, anywhere.",
    ],
  },
  {
    title: "Using what you buy",
    bullets: [
      { lead: "It covers your family.", text: "Your purchase covers you and relatives who help care for the same parent. Print as many copies as your family needs." },
      {
        lead: "It's for your use, not for resale.",
        text: "Please don't resell, redistribute, publish or share the files outside your family, remove our branding, or present them as your own work.",
      },
    ],
  },
  {
    title: "Instant delivery, and your right to cancel",
    paragraphs: [
      "Because these are digital files, you get access right after payment, not after a waiting period. When you check out, you specifically ask for immediate access and agree that, once that access is granted, you give up any legal right to cancel or get a refund under a standard cooling-off period.",
      "That doesn't leave you unprotected, though: our own 14-day guarantee (below) still applies, on top of and separate from any legal cancellation right you're agreeing to waive.",
    ],
  },
  {
    title: "Our 14-day guarantee",
    paragraphs: [
      "Use what you bought for 14 days. If it doesn't help your family, email us and we'll refund you in full. No forms, no reason needed. See our full Refund Policy for how to ask for one.",
    ],
  },
  {
    title: "Parts marked “arrives by” a date",
    paragraphs: [
      "Some parts of a bundle may not be finished yet when you buy. If a part shows an “arrives by” date, you'll get it by email, at no extra cost, by that date. If we miss the date, you can ask for a full refund, even if it's been more than 14 days.",
    ],
  },
  {
    title: "Not medical, legal or financial advice",
    paragraphs: [
      "Parentkeeping makes organizing tools. Nothing we sell or publish is medical, legal, tax or financial advice, and using our products doesn't create a professional relationship of any kind. Always follow your parent's own doctors, pharmacist, and any attorney or financial professional your family works with. See our full Disclaimer for the specific lines that apply to each product.",
    ],
  },
  {
    title: "Download links",
    paragraphs: [
      "Your order confirmation email includes a link to your downloads. That link stays valid for one year, and each file can be downloaded a set number of times (shown on the product page). If a link stops working or you need it reset, email us and we'll sort it out.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may update our prices, our products or these terms at any time. Changes won't affect an order you've already placed. If we make a material change to these terms, we'll update the date at the top of this page.",
    ],
  },
  {
    title: "Our liability",
    paragraphs: [
      "Our products and this site are provided as they are, without warranties beyond the 14-day guarantee above. To the extent allowed by law, Parentkeeping isn't liable for indirect, incidental or consequential damages arising from your use of our products or this site, and our total liability for any claim is limited to the amount you paid us.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: ["These terms are governed by the laws of the State of Wyoming, without regard to its conflict-of-law rules."],
  },
  {
    title: "Questions",
    paragraphs: ["Email [support email], or use our [Contact page](/pages/contact)."],
  },
];

export const PRIVACY_SEO = {
  title: "Privacy Policy",
  description: "What information Parentkeeping collects, who we share it with, and how to see, change or delete it.",
};

export const PRIVACY_SECTIONS: CopySection[] = [
  {
    title: "What this covers",
    paragraphs: [
      "This policy covers parentkeeping.com and the emails we send you. It doesn't cover other sites we might link to, like Google Sheets once you've copied your own template.",
    ],
  },
  {
    title: "What we collect, and why",
    bullets: [
      {
        lead: "When you buy something:",
        text: "your email, your name if you give it, your billing country, and what you bought. Payment itself is handled entirely by Stripe — we never see or store your full card number.",
      },
      {
        lead: "When you sign up for a free download or the quiz's email option:",
        text: "your email address, and the exact wording of the consent you gave (so we can show it if ever asked).",
      },
      {
        lead: "When you ask us a question:",
        text: "your name, email, phone number if you give one, and your message. We email this to our support inbox and don't keep a separate copy in a database.",
      },
      {
        lead: "When you just visit the store:",
        text: "a few anonymous numbers, like which pages are popular and whether a visit led to a sale. See “Analytics” below for exactly what that does and doesn't include.",
      },
    ],
  },
  {
    title: "Analytics, in plain terms",
    paragraphs: [
      "We use our own, first-party analytics to see what's working: page views, whether a visit led to a sale, and a rough location (country, region and city, from your network connection, never GPS). We don't use cookies for this, and we don't store your IP address.",
      "We also use Google Analytics, which does use cookies. We only run it for US visitors, never for visitors in the EU, UK or EEA.",
      "If your browser sends Global Privacy Control or Do Not Track, neither of these run for you. Neither ever runs on the Caregiver Burnout Quiz page, under any circumstance.",
    ],
  },
  {
    title: "The Caregiver Burnout Quiz",
    paragraphs: [
      "Your answers are scored entirely in your own browser and are never sent to us. If you choose to email yourself a copy of your result, only your email address is sent to us; your answers themselves are not.",
    ],
  },
  {
    title: "Who we share data with",
    paragraphs: [
      "We use a handful of companies to run the store, and share only what each one needs to do its job. None of them are allowed to use your information for their own marketing.",
    ],
    bullets: [
      { lead: "Stripe", text: "processes payment." },
      { lead: "Resend", text: "sends our emails (order confirmations, download links, free downloads, newsletter)." },
      { lead: "Cloudflare", text: "stores your purchased files and serves product images." },
      { lead: "Neon and Vercel", text: "host our database and the site itself." },
      {
        lead: "Google Analytics",
        text: "measures site traffic, for US visitors only. See [Google's Privacy Policy](https://policies.google.com/privacy) for how Google itself handles that information.",
      },
    ],
  },
  {
    title: "Email and unsubscribing",
    paragraphs: [
      "If you've opted in, we send a weekly caregiving email. Every email has an unsubscribe link, or you can use our unsubscribe page directly. Unsubscribing doesn't affect your access to anything you've already bought.",
    ],
  },
  {
    title: "How long we keep information",
    paragraphs: [
      "We keep order records as long as needed for accounting, tax and customer support. We keep your email on our subscriber list until you unsubscribe, or ask us to delete it sooner.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You can ask us to see, correct or delete the personal information we hold about you by emailing [privacy email or support email]. We'll respond within a reasonable time.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "Parentkeeping is for adults caring for an aging parent. We don't knowingly collect information from anyone under 13.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: ["If we make a material change, we'll update the date at the top of this page."],
  },
];

export const REFUND_SEO = {
  title: "Refund Policy",
  description: "Parentkeeping's 14-day \"if it doesn't help\" guarantee: how it works and how to ask for a refund.",
};

export const REFUND_SECTIONS: CopySection[] = [
  {
    title: "The guarantee",
    paragraphs: [
      "Use what you bought for 14 days from your purchase date. If it doesn't help your family, email us and we'll refund you in full. No forms, no hard feelings, and no need to explain why.",
    ],
  },
  {
    title: "How to ask for a refund",
    paragraphs: [
      "Email [support email] within 14 days of your order, with your order number (it's in your confirmation email, e.g. #1001). We'll refund the full amount to your original payment method. Stripe usually shows the refund within 5–10 business days, depending on your bank.",
    ],
  },
  {
    title: "Parts marked “arrives by” a date",
    paragraphs: [
      "If a part of your order is marked with an “arrives by” date and it's late, you can ask for a full refund at any time until it's delivered, even if more than 14 days have passed.",
    ],
  },
  {
    title: "Orders from outside the US",
    paragraphs: [
      "Paid products are for US customers only for now. If an order is placed from outside the US, it's automatically refunded in full, and you'll get an email letting you know.",
    ],
  },
  {
    title: "After a refund",
    paragraphs: ["Once an order is refunded, its download links stop working."],
  },
];

export const DISCLAIMER_SEO = {
  title: "Disclaimer",
  description: "What Parentkeeping's products are, and aren't: organizing tools, not medical, legal or financial advice.",
};

/** Every disclaimer line already shown on the site, in one place — word for word, nothing rewritten. */
export const DISCLAIMER_SECTIONS: CopySection[] = [
  { title: "Every Parentkeeping product", paragraphs: [PRODUCT_DISCLAIMER_SHORT, GENERAL_INFO_LINE] },
  { title: "Medical Binder for an Elderly Parent", paragraphs: [BINDER_LEGAL_LINE] },
  { title: "Shared Family Care Sheet", paragraphs: [SHEET_LEGAL_LINE] },
  { title: "Family Caregiver Agreement Template", paragraphs: [AGREEMENT_LEGAL_LINE] },
  { title: "Emergency Binder", paragraphs: [EMERGENCY_LEGAL_LINE] },
  { title: "Free Medication List & Daily Medication Chart", paragraphs: [MEDICATION_LEGAL_LINE] },
  { title: "Caregiver Burnout Quiz", paragraphs: [QUIZ_RESULT_FOOTER] },
];
