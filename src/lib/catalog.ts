// Storefront URLs per product slug (kept from the keyword tree).
export const PRODUCT_PATHS: Record<string, string> = {
  "family-care-system": "/products/family-care-system",
  "medical-binder": "/products/medical-binder",
  "caregiver-agreement": "/products/caregiver-agreement-template",
};

/** The bundle that carries the order bump, and the bump itself. */
export const BUNDLE_SLUG = "family-care-system";
export const BUMP_SLUG = "emergency-binder";

/** Headline test cookie (set by middleware with the free-list page). */
export const VARIANT_COOKIE = "pk_variant";
export const VARIANTS = ["fairness", "one_place"] as const;
