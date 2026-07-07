"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { API_ORIGIN as API_BASE } from "@/lib/config";
import { Mail, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { dark } = useTheme();

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
      <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex items-center justify-center p-4 md:p-8">
        <main className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            If an account exists for <span className="font-semibold text-slate-900 dark:text-white">{email}</span>, we sent a password reset link.
          </p>
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.1), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.1), transparent 25%)" }}
      />

      <main className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 z-10 relative">
        <header className="text-center mb-8">
          <Image src="/bandami.png" alt="Bandami" width={160} height={160} className="h-14 sm:h-20 w-auto mx-auto" priority style={dark ? { filter: "brightness(0) invert(1)" } : undefined} />
          <p className="text-base text-slate-600 dark:text-slate-400 mt-2">Reset your password</p>
        </header>

        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-lg py-3 pl-10 pr-4 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                id="email" type="email" placeholder="john@example.com" required
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="button" disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all mt-2 shadow-sm disabled:opacity-60">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline decoration-2 underline-offset-4">Back to Sign In</Link>
        </p>
      </main>
    </div>
  );
}
