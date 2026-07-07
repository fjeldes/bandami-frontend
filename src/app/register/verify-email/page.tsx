"use client";

import { useState } from "react";
import Link from "next/link";
import { API_ORIGIN as API_BASE } from "@/lib/config";
import { Mail, AlertCircle } from "lucide-react";

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
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.1), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.1), transparent 25%)" }}
      />
      <main className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 z-10 relative text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
          {email ? <>We sent a verification link to <span className="font-semibold text-slate-900 dark:text-white">{email}</span>.</> : "We sent a verification link to your email."} Click the link to activate your account.
        </p>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-2 mb-4 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button onClick={handleResend} disabled={status === "sent"}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm mb-4 disabled:opacity-60">
          {status === "sent" ? "Email Sent!" : "Resend Verification Email"}
        </button>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Already verified?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline decoration-2 underline-offset-4">Sign in</Link>
        </p>
      </main>
    </div>
  );
}
