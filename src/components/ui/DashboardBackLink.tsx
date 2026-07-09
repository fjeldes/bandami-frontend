"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuth";

export function DashboardBackLink() {
  const user = useAuthStore((s) => s.user);

  return (
    <Link
      href={user ? "/dashboard" : "/"}
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Link>
  );
}
