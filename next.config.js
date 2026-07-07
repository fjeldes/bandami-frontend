/** @type {import('next').NextConfig} */
const vercelEnv = process.env.VERCEL_ENV || "development";
const isProd = vercelEnv === "production";
const apiHost = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : "http://localhost:8000";

const gf = "https://docs.google.com";
const lsAssets = "https://assets.lemonsqueezy.com";
const lsCheckout = "https://app.lemonsqueezy.com";
const frameSrc = isProd
  ? `'self' ${gf} https://*.paddle.com ${lsCheckout}`
  : `'self' ${gf} https://vercel.live https://*.paddle.com ${lsCheckout}`;

const gcs = "https://storage.googleapis.com";
const csp = isProd
  ? `default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.paddle.com ${lsAssets}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.paddle.com ${apiHost} ${gcs}; img-src 'self' data: https:; media-src 'self' blob:; frame-src ${frameSrc}`
  : `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://cdn.paddle.com ${lsAssets}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.paddle.com ${apiHost} https://vercel.live ${gcs}; img-src 'self' data: https:; media-src 'self' blob:; frame-src ${frameSrc}`;

const nextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiHost}/api/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
