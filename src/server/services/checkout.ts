import "server-only";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { BUMP_SLUG, BUNDLE_SLUG, PRODUCT_PATHS, VARIANTS } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { getStripe } from "@/server/lib/stripe";
import { getFoundingPrice, getSettings } from "@/server/queries/settings";
import { hasFiles } from "@/server/queries/storefront";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public status: 400 | 404 | 503 = 400,
  ) {
    super(message);
  }
}

/**
 * Hosted Stripe Checkout for one product. Prices come from our database
 * (never from the browser); the founding price applies until the date in
 * Settings. The System gets the Emergency Binder as an optional add-on.
 */
export async function createCheckoutSession({
  slug,
  addon,
  variant,
}: {
  slug: string;
  /** The package picker's "System + Emergency Binder": the bump as a second line item. */
  addon?: string | null;
  variant: string | null;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  if (!stripe) throw new CheckoutError("Checkout isn't available right now.", 503);

  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  // The bump sells on its own only once its page is live (it has files).
  const standaloneBump = product?.kind === "bump" && (await hasFiles(product.id));
  if (!product || product.status !== "active" || (product.kind === "bump" && !standaloneBump))
    throw new CheckoutError("This product isn't for sale.", 404);

  const founding = await getFoundingPrice();
  const useFounding = founding.active && !!product.foundingPriceId;
  const priceId = useFounding ? product.foundingPriceId : product.stripePriceId;
  if (!priceId) throw new CheckoutError("This product isn't for sale yet.", 404);

  // Emergency Binder chosen up front (package picker): System only, and only
  // once the binder has files (same rule as its own page).
  let addonProduct: typeof product | undefined;
  if (addon) {
    if (slug !== BUNDLE_SLUG || addon !== BUMP_SLUG) throw new CheckoutError("This combination isn't for sale.", 404);
    [addonProduct] = await db.select().from(products).where(eq(products.slug, BUMP_SLUG));
    if (!addonProduct?.stripePriceId || addonProduct.status !== "active" || !(await hasFiles(addonProduct.id)))
      throw new CheckoutError("The Emergency Binder isn't for sale right now.", 404);
  }

  // Order bump: System only, when switched on and sellable (not when it's already in the order).
  let bump: typeof product | undefined;
  if (slug === BUNDLE_SLUG && !addonProduct) {
    const { checkout } = await getSettings("checkout");
    if (checkout.bumpEnabled) {
      [bump] = await db.select().from(products).where(eq(products.slug, BUMP_SLUG));
      if (!bump?.stripePriceId || bump.status !== "active") bump = undefined;
    }
  }

  const base = siteUrl();
  const testVariant = VARIANTS.find((v) => v === variant) ?? "";

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }, ...(addonProduct ? [{ price: addonProduct.stripePriceId!, quantity: 1 }] : [])],
    // One Emergency Binder, quantity locked (spec: "quantity 1, not adjustable").
    ...(bump && { optional_items: [{ price: bump.stripePriceId!, quantity: 1, adjustable_quantity: { enabled: false } }] }),
    // Managed Payments: Stripe's Link is the merchant of record and handles
    // sales tax, VAT and GST worldwide. Stripe requires Adaptive Pricing with it.
    managed_payments: { enabled: true },
    adaptive_pricing: { enabled: true },
    customer_creation: "always",
    billing_address_collection: "required", // Stripe Tax needs it for state sales tax; Managed Payments needs it too
    automatic_tax: { enabled: true },
    consent_collection: { terms_of_service: "required" },
    success_url: `${base}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${PRODUCT_PATHS[slug] ?? "/"}`,
    metadata: { slug, founding: String(useFounding), test_variant: testVariant },
    payment_intent_data: { metadata: { slug } },
  });
}
