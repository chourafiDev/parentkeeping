// Legal wording used across the store, checkout and emails.
// Store-page lines are word for word from the Phase 1 page copy (which takes
// them from the Legal doc). Checkout/email consent lines are still placeholders.

/** Stripe's required terms checkbox at checkout (markdown link allowed). */
export const checkoutConsentText = (termsUrl: string) =>
  `I agree to the [Terms of Service](${termsUrl}) and ask for immediate access to my digital files. I understand I can't cancel once the download is available; the 14-day guarantee still applies.`;

/** Line in the order confirmation email recording that consent. */
export const ORDER_CONSENT_LINE =
  "You asked for immediate access to your digital files and agreed that, once the download is available, you can't cancel the purchase under any cooling-off period. Our 14-day guarantee still applies.";

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
export const BUY_GUARANTEE_LINE = "14-day “if it doesn't help” guarantee. Available to US customers.";

/** Product legal lines (the System shows the first three near "What's inside"). */
export const BINDER_LEGAL_LINE =
  "This binder helps you keep your parent's health information in one place. It is your family's personal record, not an official medical record. Your parent's doctors, hospital and pharmacy keep the official records.";
export const SHEET_LEGAL_LINE =
  "This sheet helps your family see who does what and who pays what. It is not an accounting, tax or legal record. For shared bank accounts, reimbursements or a parent's money, talk with a financial or legal professional.";
export const AGREEMENT_LEGAL_LINE =
  "This is a template to help your family discuss and write down caregiving arrangements. It is not legal advice and is not tailored to your state. Paying a family caregiver can affect taxes, employment obligations and eligibility for Medicaid and other benefits. Have an elder-law attorney in your parent's state review the agreement before anyone signs or any payment is made.";
/** Required above the Agreement's Buy button. */
export const AGREEMENT_ABOVE_BUTTON =
  "This is a template to help your family discuss and write down caregiving arrangements. It is not legal advice and is not tailored to your state. Have an elder-law attorney in your parent's state review it before anyone signs or any payment is made.";
export const EMERGENCY_LEGAL_LINE =
  "This binder helps you find key information fast. It does not replace calling 911, and it is not a substitute for legal documents such as advance directives or powers of attorney. Store originals safely and keep copies in the binder.";

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
  "This quiz is a self-reflection tool, not a diagnosis. If you feel overwhelmed, talk to your doctor or a counselor. If you are in crisis or thinking about harming yourself, call or text 988 (Suicide & Crisis Lifeline, US) or call 911.";

/** Short line in the footer of every store page. */
export const FOOTER_LEGAL_LINE =
  "Parentkeeping makes organizing tools for families caring for an aging parent. Nothing on this site is medical, legal or financial advice.";
