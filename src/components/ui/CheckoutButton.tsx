"use client";

import { useState } from "react";
import { redirectToCheckout } from "@/lib/payments";

export function CheckoutButton({
  planSlug,
  label,
  featured,
  href,
  discountPercent,
}: {
  planSlug: string;
  label: string;
  featured?: boolean;
  href: string;
  discountPercent?: number;
}) {
  const [loading, setLoading] = useState(false);

  if (planSlug === "free") {
    return (
      <a
        href={href}
        className={`w-full text-center font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.97] mt-auto block ${
          featured
            ? "bg-primary text-on-primary hover:scale-[0.98]"
            : "bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-high"
        }`}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await redirectToCheckout(planSlug, discountPercent);
        } catch {
          setLoading(false);
        }
      }}
      disabled={loading}
      className={`w-full text-center font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.97] mt-auto disabled:opacity-60 ${
        featured
          ? "bg-primary text-on-primary hover:scale-[0.98]"
          : "bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-high"
      }`}
    >
      {loading ? "Redirecting..." : label}
    </button>
  );
}
