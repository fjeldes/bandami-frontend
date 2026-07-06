"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { showSuccess } from "@/components/ui/Toast";
import { API_ORIGIN as API_BASE } from "@/lib/config";

function RegisterForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const planSlug = searchParams.get("plan") || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  const [redirecting, setRedirecting] = useState(false);
  const [acceptTos, setAcceptTos] = useState(false);
  const [acceptAI, setAcceptAI] = useState(false);

  useEffect(() => {
    if (user) {
      setRedirecting(true);
      router.push("/dashboard");
    }
  }, [user, router]);

  if (isLoading || redirecting || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (loading) return;
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!acceptTos) {
      setError("You must accept the Terms of Service.");
      return;
    }

    if (!acceptAI) {
      setError("You must authorize AI processing of your submissions.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, refCode || undefined);
      showSuccess("Account created! Check your email to verify.");
      if (planSlug) sessionStorage.setItem("pending_plan", planSlug);
      setTimeout(() => router.push(`/register/verify-email?email=${encodeURIComponent(email)}`), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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

      <main className="w-full max-w-md ds-card-interactive p-gutter md:p-[32px] z-10 relative animate-scale-in">
        <header className="text-center mb-8">
          <Image src="/bandami.png" alt="Bandami" width={160} height={160} className="h-14 sm:h-20 w-auto mx-auto" priority />
          <h1 className="text-body-md text-on-surface-variant mt-2">Create your free account</h1>
        </header>

        {refCode && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">redeem</span>
            <p className="text-label-sm text-on-surface-variant">You&apos;ve been invited! Your friend will get credit when you sign up.</p>
          </div>
        )}

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
            <label className="text-label-sm text-on-surface" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">
                person
              </span>
              <input
                className="w-full bg-surface-container text-on-surface text-body-md rounded-lg py-3 pl-10 pr-4 border-2 border-transparent focus:bg-surface-container-lowest focus:border-primary-container focus:ring-0 outline-none transition-all placeholder:text-on-surface-variant/50"
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
            <label className="text-label-sm text-on-surface" htmlFor="password">
              Password
            </label>
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-label-sm text-on-surface"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">
                lock_reset
              </span>
              <input
                className="w-full bg-surface-container text-on-surface text-body-md rounded-lg py-3 pl-10 pr-4 border-2 border-transparent focus:bg-surface-container-lowest focus:border-primary-container focus:ring-0 outline-none transition-all placeholder:text-on-surface-variant/50"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-start gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTos}
              onChange={(e) => setAcceptTos(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="text-label-sm text-on-surface-variant">
              I accept the{" "}
              <Link href="/terms" target="_blank" className="text-primary underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" target="_blank" className="text-primary underline">Privacy Policy</Link>
            </span>
          </label>

          <label className="flex items-start gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptAI}
              onChange={(e) => setAcceptAI(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="text-label-sm text-on-surface-variant">
              I authorize Bandami to process my essays and voice recordings using AI for evaluation purposes
            </span>
          </label>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-primary text-on-primary font-mono text-data-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all mt-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        <p className="text-center mt-8 text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>}>
      <RegisterForm />
    </Suspense>
  );
}
