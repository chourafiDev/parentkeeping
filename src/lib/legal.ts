// Legal wording used across the store, checkout and emails.
// Store-page lines are word for word from the Phase 1 page copy (which takes
// them from the Legal doc). Checkout/email consent lines are still placeholders.

/**
 * Stripe's required terms checkbox at checkout (markdown link allowed).
 * Carries the EU/UK immediate-download consent (Consumer Rights Directive /
 * Consumer Contracts Regulations: a digital download's 14-day right to
 * cancel ends only with this express, unticked-by-default consent) — shown
 * to every buyer, everywhere, since it does no harm outside the EU/UK.
 */
export const checkoutConsentText = (termsUrl: string) =>
  `I agree to the [Terms of Service](${termsUrl}). I want my download straight away, and I understand that once it starts I lose my legal 14-day right to cancel. (Parentkeeping's own 14-day guarantee still applies.)`;

/** Line in the order confirmation email recording that consent. */
export const ORDER_CONSENT_LINE =
  "You asked for immediate access to your digital download and confirmed that you lose your statutory right to cancel once the download begins. Our 14-day Parentkeeping guarantee still applies.";

/** Next to the Pay button (Stripe custom_text.submit), from the spec. */
export const CHECKOUT_SUBMIT_TEXT = "14-day “if it doesn't help” guarantee. An organizing tool, not medical or legal advice.";

/** Under a free-download button, everyone outside the EU/UK. */
export const signupNotice = (what: string) => `We'll email you ${what}, then our weekly caregiving emails. Unsubscribe anytime.`;
export const SIGNUP_NOTICE = signupNotice("the list");

/** EU/UK visitors: an unticked box. Unticked still gets the file, no newsletter. */
export const EU_NEWSLETTER_CHECKBOX = "Send me Parentkeeping's weekly emails";

/** Under every Buy button: this line, then BUY_GUARANTEE_LINE. */
export const PRODUCT_DISCLAIMER_SHORT = "An organizing tool, not medical or legal advice. Always follow your parent's doctors and pharmacist.";
/** The Agreement page drops the doctors line (its full legal line sits above the button). */
export const AGREEMENT_DISCLAIMER_SHORT = "An organizing tool, not medical or legal advice.";
export const BUY_GUARANTEE_LINE = "14-day “if it doesn't help” guarantee.";

/** Product legal lines (the System shows the first three near "What's inside"). */
export const BINDER_LEGAL_LINE =
  "This binder helps you keep your parent's health information in one place. It is your family's personal record, not an official medical record. Your parent's doctors, hospital and pharmacy keep the official records.";
export const SHEET_LEGAL_LINE =
  "This sheet helps your family see who does what and who pays what. It is not an accounting, tax or legal record. For shared bank accounts, reimbursements or a parent's money, talk with a financial or legal professional.";
export const AGREEMENT_LEGAL_LINE =
  "This is a template to help your family discuss and write down caregiving arrangements. It is written for families in the United States. It is not legal advice and is not tailored to your state or country. Paying a family caregiver can affect taxes, employment obligations and eligibility for Medicaid and other benefits. Have an elder-law attorney where your parent lives review the agreement before anyone signs or any payment is made. Outside the US, use it only as a conversation guide and ask a local lawyer what applies.";
/** Required above the Agreement's Buy button. */
export const AGREEMENT_ABOVE_BUTTON =
  "This is a template to help your family discuss and write down caregiving arrangements. It is written for families in the United States. It is not legal advice and is not tailored to your state or country. Have an elder-law attorney where your parent lives review it before anyone signs or any payment is made. Outside the US, use it only as a conversation guide.";
export const EMERGENCY_LEGAL_LINE =
  "This binder helps you find key information fast. It does not replace calling your local emergency number (911 in the US and Canada, 112 in the EU, 999 or 112 in the UK, 000 in Australia), and it is not a substitute for legal documents such as advance directives or powers of attorney. Store originals safely and keep copies in the binder.";

/** Free Medication List, near the preview (and in its email). */
export const MEDICATION_LEGAL_LINE =
  "Use this list to record medications exactly as prescribed or recommended by your parent's doctor or pharmacist. It does not suggest doses, timing or combinations, and it does not check for drug interactions. Bring it to every appointment and ask the pharmacist to review it whenever a medication changes.";

/** End of every free download page and blog post. */
export const GENERAL_INFO_LINE =
  "General information only. Every family's situation is different, so check with the professionals involved in your parent's care.";

/** Burnout quiz: before question 1, and under every result. */
export const QUIZ_INTRO_LINE =
  "This quiz is a self-reflection tool, not a diagnosis or a medical or mental health assessment. Your result is not a clinical score.";
export const QUIZ_RESULT_FOOTER =
  "This quiz is a self-reflection tool, not a diagnosis. If you feel overwhelmed, talk to your doctor or a counselor. If you are in crisis or thinking about harming yourself, contact a crisis line now: in the US call or text 988; in the UK and Ireland call Samaritans on 116 123; elsewhere find your local line at findahelpline.com. In an emergency, call your local emergency number.";

/** Short line in the footer of every store page. */
export const FOOTER_LEGAL_LINE =
  "Parentkeeping makes organizing tools for families caring for an aging parent. Nothing on this site is medical, legal or financial advice.";
