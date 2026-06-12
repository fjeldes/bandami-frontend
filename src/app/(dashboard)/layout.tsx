"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuthStore } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { dark, toggle: toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  const isFullScreen = pathname?.includes("/test") && user?.role !== "admin";

  return (
    <div className="flex min-h-screen">
      {!isFullScreen && <Sidebar />}
      <div className={`flex-1 flex flex-col min-h-screen ${isFullScreen ? "" : "md:ml-60"}`}>
        {!isFullScreen && (
          <header className="flex justify-end items-center w-full h-14 px-gutter bg-surface sticky top-0 z-40 md:border-none">
            <div className="flex items-center gap-4">

              <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors p-1" aria-label="Toggle dark mode">
                <span className="material-symbols-outlined text-[20px]">{dark ? "light_mode" : "dark_mode"}</span>
              </button>
              <Link href="/settings" aria-label="Settings" className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </div>
          </header>
        )}

        {isFullScreen ? (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>}>
            <ErrorBoundary>{children}</ErrorBoundary>
          </Suspense>
        ) : (
          <main className="flex-1 p-4 md:px-8 md:py-6 lg:px-12 lg:py-8 max-w-container-max mx-auto w-full pb-20 md:pb-0">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        )}

        {!isFullScreen && (
          <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 flex justify-around items-center h-16 z-40 px-1 pb-safe">
            {[
              { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
              { href: "/writing", label: "Writing", icon: "edit_note" },
              { href: "/speaking", label: "Speaking", icon: "record_voice_over" },
              { href: "/settings", label: "Settings", icon: "settings" },
            ].map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full h-full ${active ? "text-primary" : "text-on-surface-variant"}`}>
                  <span className={`material-symbols-outlined text-xl mb-0.5 ${active ? "filled" : ""}`} style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
