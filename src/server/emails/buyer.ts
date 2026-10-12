import "server-only";
import { SITE } from "@/lib/site";

// Buyer-facing emails (order emails come with the Stripe webhook).
// Email-client-safe: inline styles, table layout.

const INK = "#1F2A24";
const SAGE = "#4F6F5A";
const MUTED = "#6b726e";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type EmailFooter = { supportEmail: string | null; postalAddress: string | null };

function layout({ preheader, body, footer }: { preheader: string; body: string; footer: EmailFooter }) {
  const lines = [SITE.name, footer.postalAddress, footer.supportEmail].filter(Boolean).map((l) => escape(l!));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#F1F0EB;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
<span style="display:none;max-height:0;overflow:hidden">${escape(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;padding:32px">
<tr><td style="padding-bottom:8px;border-bottom:1px solid #ecebe6">
<div style="font-size:20px;font-weight:700;letter-spacing:-0.02em">${escape(SITE.name)}</div>
</td></tr>
<tr><td>
${body}
</td></tr></table>
<p style="font-size:12px;line-height:1.6;color:${MUTED};margin-top:16px">${lines.join("<br>")}</p>
</td></tr></table>
</body></html>`;
}

function button(url: string, label: string) {
  return `<p style="margin:28px 0"><a href="${escape(url)}" style="display:inline-block;background:${SAGE};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${escape(label)}</a></p>
<p style="font-size:12px;color:${MUTED};word-break:break-all">If the button doesn't work, copy this link:<br>${escape(url)}</p>`;
}

const GUARANTEE = "Remember: you're covered by our 14-day “if it doesn't help” guarantee.";

/** "Your [part] is ready" — a pre-sale file went live. */
export function fileReadyEmail(p: { fileLabel: string; orderNumber: number; downloadsUrl: string; footer: EmailFooter }) {
  return {
    subject: `Your ${p.fileLabel} is ready`,
    html: layout({
      footer: p.footer,
      preheader: `It's on your downloads page now (order #${p.orderNumber}).`,
      body: `<h1 style="font-size:20px;margin:20px 0 8px">Your ${escape(p.fileLabel)} is ready</h1>
<p style="font-size:15px;line-height:1.6;margin:0">Good news: the part you pre-ordered with order #${p.orderNumber} is ready. You'll find it on your downloads page with everything else from your order.</p>
${button(p.downloadsUrl, "Go to my downloads")}
<p style="font-size:14px;line-height:1.6;margin:0">${escape(GUARANTEE)}${p.footer.supportEmail ? ` Questions? Reply to this email or write to ${escape(p.footer.supportEmail)}.` : ""}</p>`,
    }),
    text: `Your ${p.fileLabel} is ready

The part you pre-ordered with order #${p.orderNumber} is ready. Get it from your downloads page:
${p.downloadsUrl}

${GUARANTEE}${p.footer.supportEmail ? `\nQuestions? Write to ${p.footer.supportEmail}.` : ""}

${[SITE.name, p.footer.postalAddress].filter(Boolean).join("\n")}`,
  };
}
