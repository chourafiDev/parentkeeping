// Terms of Service, Privacy Policy and Refund Policy. Written in plain
// language and grounded in what this store actually does (Stripe Checkout
// with Stripe Managed Payments once Settings → Checkout → Sell worldwide is
// on, Resend for email, Cloudflare R2 for files, the 14-day guarantee, the
// no-cookie analytics, the quiz's browser-only scoring). Have a lawyer
// review before launch — this is a solid first draft, not legal advice.
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

export const LAST_UPDATED = "October 30, 2026";

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
      "Parentkeeping is operated by Abdelmonaime Chourafi LLC, a Wyoming limited liability company, 30 N Gould St Ste R, Sheridan, WY 82801. When you buy from us, your agreement is with Abdelmonaime Chourafi LLC.",
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
      "Our free downloads (the Medication List, the Caregiver Checklists) and the Caregiver Burnout Quiz are available to anyone, anywhere.",
      "Paid products sell worldwide, except in a short list of countries our payment processor can't serve. If you're one of the rare visitors we can't sell to yet, checkout will tell you before you pay, and we'll never take payment from a country we can't deliver to.",
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
    title: "Templates",
    paragraphs: [
      "The Family Caregiver Agreement and any other templates are starting points only. The Agreement is written for families in the United States; laws vary by state and country. Outside the US, use it only as a conversation guide. You are responsible for having templates reviewed by a qualified attorney where you live before use.",
    ],
  },
  {
    title: "Instant delivery, and your right to cancel",
    paragraphs: [
      "Because these are digital files, you get access right after payment, not after a waiting period. When you check out, you specifically ask for immediate access and agree that, once that access is granted, you give up any legal right to cancel under a standard cooling-off period — including the EU and UK's statutory 14-day right to withdraw, which otherwise applies to digital downloads bought from the EU or UK.",
      "That doesn't leave you unprotected, though: our own 14-day guarantee (below) still applies, on top of and separate from any legal cancellation right you're agreeing to waive. And this doesn't affect any other right you have under the consumer-protection law of the country you live in, which can't be signed away.",
    ],
  },
  {
    title: "Our 14-day guarantee",
    paragraphs: [
      "Use what you bought for 14 days. If it doesn't help your family, email us and we'll refund you in full. No forms, no reason needed. See our full Refund Policy for how to ask for one.",
    ],
  },
  {
    title: "Not medical, legal or financial advice",
    paragraphs: [
      "Parentkeeping makes organizing tools. Nothing we sell or publish is medical, legal, tax or financial advice, and using our products doesn't create a professional relationship of any kind. Always follow your parent's own doctors, pharmacist, and any attorney or financial professional your family works with. See our full Disclaimer for the specific lines that apply to each product.",
    ],
  },
  {
    title: "How your order is sold",
    paragraphs: [
      "Purchases are sold through Link, operated by Stripe, which acts as the seller of record and handles payment, tax and your receipt. Link's own terms apply to the payment itself. Parentkeeping provides the files and this license, and stays responsible for the products and their support — email us, not Stripe, with a question about a file.",
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
      "Our products and this site are provided as they are, without warranties beyond the 14-day guarantee above. To the extent allowed by law, Parentkeeping isn't liable for indirect, incidental or consequential damages arising from your use of our products or this site — including decisions made about a person's care, health, money or legal affairs — and our total liability for any claim is limited to the amount you paid us. This doesn't limit any right you have that can't be limited by law.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of the State of Wyoming, without regard to its conflict-of-law rules, except where the consumer law of your home country gives you protections that can't be waived — those protections still apply, whatever these terms say.",
    ],
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
    title: "Who we are",
    paragraphs: [
      "Parentkeeping is operated by Abdelmonaime Chourafi LLC, a Wyoming limited liability company, 30 N Gould St Ste R, Sheridan, WY 82801. It decides how your personal information is used, and is responsible for it under this policy.",
    ],
  },
  {
    title: "What this covers",
    paragraphs: [
      "This policy covers parentkeeping.com and the emails we send you. It doesn't cover other sites we might link to, like Google Sheets once you've copied your own template.",
    ],
  },
  {
    title: "What we collect, and why",
    paragraphs: [
      "If you're in the EU or UK, our legal basis for this is your consent (for the newsletter and any non-essential cookies) and performing our contract with you (for orders).",
    ],
    bullets: [
      {
        lead: "When you buy something:",
        text: "your email, your name if you give it, your billing country, and what you bought. Purchases are sold through Link, operated by Stripe, which acts as the seller of record; Stripe handles your payment details under its own privacy policy, and we never see or store your full card number.",
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
      "Your answers are scored entirely in your own browser and are never sent to us. If you choose to email yourself a copy of your result, only your email address is sent to us; your answers themselves are not. We don't tag or treat you differently based on your result, and we never share quiz activity with advertising platforms.",
    ],
  },
  {
    title: "Consumer health data (Washington and other US states)",
    paragraphs: [
      "We do not sell health data. If you think we hold any health-related information about you, email [privacy email or support email] to see it, have it deleted, or withdraw consent.",
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
    title: "International transfers",
    paragraphs: [
      "We are based in the United States and use service providers there and elsewhere. Where EU or UK law applies to your information, we rely on our providers' standard contractual clauses or an equivalent safeguard.",
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
      "Wherever you live, you can ask to see, correct or delete the personal information we hold about you, or stop marketing emails, by emailing [privacy email or support email]. In the EU and UK you also have the right to object, to data portability, and to complain to your local data protection authority. We reply within 30 days.",
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
    title: "Our 14-day guarantee",
    paragraphs: [
      "Parentkeeping products are digital downloads, so you get them instantly. If a product doesn't help your family, email [support email] within 14 days of purchase and we'll refund you. No forms, no hard feelings, and no need to explain why.",
    ],
  },
  {
    title: "How to ask for a refund",
    paragraphs: [
      "Email [support email] with your order number (it's in your confirmation email, e.g. #1001). We'll refund the full amount to your original payment method. Stripe usually shows the refund within 5–10 business days, depending on your bank.",
    ],
  },
  {
    title: "Problems with a file",
    paragraphs: ["If a file won't open, is missing pages or has an error, tell us and we'll fix it or send a new copy right away."],
  },
  {
    title: "Who processes your order",
    paragraphs: [
      "Orders are sold through Link, Stripe's checkout, which acts as the seller of record and sends your receipt. You can ask us or Link support for a refund; either way, our guarantee applies.",
    ],
  },
  {
    title: "Your legal rights",
    paragraphs: [
      "If you're in the EU or UK, you agreed at checkout to immediate download, which ends your statutory 14-day right to cancel once the download starts. This doesn't affect our guarantee above, or any other right you have under the law where you live.",
    ],
  },
  {
    title: "Bundles",
    paragraphs: ["Bundles are refunded as a whole."],
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
  {
    title: "Every Parentkeeping product",
    paragraphs: [PRODUCT_DISCLAIMER_SHORT, GENERAL_INFO_LINE, "In an emergency, call 911 or your local emergency number."],
  },
  { title: "Medical Binder for an Elderly Parent", paragraphs: [BINDER_LEGAL_LINE] },
  { title: "Shared Family Care Sheet", paragraphs: [SHEET_LEGAL_LINE] },
  { title: "Family Caregiver Agreement Template", paragraphs: [AGREEMENT_LEGAL_LINE] },
  { title: "Emergency Binder", paragraphs: [EMERGENCY_LEGAL_LINE] },
  { title: "Free Medication List & Daily Medication Chart", paragraphs: [MEDICATION_LEGAL_LINE] },
  { title: "Caregiver Burnout Quiz", paragraphs: [QUIZ_RESULT_FOOTER] },
];
