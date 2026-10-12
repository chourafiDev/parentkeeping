import "server-only";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import type Stripe from "stripe";
import { BUMP_SLUG, BUNDLE_SLUG, PRODUCT_PATHS, VARIANTS } from "@/lib/catalog";
import { CHECKOUT_SUBMIT_TEXT, checkoutConsentText } from "@/lib/legal";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { files, productFiles, products } from "@/server/db/schema";
import { getStripe } from "@/server/lib/stripe";
import { getFoundingPrice, getSettings } from "@/server/queries/settings";
import { hasFiles } from "@/server/queries/storefront";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public status: 400 | 403 | 404 | 503 = 400,
  ) {
    super(message);
  }
}

/** "Arrives by" lines for the pre-sale parts of these products. */
async function presaleNotes(productIds: string[]) {
  const rows = await db
    .selectDistinct({ label: files.label, availableAt: files.availableAt })
    .from(productFiles)
    .innerJoin(files, eq(files.id, productFiles.fileId))
    .where(and(inArray(productFiles.productId, productIds), isNotNull(files.availableAt)));
  return rows.map(
    (r) =>
      `${r.label}: arrives by ${r.availableAt!.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" })}`,
  );
}

/**
 * Hosted Stripe Checkout for one product. Prices come from our database
 * (never from the browser); the founding price applies until the date in
 * Settings. The System gets the Emergency Binder as an optional add-on.
 */
export async function createCheckoutSession({
  slug,
  country,
  variant,
}: {
  slug: string;
  /** Visitor's country from the edge (x-vercel-ip-country); null in dev. */
  country: string | null;
  variant: string | null;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  if (!stripe) throw new CheckoutError("Checkout isn't available right now.", 503);

  // Paid products are US-only (spec). The webhook double-checks the billing country.
  if (country && country !== "US") throw new CheckoutError("Our paid products are available to US customers only for now.", 403);

  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  // The bump sells on its own only once its page is live (it has files).
  const standaloneBump = product?.kind === "bump" && (await hasFiles(product.id));
  if (!product || product.status !== "active" || (product.kind === "bump" && !standaloneBump))
    throw new CheckoutError("This product isn't for sale.", 404);

  const founding = await getFoundingPrice();
  const useFounding = founding.active && !!product.foundingPriceId;
  const priceId = useFounding ? product.foundingPriceId : product.stripePriceId;
  if (!priceId) throw new CheckoutError("This product isn't for sale yet.", 404);

  // Order bump: System only, when switched on and sellable.
  let bump: typeof product | undefined;
  if (slug === BUNDLE_SLUG) {
    const { checkout } = await getSettings("checkout");
    if (checkout.bumpEnabled) {
      [bump] = await db.select().from(products).where(eq(products.slug, BUMP_SLUG));
      if (!bump?.stripePriceId || bump.status !== "active") bump = undefined;
    }
  }

  const base = siteUrl();
  const notes = await presaleNotes([product.id, ...(bump ? [bump.id] : [])]);
  const testVariant = VARIANTS.find((v) => v === variant) ?? "";

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    // One Emergency Binder, quantity locked (spec: "quantity 1, not adjustable").
    ...(bump && { optional_items: [{ price: bump.stripePriceId!, quantity: 1, adjustable_quantity: { enabled: false } }] }),
    // US-only store priced in dollars: no conversion to the visitor's local currency.
    adaptive_pricing: { enabled: false },
    customer_creation: "always",
    billing_address_collection: "required", // Stripe Tax needs it for state sales tax
    automatic_tax: { enabled: true },
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: { message: checkoutConsentText(`${base}/policies/terms-of-service`) },
      submit: { message: CHECKOUT_SUBMIT_TEXT },
      ...(notes.length > 0 && {
        after_submit: { message: `Pre-sale parts: ${notes.join(" · ")}. Everything else is ready right after payment.`.slice(0, 1200) },
      }),
    },
    success_url: `${base}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${PRODUCT_PATHS[slug] ?? "/"}`,
    metadata: { slug, founding: String(useFounding), test_variant: testVariant },
    payment_intent_data: { metadata: { slug } },
  });
}
