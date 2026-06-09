"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async () => {
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      if (msg.toLowerCase().includes("email not confirmed")) {
        router.push(`/register/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE}/auth/google/login`;
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-margin-mobile md:p-gutter relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 50%, rgba(37, 99, 235, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(254, 166, 25, 0.05), transparent 25%)",
        }}
      />

      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-gutter md:p-[32px] z-10 relative animate-scale-in">
        <header className="text-center mb-8">
          <Image src="/bandami.png" alt="Bandami" width={160} height={160} className="h-14 sm:h-20 w-auto mx-auto" priority />
          <h1 className="text-body-md text-on-surface-variant mt-2">
            Welcome back
          </h1>
        </header>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors duration-200"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            account_circle
          </span>
          <span className="font-mono text-data-md text-on-surface">
            Continue with Google
          </span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-outline-variant" />
          <span className="mx-4 text-label-sm text-on-surface-variant uppercase tracking-wider">
            or
          </span>
          <div className="flex-grow border-t border-outline-variant" />
        </div>

        {error && (
          <p className="text-body-md text-error bg-error-container/30 rounded-lg px-4 py-3 mb-4 text-center">
            {error}
          </p>
        )}

        <div className="space-y-5" onKeyDown={(e) => e.key === "Enter" && handleSubmit()}>
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm text-on-surface" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">
                mail
              </span>
              <input
                className="w-full bg-surface-container text-on-surface text-body-md rounded-lg py-3 pl-10 pr-4 border-2 border-transparent focus:bg-surface-container-lowest focus:border-primary-container focus:ring-0 outline-none transition-all placeholder:text-on-surface-variant/50"
                id="email"
                type="email"
                placeholder="john@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-label-sm text-on-surface" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="text-label-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">
                lock
              </span>
              <input
                className="w-full bg-surface-container text-on-surface text-body-md rounded-lg py-3 pl-10 pr-4 border-2 border-transparent focus:bg-surface-container-lowest focus:border-primary-container focus:ring-0 outline-none transition-all placeholder:text-on-surface-variant/50"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-primary text-on-primary font-mono text-data-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        <p className="text-center mt-8 text-body-md text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
          >
            Sign up for free
          </Link>
        </p>
      </main>
    </div>
  );
}
