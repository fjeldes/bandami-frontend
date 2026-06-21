import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Bandami",
};

const API = (() => { try { return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").origin; } catch { return "http://localhost:8000"; } })();

export default async function TermsPage() {
  let html = "<p>Terms of service unavailable at this moment. Please try again later.</p>";
  try {
    const res = await fetch(`${API}/legal/terms`, { next: { revalidate: 86400 } });
    if (res.ok) html = await res.text();
  } catch {}

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
