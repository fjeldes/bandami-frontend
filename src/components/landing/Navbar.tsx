"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/hooks/useAuth";
import { getDashboardStats } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (user) {
      getDashboardStats().then(setStats).catch(() => {});
    } else {
      setStats(null);
    }
  }, [user]);

  const used = stats?.daily_evals_used ?? 0;
  const limit = stats?.daily_eval_limit ?? 4;

  return (
    <nav className="flex justify-between items-center w-full px-gutter py-4 sticky top-0 z-50 bg-surface border-b border-surface-container-high">
      <Link href="/" className="flex items-center">
        <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-16 w-auto" priority />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#how-it-works" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md">How it works</a>
        <a href="#pricing" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md">Pricing</a>
        <a href="#faq" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md">FAQ</a>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? null : user ? (
          <>
            <div className="hidden md:flex items-center text-on-surface-variant font-label-md text-label-md gap-2">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Daily: {used}/{limit}
            </div>
            <Link href="/dashboard" className="bg-primary-container text-on-primary font-label-md text-label-md px-5 py-2 rounded-full hover:bg-primary transition-colors">
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
