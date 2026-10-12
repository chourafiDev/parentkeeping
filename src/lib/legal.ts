// Legal wording used by checkout and emails.
// TODO before launch: replace each text with the exact wording from
// "Parentkeeping Legal Disclaimers" (word for word). These are placeholders.

/** Stripe's required terms checkbox at checkout (markdown link allowed). */
export const checkoutConsentText = (termsUrl: string) =>
  `I agree to the [Terms of Service](${termsUrl}) and ask for immediate access to my digital files. I understand I can't cancel once the download is available; the 14-day guarantee still applies.`;

/** Line in the order confirmation email recording that consent. */
export const ORDER_CONSENT_LINE =
  "You asked for immediate access to your digital files and agreed that, once the download is available, you can't cancel the purchase under any cooling-off period. Our 14-day guarantee still applies.";

/** Next to the Pay button (Stripe custom_text.submit), from the spec. */
export const CHECKOUT_SUBMIT_TEXT = "14-day “if it doesn't help” guarantee. An organizing tool, not medical or legal advice.";

/** Under the free-list button, everyone outside the EU/UK (spec wording). */
export const SIGNUP_NOTICE = "We'll email you the list, then our weekly caregiving emails. Unsubscribe anytime.";

/** EU/UK visitors: an unticked box. Unticked still gets the file, no newsletter. */
export const EU_NEWSLETTER_CHECKBOX = "Send me Parentkeeping's weekly emails";

/** Medication product legal line (record as prescribed, no dosing, pharmacist review). */
export const MEDICATION_LEGAL_LINE =
  "This list is for recording medications exactly as prescribed. It doesn't give dosing advice. Ask your parent's pharmacist to review it.";

/** Short line under every Buy button (product template + Stripe submit text). */
export const PRODUCT_DISCLAIMER_SHORT = "An organizing tool, not medical or legal advice.";

/** Product-specific legal lines (the System shows all three). */
export const BINDER_LEGAL_LINE =
  "The Medical Binder helps you record and organize information. It doesn't replace your parent's doctors or pharmacist.";
export const AGREEMENT_LEGAL_LINE =
  "The Caregiver Agreement is a template to start the conversation and take to your attorney. It isn't legal advice; have it reviewed by an elder-law attorney in your state.";
export const SHEET_LEGAL_LINE =
  "The Shared Family Care Sheet lives in your own Google account. We never see it, and you choose who it's shared with.";

/** Short line in the footer of every store page. */
export const FOOTER_LEGAL_LINE =
  "Parentkeeping makes organizing tools for families caring for an aging parent. Nothing on this site is medical, legal or financial advice.";
