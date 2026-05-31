"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-[56px] text-error mb-4">bug_report</span>
        <h1 className="text-headline-md font-bold text-on-surface mb-2">Something went wrong</h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-primary text-on-primary font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-label-sm">
            Try Again
          </button>
          <Link href="/dashboard" className="border border-outline-variant text-on-surface font-semibold px-5 py-2.5 rounded-lg hover:bg-surface-container transition-colors text-label-sm">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
