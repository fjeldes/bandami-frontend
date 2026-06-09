import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://bandami.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/writing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/speaking`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/reading`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/history`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];
}
