"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_ORIGIN as API_BASE } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to send reset email");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-margin-mobile md:p-gutter">
        <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-gutter md:p-[32px] text-center">
          <span className="material-symbols-outlined text-[64px] text-primary mb-4">mark_email_read</span>
          <h1 className="font-heading text-headline-md text-on-surface mb-2">Check your inbox</h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            If an account exists for <span className="font-semibold">{email}</span>, we sent a password reset link.
          </p>
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Back to Sign In
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-margin-mobile md:p-gutter relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(37, 99, 235, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(254, 166, 25, 0.05), transparent 25%)" }}
      />

      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-gutter md:p-[32px] z-10 relative">
        <header className="text-center mb-8">
          <Image src="/bandami.png" alt="Bandami" width={160} height={160} className="h-14 sm:h-20 w-auto mx-auto" priority />
          <p className="text-body-md text-on-surface-variant mt-2">Reset your password</p>
        </header>

        {error && (
          <p className="text-body-md text-error bg-error-container/30 rounded-lg px-4 py-3 mb-4 text-center">{error}</p>
        )}

        <div className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface" htmlFor="email">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">mail</span>
              <input
                className="w-full bg-surface-container text-on-surface text-body-md rounded-lg py-3 pl-10 pr-4 border-2 border-transparent focus:bg-surface-container-lowest focus:border-primary-container focus:ring-0 outline-none transition-all placeholder:text-on-surface-variant/50"
                id="email" type="email" placeholder="john@example.com" required
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="button" disabled={loading}
            className="w-full bg-primary-container text-on-primary font-mono text-data-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all mt-2 shadow-sm disabled:opacity-60">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>

        <p className="text-center mt-8 text-body-md text-on-surface-variant">
          <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">Back to Sign In</Link>
        </p>
      </main>
    </div>
  );
}
