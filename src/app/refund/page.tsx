import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Bandami",
};

import { API_ROOT as API } from "@/lib/config";

export default async function RefundPage() {
  let html = "<p>Refund policy unavailable at this moment. Please try again later.</p>";
  try {
    const res = await fetch(`${API}/legal/refund`, { next: { revalidate: 86400 } });
    if (res.ok) html = await res.text();
  } catch {}

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
