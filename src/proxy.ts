import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { VARIANT_COOKIE, VARIANTS } from "@/lib/catalog";

// Admin pages reachable without a session (login + password recovery).
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot-password", "/admin/reset-password"]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin: fast, optimistic check (no session cookie → login). Pages and
  // /api/admin do the real check (session + role) on the server.
  if (pathname.startsWith("/admin")) {
    if (PUBLIC_ADMIN_PATHS.has(pathname) || getSessionCookie(request)) return NextResponse.next();
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Store pages: headline test, 50/50, sticky for 90 days. Set on the request
  // too, so the very first page view already renders its variant.
  const current = request.cookies.get(VARIANT_COOKIE)?.value;
  if (current && (VARIANTS as readonly string[]).includes(current)) return NextResponse.next();
  const variant = VARIANTS[Math.random() < 0.5 ? 0 : 1];
  request.cookies.set(VARIANT_COOKIE, variant);
  const response = NextResponse.next({ request });
  response.cookies.set(VARIANT_COOKIE, variant, { maxAge: 60 * 60 * 24 * 90, sameSite: "lax", path: "/" });
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/", "/pages/:path*", "/products/:path*"],
};
