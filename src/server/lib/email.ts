import "server-only";

// Transactional email via Resend (https://resend.com/docs/api-reference/emails/send-email).
// Without RESEND_API_KEY (local dev), emails are printed to the terminal instead.

export interface EmailMessage {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
  /** So the store owner can hit "reply" and answer the visitor directly. */
  replyTo?: { email: string; name?: string };
}

/** "Name <email>" when a name is given, else just the address. */
const address = (p: { email: string; name?: string }) => (p.name ? `${p.name} <${p.email}>` : p.email);

export async function sendEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Parentkeeping";

  if (!apiKey || !fromEmail) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured (RESEND_API_KEY / EMAIL_FROM_ADDRESS).");
    }
    console.info(
      `\n📧 [email not configured — printed instead]\nTo: ${message.to.email}${message.replyTo ? `\nReply-To: ${message.replyTo.email}` : ""}\nSubject: ${message.subject}\n\n${message.text}\n`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: address({ email: fromEmail, name: fromName }),
      to: [address(message.to)],
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo && { reply_to: address(message.replyTo) }),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${await res.text().catch(() => "")}`);
  }
}
