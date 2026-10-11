import type { NextConfig } from "next";

// Browser hardening for every page (Vercel adds HSTS itself on HTTPS domains).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" }, // no file-type guessing
  { key: "X-Frame-Options", value: "SAMEORIGIN" }, // can't be embedded in another site (clickjacking)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
