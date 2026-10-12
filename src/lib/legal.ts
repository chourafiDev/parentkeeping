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
