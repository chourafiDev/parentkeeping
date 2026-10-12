import { hc } from "hono/client";
import type { AppType } from "@/server/api";

/**
 * Session expired (or the account was disabled) while a page was open:
 * send the user to the login page, then back here once signed in.
 */
async function fetchWithSessionCheck(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401 && window.location.pathname.startsWith("/admin")) {
    const next = window.location.pathname + window.location.search;
    // Full reload on purpose: runs outside React and drops stale client state.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/admin/login?next=${encodeURIComponent(next)}`);
  }
  return res;
}

// Typed client for our Hono API (browser only). Routes, params and responses
// are inferred from the server, e.g. api.api.admin.analytics.stats.$get(...)
export const api = hc<AppType>("/", { fetch: fetchWithSessionCheck });
