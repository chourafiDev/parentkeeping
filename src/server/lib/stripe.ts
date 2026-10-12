import "server-only";
import Stripe from "stripe";

// Stripe server client. Null until STRIPE_SECRET_KEY is set (test key first).
let client: Stripe | null | undefined;

export function getStripe() {
  if (client === undefined) {
    const key = process.env.STRIPE_SECRET_KEY;
    client = key ? new Stripe(key) : null;
  }
  return client;
}

/**
 * Stripe Tax code for our products: "Digital other news or documents —
 * downloadable — non subscription — with permanent rights" (closest fit for
 * printable PDF templates). Confirm with your accountant before going live.
 */
export const DIGITAL_GOODS_TAX_CODE = "txcd_10503000";
