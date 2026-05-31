"use client";

import { useState } from "react";
import { redirectToCheckout } from "@/lib/stripe";

export function CheckoutButton({
  planSlug,
  label,
  featured,
  href,
}: {
  planSlug: string;
  label: string;
  featured?: boolean;
  href: string;
}) {
  const [loading, setLoading] = useState(false);

  if (planSlug === "free") {
    return (
      <a
        href={href}
        className={`w-full text-center font-bold px-4 py-3 rounded-lg shadow-sm transition-all active:scale-95 mt-auto block ${
          featured
            ? "bg-primary text-on-primary hover:opacity-90"
            : "bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low"
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
          await redirectToCheckout(planSlug);
        } catch {
          setLoading(false);
        }
      }}
      disabled={loading}
      className={`w-full text-center font-bold px-4 py-3 rounded-lg shadow-sm transition-all active:scale-95 mt-auto disabled:opacity-60 ${
        featured
          ? "bg-primary text-on-primary hover:opacity-90"
          : "bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low"
      }`}
    >
      {loading ? "Redirecting..." : label}
    </button>
  );
}
