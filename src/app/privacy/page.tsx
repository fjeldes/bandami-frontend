import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Bandami",
};

const API = (() => { try { return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").origin; } catch { return "http://localhost:8000"; } })();

export default async function PrivacyPage() {
  let html = "<p>Privacy policy unavailable at this moment. Please try again later.</p>";
  try {
    const res = await fetch(`${API}/legal/privacy`, { next: { revalidate: 86400 } });
    if (res.ok) html = await res.text();
  } catch {}

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
