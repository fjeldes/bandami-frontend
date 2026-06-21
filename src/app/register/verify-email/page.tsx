"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE = (() => { const u = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"; return u.endsWith("/api/v1") ? u : u.replace(/\/+$/, "") + "/api/v1"; })();

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState("");

  const email = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("email") || ""
    : "";

  const handleResend = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || "unknown@example.com" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to resend");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to resend");
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-margin-mobile md:p-gutter relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(37, 99, 235, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(254, 166, 25, 0.05), transparent 25%)" }}
      />
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-gutter md:p-[32px] z-10 relative text-center">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4">mark_email_read</span>
        <h1 className="font-heading text-headline-md text-on-surface mb-2">Check your inbox</h1>
        <p className="text-body-md text-on-surface-variant mb-8">
          {email ? <>We sent a verification link to <span className="font-semibold text-on-surface">{email}</span>.</> : "We sent a verification link to your email."} Click the link to activate your account.
        </p>

        {error && <p className="text-body-md text-error bg-error-container/30 rounded-lg px-4 py-2 mb-4">{error}</p>}

        <button onClick={handleResend} disabled={status === "sent"}
          className="w-full bg-primary-container text-on-primary font-mono text-data-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm mb-4 disabled:opacity-60">
          {status === "sent" ? "Email Sent!" : "Resend Verification Email"}
        </button>

        <p className="text-body-md text-on-surface-variant">
          Already verified?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">Sign in</Link>
        </p>
      </main>
    </div>
  );
}
