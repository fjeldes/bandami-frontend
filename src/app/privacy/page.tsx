import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Bandami",
};

import { API_ROOT as API } from "@/lib/config";

export default async function PrivacyPage() {
  let html = "<p>Privacy policy unavailable at this moment. Please try again later.</p>";
  try {
    const res = await fetch(`${API}/legal/privacy`, { next: { revalidate: 86400 } });
    if (res.ok) html = await res.text();
  } catch {}

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
