"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("cookie_consent");
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] ds-card border-t border-outline-variant/30 shadow-lg p-4 md:p-5">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-body-sm text-on-surface-variant flex-1">
          We use cookies to secure your session and improve your experience. See our{" "}
          <Link href="/privacy" className="text-primary underline hover:opacity-80">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { localStorage.setItem("cookie_consent", "true"); setVisible(false); }}
            className="bg-accent text-on-accent font-semibold px-5 py-2 rounded-xl text-label-sm hover:bg-accent-hover transition-all hover:-translate-y-0.5"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
