"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const { dark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const isPremium = user?.subscription_tier === "premium" || user?.role === "admin";

  return (
    <nav className="flex justify-between items-center w-full px-gutter py-4 sticky top-0 z-50 bg-surface border-b border-surface-container-high">
      <Link href="/" className="flex items-center shrink-0">
        <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-12 sm:h-16 w-auto" priority style={dark ? { filter: "brightness(0) invert(1)" } : undefined} />
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#how-it-works" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md">How it works</a>
        <a href="#pricing" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md">Pricing</a>
        <div className="relative">
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            onBlur={() => setTimeout(() => setResourcesOpen(false), 150)}
            className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md"
          >
            Resources
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          {resourcesOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg z-50 overflow-hidden">
              <Link
                href="/resources/band-scores"
                onClick={() => setResourcesOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-on-surface transition-colors w-full rounded-xl hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">score</span>
                Band Scores
              </Link>
            </div>
          )}
        </div>
        <a href="#faq" className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md">FAQ</a>
      </div>

      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            {isPremium && (
              <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-primary text-on-primary text-label-xs font-bold tracking-wide uppercase shadow-sm">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Pro
              </div>
            )}
            <Link href="/dashboard" className="bg-primary-container text-on-primary font-label-md text-label-md px-5 py-2 rounded-xl hover:scale-[0.98] active:scale-[0.97] transition-all">
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2 rounded-xl hover:scale-[0.98] active:scale-[0.97] transition-all">
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger + quick action */}
      <div className="flex md:hidden items-center gap-2">
        {user ? (
          <Link href="/dashboard" className="bg-primary-container text-on-primary font-label-md text-label-md px-3 py-1.5 rounded-xl text-sm hover:scale-[0.98] active:scale-[0.97] transition-all">
            Dashboard
          </Link>
        ) : (
          <Link href="/register" className="bg-primary text-on-primary text-xs font-semibold px-3 py-1.5 rounded-xl hover:scale-[0.98] active:scale-[0.97] transition-all">
            Start Free
          </Link>
        )}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" aria-label="Toggle menu">
          <span className="material-symbols-outlined text-[24px] text-on-surface">{mobileOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-surface shadow-xl flex flex-col py-4">
            <div className="px-4 pb-4 border-b border-outline-variant/30 flex items-center justify-between">
              <span className="text-body-md font-semibold text-on-surface">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-surface-container-high rounded-lg">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col p-4 gap-2">
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md py-2">How it works</a>
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md py-2">Pricing</a>
              <Link href="/resources/band-scores" onClick={() => setMobileOpen(false)} className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md py-2">Band Scores</Link>
              <a href="#faq" onClick={() => setMobileOpen(false)} className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md py-2">FAQ</a>
              <div className="border-t border-outline-variant/30 my-2" />
                {user ? (
                <div className="flex items-center gap-2">
                  {isPremium && (
                    <div className="flex items-center gap-0.5 py-0.5 px-2 rounded-full bg-primary text-on-primary text-[10px] font-bold tracking-wide uppercase shadow-sm">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      Pro
                    </div>
                  )}
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-primary font-semibold text-label-md py-2">Dashboard</Link>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-on-surface font-semibold text-label-md py-2">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
