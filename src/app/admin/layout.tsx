"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/exams", label: "Exams", icon: "assignment" },
  { href: "/admin/questions", label: "Questions", icon: "quiz" },
  { href: "/admin/plans", label: "Plans", icon: "sell" },
  { href: "/admin/analytics", label: "Analytics", icon: "bar_chart" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);

  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <button onClick={() => setMobileNav(true)} aria-label="Open admin menu" className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>

      {mobileNav && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileNav(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-64 ds-card-interactive flex flex-col overflow-y-auto">
            <div className="p-5 border-b border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">shield_person</span>
              <span className="font-headline-md text-headline-md font-bold text-primary">Admin</span>
            </div>
            <div className="flex-1 flex flex-col p-3 gap-1">
              {adminNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileNav(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-label-sm font-semibold ${
                    pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                      ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>{item.label}
                </Link>
              ))}
            </div>
            <div className="p-3 border-t border-outline-variant/30 flex flex-col gap-1">
              <Link href="/dashboard" onClick={() => setMobileNav(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to App
              </Link>
              <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-label-sm text-error hover:bg-error-container/20 transition-colors text-left">
                <span className="material-symbols-outlined text-[18px]">logout</span>Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      <nav className="hidden md:flex w-60 ds-card-interactive border-r border-outline-variant/30 flex-col shrink-0">
        <div className="p-5 border-b border-outline-variant/30 flex items-center gap-2">
          <span className="material-symbols-outlined filled text-primary">shield_person</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">Admin</span>
        </div>
        <div className="flex-1 flex flex-col p-3 gap-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-label-sm font-semibold ${
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  ? "bg-primary-container text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="p-3 border-t border-outline-variant/30 flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to App
          </Link>
          <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-label-sm text-error hover:bg-error-container/20 transition-colors text-left">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </nav>
      <main className="flex-1 p-6 overflow-y-auto bg-surface">{children}</main>
    </div>
  );
}
