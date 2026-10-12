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
