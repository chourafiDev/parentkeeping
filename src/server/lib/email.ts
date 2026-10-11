import "server-only";

// Transactional email via Brevo (https://developers.brevo.com/reference/sendtransacemail).
// Without BREVO_API_KEY (local dev), emails are printed to the terminal instead.

export interface EmailMessage {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(message: EmailMessage) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Parentkeeping";

  if (!apiKey || !fromEmail) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured (BREVO_API_KEY / EMAIL_FROM_ADDRESS).");
    }
    console.info(
      `\n📧 [email not configured — printed instead]\nTo: ${message.to.email}\nSubject: ${message.subject}\n\n${message.text}\n`,
    );
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [message.to],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
    }),
  });
  if (!res.ok) {
    throw new Error(`Brevo error ${res.status}: ${await res.text().catch(() => "")}`);
  }
}
