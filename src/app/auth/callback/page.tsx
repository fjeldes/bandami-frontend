"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const setTokens = useAuthStore((s) => s.setTokens);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const verificationToken = searchParams.get("token");
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token") || "";
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Authentication failed. Please try again.");
        return;
      }

      try {
        if (verificationToken) {
          await verifyEmail(verificationToken);
          window.location.href = "/dashboard";
        } else if (accessToken) {
          setTokens(accessToken, refreshToken);
          await refreshSession();
          if (useAuthStore.getState().user) {
            window.location.href = "/dashboard";
          } else {
            setError("Could not complete login. Please try again.");
          }
        } else {
          setError("Invalid callback parameters.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };
    handleCallback();
  }, [searchParams, router, verifyEmail, setTokens]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
          <h1 className="text-headline-md font-bold text-on-surface mb-2">Authentication Failed</h1>
          <p className="text-body-md text-on-surface-variant mb-6">{error}</p>
          <Link href="/login" className="bg-primary text-on-primary font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity inline-block">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
