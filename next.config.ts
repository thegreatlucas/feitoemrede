import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.clarity.ms https://scripts.clarity.ms; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://yjvsqzcvcwdzwurljady.supabase.co https://*.clarity.ms https://c.bing.com; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.clarity.ms https://c.bing.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
      {
        source: "/talentos/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Vary", value: "Cookie" },
        ],
      },
    ];
  },
};
export default config;
