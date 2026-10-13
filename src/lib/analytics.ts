/** localStorage flag on the owner's browsers: their store visits aren't tracked (set on opening the admin). */
export const EXCLUDE_KEY = "pk_exclude_analytics";

/**
 * Never tracked, by any tracker (our own first-party one, Google Analytics):
 * the burnout quiz (legal: no pixels there, under any circumstance), buyers'
 * download pages, dev tools.
 */
export const EXCLUDED_PATHS = ["/pages/caregiver-burnout-quiz", "/downloads", "/dev"];

export const isExcludedPath = (pathname: string) => EXCLUDED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/** Client-only: Global Privacy Control, Do Not Track, or the owner's own browser. */
export function isTrackingOptedOut() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl === true || nav.doNotTrack === "1") return true;
  try {
    return localStorage.getItem(EXCLUDE_KEY) === "1";
  } catch {
    return false;
  }
}
