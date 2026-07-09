"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuthStore } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import Image from "next/image";

function PublicHeader() {
  const { dark, toggle } = useTheme();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-8 w-auto" priority />
          </Link>
        </div>
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
