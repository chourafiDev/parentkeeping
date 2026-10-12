/** Absolute site URL for links in emails, e.g. https://parentkeeping.com (no trailing slash). */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3001").replace(/\/+$/, "");
}
