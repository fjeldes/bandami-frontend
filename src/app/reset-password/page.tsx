"use client";

import { Suspense } from "react";
import { useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center p-6">
        <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-[64px] text-error mb-4">link_off</span>
          <h1 className="font-heading text-headline-md text-on-surface mb-2">Invalid Link</h1>
          <p className="text-body-md text-on-surface-variant mb-6">This reset link is missing or invalid.</p>
          <Link href="/forgot-password" className="text-primary font-semibold hover:underline">Request a new link</Link>
        </main>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center p-6">
        <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-[64px] text-primary mb-4">check_circle</span>
          <h1 className="font-heading text-headline-md text-on-surface mb-2">Password Reset</h1>
          <p className="text-body-md text-on-surface-variant mb-6">Your password has been updated.</p>
          <Link href="/login" className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity inline-block">Sign In</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-margin-mobile md:p-gutter relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(37, 99, 235, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(254, 166, 25, 0.05), transparent 25%)" }} />
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-gutter md:p-[32px] z-10 relative">
        <header className="text-center mb-8">
          <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-48 w-auto mx-auto" priority />
          <p className="text-body-md text-on-surface-variant mt-2">Choose a new password</p>
        </header>
        {error && <p className="text-body-md text-error bg-error-container/30 rounded-lg px-4 py-3 mb-4 text-center">{error}</p>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface" htmlFor="password">New Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">lock</span>
              <input className="w-full bg-surface-container text-on-surface text-body-md rounded-lg py-3 pl-10 pr-4 border-2 border-transparent focus:bg-surface-container-lowest focus:border-primary-container focus:ring-0 outline-none transition-all" id="password" type="password" placeholder="••••••••" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">lock_reset</span>
              <input className="w-full bg-surface-container text-on-surface text-body-md rounded-lg py-3 pl-10 pr-4 border-2 border-transparent focus:bg-surface-container-lowest focus:border-primary-container focus:ring-0 outline-none transition-all" id="confirmPassword" type="password" placeholder="••••••••" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-container text-on-primary font-mono text-data-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all mt-2 shadow-sm disabled:opacity-60">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
