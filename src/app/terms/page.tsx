import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Bandami",
};

import { API_ROOT as API } from "@/lib/config";

export default async function TermsPage() {
  let html = "<p>Terms of service unavailable at this moment. Please try again later.</p>";
  try {
    const res = await fetch(`${API}/legal/terms`, { next: { revalidate: 86400 } });
    if (res.ok) html = await res.text();
  } catch {}

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
