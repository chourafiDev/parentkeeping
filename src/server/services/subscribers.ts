import "server-only";
import { eq } from "drizzle-orm";
import { OPT_IN_COUNTRIES } from "@/lib/free-list";
import type { LeadMagnet } from "@/lib/lead-magnets";
import { EU_NEWSLETTER_CHECKBOX, signupNotice } from "@/lib/legal";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { subscribers } from "@/server/db/schema";
import { leadMagnetEmail } from "@/server/emails/buyer";
import { buyerFooter } from "@/server/emails/buyer-footer";
import { sendEmail } from "@/server/lib/email";
import { rateLimit } from "@/server/lib/rate-limit";
import { unsubscribeUrl } from "@/server/lib/unsubscribe";

export class SignupError extends Error {
  constructor(
    message: string,
    public status: 400 | 429 = 400,
  ) {
    super(message);
  }
}

/** Cloudflare Turnstile check; skipped when no secret is configured (dev). */
async function verifyTurnstile(token: string | undefined, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, ...(ip && { remoteip: ip }) }),
  });
  const body = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return body?.success === true;
}

/** Does this visitor get the unticked newsletter box (EU/UK)? */
export const needsOptIn = (country: string | null) => !!country && OPT_IN_COUNTRIES.has(country);

/**
 * Free download sign-up (Medication List, Checklists). Records exactly what
 * the person saw and agreed to, then emails the PDF. Signing up again never
 * downgrades an existing consent; the first sign-up's source is kept.
 */
export async function subscribeToLeadMagnet(input: {
  magnet: LeadMagnet;
  email: string;
  newsletterBox: boolean;
  country: string | null;
  variant: string | null;
  ip: string | null;
  turnstileToken?: string;
}) {
  if (input.ip && !(await rateLimit(`signup:${input.ip}`, 10, 60 * 60))) {
    throw new SignupError("Too many sign-ups from this connection. Try again in a while.", 429);
  }
  if (!(await verifyTurnstile(input.turnstileToken, input.ip))) {
    throw new SignupError("We couldn't check that you're not a robot. Refresh the page and try again.");
  }

  const email = input.email.trim().toLowerCase();
  const optIn = needsOptIn(input.country);
  const marketingConsent = optIn ? input.newsletterBox : true;
  const consentText = optIn
    ? `Checkbox "${EU_NEWSLETTER_CHECKBOX}": ${input.newsletterBox ? "ticked" : "left unticked"}`
    : `${signupNotice(input.magnet.noticeWhat)} [Privacy Policy]`;
  const now = new Date();

  const [existing] = await db.select().from(subscribers).where(eq(subscribers.email, email));
  let id: string;
  if (!existing) {
    const [row] = await db
      .insert(subscribers)
      .values({
        email,
        source: input.magnet.source,
        country: input.country,
        marketingConsent,
        consentText,
        consentAt: now,
        testVariant: input.variant,
      })
      .onConflictDoNothing({ target: subscribers.email })
      .returning({ id: subscribers.id });
    id = row?.id ?? (await db.select({ id: subscribers.id }).from(subscribers).where(eq(subscribers.email, email)))[0].id;
  } else {
    id = existing.id;
    // Only upgrade: a new "yes" replaces an old "no" or an unsubscribe.
    if (marketingConsent && (!existing.marketingConsent || existing.unsubscribedAt)) {
      await db
        .update(subscribers)
        .set({ marketingConsent: true, consentText, consentAt: now, unsubscribedAt: null })
        .where(eq(subscribers.id, id));
    }
  }

  // No email tool connected yet: the store sends the file itself (spec's
  // "free list delivery (fallback)"). A failed email never fails the sign-up.
  try {
    await sendEmail({
      to: { email },
      ...leadMagnetEmail({
        magnet: input.magnet,
        pdfUrl: `${siteUrl()}${input.magnet.pdf}`,
        unsubscribeUrl: unsubscribeUrl(id),
        footer: await buyerFooter(),
        newsletter: marketingConsent,
      }),
    });
  } catch (err) {
    console.error(`Free download email failed (${input.magnet.source})`, err);
  }
  return { id };
}

/** Unsubscribe link from an email (already signature-checked). */
export async function unsubscribe(id: string) {
  await db.update(subscribers).set({ unsubscribedAt: new Date() }).where(eq(subscribers.id, id));
}
