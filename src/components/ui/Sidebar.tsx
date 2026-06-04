"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isAdmin = user?.role === "admin";
  const isPremium = user?.subscription_tier === "premium";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/writing", label: "Writing", icon: "edit_note" },
    { href: "/speaking", label: "Speaking", icon: "record_voice_over" },
    { href: "/reading", label: "Reading", icon: "menu_book", comingSoon: true },
    { href: "/listening", label: "Listening", icon: "headphones", comingSoon: true },
    { href: "/history", label: "Reports", icon: "analytics" },
    { href: "/settings", label: "Settings", icon: "settings" },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Admin Dashboard", icon: "shield_person" },
    { href: "/admin/users", label: "Users", icon: "group" },
    { href: "/admin/exams", label: "Exams", icon: "assignment" },
    { href: "/admin/questions", label: "Questions", icon: "quiz" },
    { href: "/admin/plans", label: "Plans", icon: "sell" },
  ];

  const handleSignOut = () => { logout(); router.push("/"); };

  const navLinks = navItems.map((item) => {
    const isActive = pathname?.startsWith(item.href);
    const linkContent = (
      <span className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 text-label-sm w-full ${
        isActive && !item.comingSoon
          ? "text-primary font-semibold border-r-2 border-primary bg-surface-container-low"
          : item.comingSoon
          ? "text-on-surface-variant/40 cursor-default"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
      }`}>
        <span className="material-symbols-outlined mr-2.5 text-[20px]" aria-hidden="true" style={isActive && !item.comingSoon ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
        <span>{item.label}</span>
        {item.comingSoon && (
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-variant text-on-surface-variant/50">Soon</span>
        )}
      </span>
    );
    return item.comingSoon ? (
      <div key={item.href}>{linkContent}</div>
    ) : (
      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
        {linkContent}
      </Link>
    );
  });

  const adminNavLinks = adminNavItems.map((item) => {
    const isActive = pathname?.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 text-label-sm ${
          isActive
            ? "text-primary font-semibold border-r-2 border-primary bg-surface-container-low"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        }`}
      >
        <span className="material-symbols-outlined mr-2.5 text-[20px]" aria-hidden="true" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  });

  return (
    <>
      <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-64 max-w-[80vw] bg-surface shadow-xl flex flex-col">
            <div className="p-6 border-b border-outline-variant/30">
              <div className="flex items-center justify-between">
                <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-48 w-auto" priority />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="w-8 h-8 hover:bg-surface-container-high rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-4 gap-1">
              {navLinks}
              {isAdmin && (
                <>
                  <div className="h-px bg-outline-variant/30 my-2" />
                  <p className="px-4 text-label-xs text-on-surface-variant uppercase tracking-wider mb-1">Admin</p>
                  {adminNavLinks}
                </>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant/30">
              <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors text-left">
                <span className="material-symbols-outlined">logout</span><span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <nav className="hidden md:flex h-screen w-60 fixed left-0 top-0 border-r border-outline-variant/30 bg-surface-container-lowest flex-col px-3 z-50">
        <div className="my-6 px-2">
          <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-20 w-auto" priority />
        </div>
        <div className="flex-1 space-y-0.5">
          {navLinks}
          {isAdmin && (
            <>
              <div className="h-px bg-outline-variant/30 my-2" />
              <p className="px-4 text-label-xs text-on-surface-variant uppercase tracking-wider mb-1">Admin</p>
              {adminNavLinks}
            </>
          )}
        </div>
        <div className="mt-auto pt-4 border-t border-outline-variant/30 space-y-1.5 mb-3">
          {!isAdmin && !isPremium && (
            <Link href="/pricing" className="w-full py-2 px-3 rounded-full bg-primary-container text-on-primary text-label-sm hover:bg-primary hover:text-on-primary transition-colors text-center block">
              Upgrade to Premium
            </Link>
          )}
          {isPremium && (
            <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-primary-fixed/30 text-primary-fixed text-label-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Premium
            </div>
          )}
          <button onClick={handleSignOut} className="flex items-center px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors duration-200 w-full text-left">
            <span className="material-symbols-outlined mr-2.5 text-[20px]">logout</span>
            <span className="text-label-sm">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
