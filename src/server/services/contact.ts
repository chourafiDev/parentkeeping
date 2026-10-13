import "server-only";
import { contactQuestionEmail } from "@/server/emails/templates";
import { sendEmail } from "@/server/lib/email";
import { rateLimit } from "@/server/lib/rate-limit";
import { getSettings } from "@/server/queries/settings";

export class ContactError extends Error {
  constructor(
    message: string,
    public status: 400 | 429 | 503 = 400,
  ) {
    super(message);
  }
}

/**
 * "Ask a question" on a product page → one email to the store's support
 * address, reply-to the visitor so answering is a plain reply.
 */
export async function submitContactQuestion(input: {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  productTitle: string | null;
  ip: string | null;
}) {
  if (input.ip && !(await rateLimit(`contact:${input.ip}`, 5, 60 * 60))) {
    throw new ContactError("Too many messages from this connection. Try again in a while.", 429);
  }

  const { contact } = await getSettings("contact");
  if (!contact.supportEmail) {
    throw new ContactError("We can't take messages right now. Please try again later.", 503);
  }

  await sendEmail({
    to: { email: contact.supportEmail },
    replyTo: { email: input.email, name: input.name },
    ...contactQuestionEmail({
      name: input.name,
      email: input.email,
      phone: input.phone,
      productTitle: input.productTitle,
      message: input.message,
    }),
  });
}
