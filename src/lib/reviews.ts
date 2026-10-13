// Product reviews. Copy rule (and FTC rule): no invented reviews on the live
// store. Placeholder entries render only in development, marked as such;
// production shows only real reviews and hides the section until one exists.
// To add a real review: copy a placeholder, write the buyer's words exactly,
// set `placeholder: false`, and keep the buyer's permission on file.

export type Review = {
  /** Product slugs this review shows on. */
  products: string[];
  /** Tab it sits under. */
  topic: string;
  text: string;
  /** First name + last initial, with the buyer's permission. */
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  verified: boolean;
  placeholder: boolean;
};

const ALL = ["family-care-system", "medical-binder", "caregiver-agreement", "emergency-binder"];
const PLACEHOLDER_TEXT = "Placeholder review. Replace with a real buyer's words, exactly as they wrote them.";

export const REVIEWS: Review[] = [
  { products: ALL, topic: "Getting set up", text: PLACEHOLDER_TEXT, name: "Buyer name", rating: 5, verified: true, placeholder: true },
  { products: ALL, topic: "Getting set up", text: PLACEHOLDER_TEXT, name: "Buyer name", rating: 5, verified: true, placeholder: true },
  { products: ALL, topic: "Sharing with siblings", text: PLACEHOLDER_TEXT, name: "Buyer name", rating: 5, verified: true, placeholder: true },
  { products: ALL, topic: "Sharing with siblings", text: PLACEHOLDER_TEXT, name: "Buyer name", rating: 4, verified: true, placeholder: true },
  { products: ALL, topic: "Doctor visits", text: PLACEHOLDER_TEXT, name: "Buyer name", rating: 5, verified: true, placeholder: true },
  { products: ALL, topic: "Doctor visits", text: PLACEHOLDER_TEXT, name: "Buyer name", rating: 5, verified: true, placeholder: true },
];

/** Reviews for a product page: placeholders only outside production. */
export function reviewsFor(slug: string) {
  const showPlaceholders = process.env.NODE_ENV !== "production";
  return REVIEWS.filter((r) => r.products.includes(slug) && (showPlaceholders || !r.placeholder));
}
