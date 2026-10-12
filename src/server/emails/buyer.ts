import "server-only";
import { QUIZ_RESULTS } from "@/lib/burnout-quiz";
import type { LeadMagnet } from "@/lib/lead-magnets";
import { ORDER_CONSENT_LINE, QUIZ_RESULT_FOOTER } from "@/lib/legal";
import { siteUrl } from "@/lib/site-url";
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

/** Order confirmation: download link, parts with "arrives by" dates, consent line, guarantee. */
export function orderConfirmationEmail(p: {
  orderNumber: number;
  downloadsUrl: string;
  parts: { label: string; availableAt: Date | null }[];
  refundPolicyUrl: string;
  footer: EmailFooter;
  resent?: boolean;
}) {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  const partLine = (part: (typeof p.parts)[number]) =>
    part.availableAt ? `${part.label} — arrives by ${fmt(part.availableAt)}` : `${part.label} — ready to download`;
  const rows = p.parts
    .map(
      (part) =>
        `<tr><td style="padding:6px 0;font-size:14px;border-bottom:1px solid #ecebe6">${escape(part.label)}</td><td style="padding:6px 0;font-size:13px;text-align:right;white-space:nowrap;border-bottom:1px solid #ecebe6;color:${part.availableAt ? "#92400e" : SAGE}">${part.availableAt ? `Arrives by ${escape(fmt(part.availableAt))}` : "Ready"}</td></tr>`,
    )
    .join("");
  const intro = p.resent
    ? `Here's a fresh link to your downloads for order #${p.orderNumber}.`
    : `Thank you for your order #${p.orderNumber}. Everything you bought is on your downloads page.`;
  return {
    subject: p.resent ? `Your Parentkeeping downloads (order #${p.orderNumber})` : `Your Parentkeeping order #${p.orderNumber}`,
    html: layout({
      footer: p.footer,
      preheader: intro,
      body: `<h1 style="font-size:20px;margin:20px 0 8px">${p.resent ? "Your downloads" : "Thank you, your files are ready"}</h1>
<p style="font-size:15px;line-height:1.6;margin:0">${escape(intro)}</p>
${button(p.downloadsUrl, "Go to my downloads")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">${rows}</table>
<p style="font-size:13px;line-height:1.6;margin:0 0 12px;color:${MUTED}">${escape(ORDER_CONSENT_LINE)}</p>
<p style="font-size:14px;line-height:1.6;margin:0">${escape(GUARANTEE)} <a href="${escape(p.refundPolicyUrl)}" style="color:${SAGE}">Refund policy</a>${p.footer.supportEmail ? ` · Questions? Write to ${escape(p.footer.supportEmail)}.` : ""}</p>`,
    }),
    text: `${intro}

Your downloads: ${p.downloadsUrl}

${p.parts.map(partLine).join("\n")}

${ORDER_CONSENT_LINE}

${GUARANTEE} Refund policy: ${p.refundPolicyUrl}${p.footer.supportEmail ? `\nQuestions? Write to ${p.footer.supportEmail}.` : ""}

${[SITE.name, p.footer.postalAddress].filter(Boolean).join("\n")}`,
  };
}

/** Non-US billing country: polite refund (paid products are US-only for now). */
export function nonUsRefundEmail(p: { orderNumber: number; amount: string; freeListUrl: string; footer: EmailFooter }) {
  return {
    subject: `Your Parentkeeping order #${p.orderNumber} has been refunded`,
    html: layout({
      footer: p.footer,
      preheader: `We've refunded ${p.amount}: our paid products are US-only for now.`,
      body: `<h1 style="font-size:20px;margin:20px 0 8px">We've refunded your order</h1>
<p style="font-size:15px;line-height:1.6;margin:0 0 12px">Thank you for your order #${p.orderNumber}. Our paid products are only available to US customers for now (US-specific forms, laws and sales tax), so we've refunded the full ${escape(p.amount)} to your card. It usually shows within 5 to 10 business days.</p>
<p style="font-size:15px;line-height:1.6;margin:0">Our free Medication List &amp; Daily Medication Chart works anywhere:</p>
${button(p.freeListUrl, "Get the free list")}
<p style="font-size:14px;line-height:1.6;margin:0">We're sorry for the trouble.${p.footer.supportEmail ? ` Questions? Write to ${escape(p.footer.supportEmail)}.` : ""}</p>`,
    }),
    text: `We've refunded your order #${p.orderNumber}

Our paid products are only available to US customers for now, so we've refunded the full ${p.amount} to your card (5 to 10 business days).

Our free Medication List works anywhere: ${p.freeListUrl}
${p.footer.supportEmail ? `\nQuestions? Write to ${p.footer.supportEmail}.` : ""}

${[SITE.name, p.footer.postalAddress].filter(Boolean).join("\n")}`,
  };
}

/** Free download delivery (fallback until the email tool sends welcome email 1). */
export function leadMagnetEmail(p: { magnet: LeadMagnet; pdfUrl: string; unsubscribeUrl: string; footer: EmailFooter; newsletter: boolean }) {
  const e = p.magnet.email;
  return {
    subject: e.subject,
    html: layout({
      footer: p.footer,
      preheader: e.preheader,
      body: `<h1 style="font-size:20px;margin:20px 0 8px">${escape(e.heading)}</h1>
<p style="font-size:15px;line-height:1.6;margin:0">${escape(e.text)}</p>
${button(p.pdfUrl, e.button)}
<p style="font-size:13px;line-height:1.6;margin:0;color:${MUTED}">${escape(e.legal)}</p>
<p style="font-size:12px;line-height:1.6;margin:16px 0 0;color:${MUTED}">${p.newsletter ? "You'll also get our weekly caregiving emails. " : ""}<a href="${escape(p.unsubscribeUrl)}" style="color:${MUTED}">Unsubscribe</a></p>`,
    }),
    text: `${e.heading}

${e.text}
${p.pdfUrl}

${e.legal}

${p.newsletter ? "You'll also get our weekly caregiving emails. " : ""}Unsubscribe: ${p.unsubscribeUrl}

${[SITE.name, p.footer.postalAddress].filter(Boolean).join("\n")}`,
  };
}

/** Burnout quiz: the same email for everyone, with the plan for every band (no score, no answers). */
export function quizPlansEmail(p: { unsubscribeUrl: string; footer: EmailFooter; newsletter: boolean }) {
  const base = siteUrl();
  const nextHtml = (next: (typeof QUIZ_RESULTS)[number]["next"]) =>
    next.map((s) => (s.href ? `<a href="${escape(base + s.href)}" style="color:${SAGE}">${escape(s.text)}</a>` : escape(s.text))).join("");
  const nextText = (next: (typeof QUIZ_RESULTS)[number]["next"]) => next.map((s) => (s.href ? `${s.text} (${base}${s.href})` : s.text)).join("");
  return {
    subject: "Your caregiver burnout quiz plans",
    html: layout({
      footer: p.footer,
      preheader: "A short plan for every result band, so you can find yours.",
      body: `<h1 style="font-size:20px;margin:20px 0 8px">Your caregiver burnout quiz plans</h1>
<p style="font-size:15px;line-height:1.6;margin:0">Here is a short plan for each result band. Find the one that matched your result.</p>
${QUIZ_RESULTS.map(
  (r) => `<h2 style="font-size:16px;margin:24px 0 6px">${escape(r.title)} (${r.min} to ${r.max})</h2>
<p style="font-size:15px;line-height:1.6;margin:0 0 8px">${escape(r.text)}</p>
<p style="font-size:15px;line-height:1.6;margin:0">${nextHtml(r.next)}</p>`,
).join("\n")}
<p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:${MUTED}">${escape(QUIZ_RESULT_FOOTER)}</p>
<p style="font-size:12px;line-height:1.6;margin:16px 0 0;color:${MUTED}">${p.newsletter ? "You'll also get our weekly caregiving emails. " : ""}<a href="${escape(p.unsubscribeUrl)}" style="color:${MUTED}">Unsubscribe</a></p>`,
    }),
    text: `Your caregiver burnout quiz plans

Here is a short plan for each result band. Find the one that matched your result.

${QUIZ_RESULTS.map((r) => `${r.title} (${r.min} to ${r.max})\n${r.text}\n${nextText(r.next)}`).join("\n\n")}

${QUIZ_RESULT_FOOTER}

${p.newsletter ? "You'll also get our weekly caregiving emails. " : ""}Unsubscribe: ${p.unsubscribeUrl}

${[SITE.name, p.footer.postalAddress].filter(Boolean).join("\n")}`,
  };
}
