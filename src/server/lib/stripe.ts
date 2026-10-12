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
