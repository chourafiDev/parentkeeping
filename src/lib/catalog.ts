// Storefront URLs per product slug (kept from the keyword tree).
export const PRODUCT_PATHS: Record<string, string> = {
  "family-care-system": "/products/family-care-system",
  "medical-binder": "/products/medical-binder",
  "caregiver-agreement": "/products/caregiver-agreement-template",
};

/** "/products/<handle>" → product slug (the handles come from the keyword tree). */
export const SLUG_BY_HANDLE: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_PATHS).map(([slug, path]) => [path.replace("/products/", ""), slug]),
);

/** The bundle that carries the order bump, and the bump itself. */
export const BUNDLE_SLUG = "family-care-system";
export const BUMP_SLUG = "emergency-binder";

/** Headline test cookie (set by middleware with the free-list page). */
export const VARIANT_COOKIE = "pk_variant";
export const VARIANTS = ["fairness", "one_place"] as const;

/** "Parentkeeping-Medical-Binder.zip" contains "Medical Binder"? (case, dashes and punctuation ignored) */
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export const fileMatchesPart = (fileLabel: string, partLabel: string) => squash(fileLabel).includes(squash(partLabel));
