"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  PenTool,
  Mic,
  Star,
  BookOpen,
} from "lucide-react";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const isPremium = user?.subscription_tier === "premium" || user?.role === "admin";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <Link href="/" className="flex items-center shrink-0">
        <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-12 sm:h-16 w-auto" priority style={dark ? { filter: "brightness(0) invert(1)" } : undefined} />
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-8">
        <a href="/?#how-it-works" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">How it works</a>
        <a href="/?#pricing" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">Pricing</a>
        <div className="relative" ref={resourcesRef}>
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
          >
            Resources
            <ChevronDown className={`w-4 h-4 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
          </button>
          {resourcesOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg z-50 overflow-hidden">
              <Link
                href="/resources/writing"
                onClick={() => setResourcesOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 transition-colors w-full hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <PenTool className="w-4 h-4 text-blue-500" />
                Writing Tips
              </Link>
              <Link
                href="/resources/speaking"
                onClick={() => setResourcesOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 transition-colors w-full hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Mic className="w-4 h-4 text-purple-500" />
                Speaking Tips
              </Link>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
              <Link
                href="/resources/band-scores"
                onClick={() => setResourcesOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 transition-colors w-full hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Star className="w-4 h-4 text-amber-500" />
                Band Scores
              </Link>
            </div>
          )}
        </div>
        <a href="/?#faq" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">FAQ</a>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user ? (
          <>
            {isPremium && (
              <div className="flex items-center gap-1 py-1 px-3 rounded-full bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-400 text-xs font-bold tracking-wide">
                <Star className="w-3 h-3" />
                Pro
              </div>
            )}
            <Link href="/dashboard" className="bg-blue-600 dark:bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-700 transition-colors text-sm font-semibold">
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold">
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger + quick action */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        {user ? (
          <Link href="/dashboard" className="bg-blue-600 dark:bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
            Dashboard
          </Link>
        ) : (
          <Link href="/register" className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
            Start Free
          </Link>
        )}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle menu">
          {mobileOpen ? <X className="w-6 h-6 text-slate-600 dark:text-slate-300" /> : <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-xl flex flex-col py-4">
            <div className="px-4 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 flex flex-col p-4 gap-2">
              <a href="/?#how-it-works" onClick={() => setMobileOpen(false)} className="text-slate-600 dark:text-slate-400 font-medium text-sm py-2">How it works</a>
              <a href="/?#pricing" onClick={() => setMobileOpen(false)} className="text-slate-600 dark:text-slate-400 font-medium text-sm py-2">Pricing</a>
              <div className="py-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resources</p>
                <Link href="/resources/writing" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm py-1.5 pl-2">
                  <PenTool className="w-4 h-4 text-blue-500" />
                  Writing Tips
                </Link>
                <Link href="/resources/speaking" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm py-1.5 pl-2">
                  <Mic className="w-4 h-4 text-purple-500" />
                  Speaking Tips
                </Link>
                <Link href="/resources/band-scores" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm py-1.5 pl-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Band Scores
                </Link>
              </div>
              <a href="/?#faq" onClick={() => setMobileOpen(false)} className="text-slate-600 dark:text-slate-400 font-medium text-sm py-2">FAQ</a>
              <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
              {user ? (
                <div className="flex items-center gap-2">
                  {isPremium && (
                    <div className="flex items-center gap-0.5 py-0.5 px-2 rounded-full bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-400 text-[10px] font-bold tracking-wide">
                      <Star className="w-3 h-3" />
                      Pro
                    </div>
                  )}
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-blue-600 dark:text-indigo-400 font-semibold text-sm py-2">Dashboard</Link>
                </div>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="text-slate-900 dark:text-white font-semibold text-sm py-2">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="text-blue-600 dark:text-indigo-400 font-semibold text-sm py-2">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
