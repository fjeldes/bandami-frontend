/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const csp = isProd
  ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:; media-src 'self' blob:"
  : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co http://localhost:8000; img-src 'self' data: https:; media-src 'self' blob:";

const nextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    return [
      { source: "/terms", destination: apiUrl.replace("/api/v1", "") + "/legal/terms" },
      { source: "/privacy", destination: apiUrl.replace("/api/v1", "") + "/legal/privacy" },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
