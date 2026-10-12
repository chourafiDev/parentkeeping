import "server-only";
import { eq } from "drizzle-orm";
import { OPT_IN_COUNTRIES } from "@/lib/free-list";
import { QUIZ_EMAIL_BOX, QUIZ_SOURCE } from "@/lib/burnout-quiz";
import type { LeadMagnet } from "@/lib/lead-magnets";
import { EU_NEWSLETTER_CHECKBOX, signupNotice } from "@/lib/legal";
import { siteUrl } from "@/lib/site-url";
import { db } from "@/server/db";
import { subscribers } from "@/server/db/schema";
import { leadMagnetEmail, quizPlansEmail } from "@/server/emails/buyer";
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

type SignupMeta = { email: string; country: string | null; variant: string | null; ip: string | null; turnstileToken?: string };

/** Rate limit + bot check, shared by every sign-up form. */
async function guardSignup({ ip, turnstileToken }: SignupMeta) {
  if (ip && !(await rateLimit(`signup:${ip}`, 10, 60 * 60))) {
    throw new SignupError("Too many sign-ups from this connection. Try again in a while.", 429);
  }
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    throw new SignupError("We couldn't check that you're not a robot. Refresh the page and try again.");
  }
}

/**
 * Records exactly what the person saw and agreed to. Signing up again never
 * downgrades an existing consent; the first sign-up's source is kept.
 */
async function saveSubscriber(input: SignupMeta & { source: string; marketingConsent: boolean; consentText: string }) {
  const email = input.email.trim().toLowerCase();
  const now = new Date();
  const [existing] = await db.select().from(subscribers).where(eq(subscribers.email, email));
  if (!existing) {
    const [row] = await db
      .insert(subscribers)
      .values({
        email,
        source: input.source,
        country: input.country,
        marketingConsent: input.marketingConsent,
        consentText: input.consentText,
        consentAt: now,
        testVariant: input.variant,
      })
      .onConflictDoNothing({ target: subscribers.email })
      .returning({ id: subscribers.id });
    const id = row?.id ?? (await db.select({ id: subscribers.id }).from(subscribers).where(eq(subscribers.email, email)))[0].id;
    return { id, email };
  }
  // Only upgrade: a new "yes" replaces an old "no" or an unsubscribe.
  if (input.marketingConsent && (!existing.marketingConsent || existing.unsubscribedAt)) {
    await db
      .update(subscribers)
      .set({ marketingConsent: true, consentText: input.consentText, consentAt: now, unsubscribedAt: null })
      .where(eq(subscribers.id, existing.id));
  }
  return { id: existing.id, email };
}

/** Free download sign-up (Medication List, Checklists), then the PDF by email. */
export async function subscribeToLeadMagnet(input: SignupMeta & { magnet: LeadMagnet; newsletterBox: boolean }) {
  await guardSignup(input);
  const optIn = needsOptIn(input.country);
  const marketingConsent = optIn ? input.newsletterBox : true;
  const { id, email } = await saveSubscriber({
    ...input,
    source: input.magnet.source,
    marketingConsent,
    consentText: optIn
      ? `Checkbox "${EU_NEWSLETTER_CHECKBOX}": ${input.newsletterBox ? "ticked" : "left unticked"}`
      : `${signupNotice(input.magnet.noticeWhat)} [Privacy Policy]`,
  });

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

/**
 * Burnout quiz "Email me my result": only the email is stored (never the
 * answers). Everyone gets the same email with all four plans; weekly emails
 * only when the unticked box is ticked, wherever the visitor is.
 */
export async function subscribeToQuizPlans(input: SignupMeta & { newsletterBox: boolean }) {
  await guardSignup(input);
  const { id, email } = await saveSubscriber({
    ...input,
    source: QUIZ_SOURCE,
    marketingConsent: input.newsletterBox,
    consentText: `Quiz plans by email. Checkbox "${QUIZ_EMAIL_BOX.checkbox}": ${input.newsletterBox ? "ticked" : "left unticked"}`,
  });
  try {
    await sendEmail({
      to: { email },
      ...quizPlansEmail({ unsubscribeUrl: unsubscribeUrl(id), footer: await buyerFooter(), newsletter: input.newsletterBox }),
    });
  } catch (err) {
    console.error("Quiz plans email failed", err);
  }
  return { id };
}

/** Unsubscribe link from an email (already signature-checked). */
export async function unsubscribe(id: string) {
  await db.update(subscribers).set({ unsubscribedAt: new Date() }).where(eq(subscribers.id, id));
}
