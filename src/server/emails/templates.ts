import "server-only";
import { SITE } from "@/lib/site";

// Small, email-client-safe templates (inline styles, table layout, no CSS files).

const INK = "#1F2A24"; // text
const SAGE = "#4F6F5A"; // buttons (brand)

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout({ preheader, body }: { preheader: string; body: string }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#F1F0EB;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
<span style="display:none;max-height:0;overflow:hidden">${escape(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px">
<tr><td style="padding-bottom:8px;border-bottom:1px solid #ecebe6">
<div style="font-size:20px;font-weight:700;letter-spacing:-0.02em">${escape(SITE.name)}</div>
</td></tr>
<tr><td>
${body}
</td></tr></table>
<p style="font-size:12px;color:#6b726e;margin-top:16px">${escape(SITE.name)} · Store admin</p>
</td></tr></table>
</body></html>`;
}

function button(url: string, label: string) {
  return `<p style="margin:28px 0"><a href="${escape(url)}" style="display:inline-block;background:${SAGE};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${escape(label)}</a></p>
<p style="font-size:12px;color:#6b726e;word-break:break-all">If the button doesn't work, copy this link:<br>${escape(url)}</p>`;
}

export function resetPasswordEmail(p: { name: string; url: string }) {
  return {
    subject: `Reset your ${SITE.name} admin password`,
    html: layout({
      preheader: "Your link to choose a new password.",
      body: `<h1 style="font-size:20px;margin:20px 0 8px">Hi ${escape(p.name)},</h1>
<p style="font-size:15px;line-height:1.6;margin:0">You asked to reset your password for the ${escape(SITE.name)} admin.</p>
${button(p.url, "Choose a new password")}
<p style="font-size:14px;line-height:1.6;margin:0">This link is valid for 1 hour. If you didn't ask for it, ignore this email: your current password still works.</p>`,
    }),
    text: `Hi ${p.name},

You asked to reset your password for the ${SITE.name} admin.
Choose a new password (link valid for 1 hour):
${p.url}

If you didn't ask for it, ignore this email.`,
  };
}
