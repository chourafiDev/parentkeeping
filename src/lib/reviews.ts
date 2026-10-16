// Product reviews come from real buyers only (copy rule + FTC): they write
// them from the signed link in their review-request email, and the owner
// publishes them in Admin → Reviews. These placeholders exist so the layout
// can be checked in development; they never render in production.

export type ReviewCard = {
  id: string;
  rating: number;
  headline: string;
  body: string;
  name: string;
  /** ISO date it was published. */
  date: string;
  placeholder?: boolean;
};

const PLACEHOLDER_TEXT = "Placeholder review. Real buyers' reviews appear here once they're published in Admin → Reviews.";

export const PLACEHOLDER_REVIEWS: ReviewCard[] = [5, 5, 4].map((rating, i) => ({
  id: `placeholder-${i}`,
  rating,
  headline: "Placeholder headline",
  body: PLACEHOLDER_TEXT,
  name: "Buyer name",
  date: new Date(0).toISOString(),
  placeholder: true,
}));

/** Placeholders only outside production, and only while there are no real reviews. */
export const placeholderReviews = () => (process.env.NODE_ENV !== "production" ? PLACEHOLDER_REVIEWS : []);
