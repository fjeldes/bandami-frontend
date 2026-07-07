"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  LayoutDashboard,
  PenTool,
  Mic,
  BookOpen,
  Headphones,
  Library,
  BarChart3,
  Settings,
  ShieldAlert,
  Users,
  FileText,
  Tag,
  LogOut,
  Menu,
  X,
  Sparkles,
  Crown,
  Sun,
  Moon,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  dashboard: LayoutDashboard,
  edit_note: PenTool,
  record_voice_over: Mic,
  menu_book: BookOpen,
  headphones: Headphones,
  library_books: Library,
  analytics: BarChart3,
  settings: Settings,
  shield_person: ShieldAlert,
  group: Users,
  assignment: FileText,
  quiz: FileText,
  sell: Tag,
};

function NavItem({ href, label, icon, isActive, isComingSoon }: { href: string; label: string; icon: string; isActive: boolean; isComingSoon?: boolean }) {
  const Icon = ICON_MAP[icon] || LayoutDashboard;

  if (isComingSoon) {
    return (
      <div className="flex items-center px-3 py-2.5 rounded-lg text-slate-400 cursor-default opacity-50">
        <Icon className="w-5 h-5 mr-3" />
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Soon</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`
        group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? "bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-600 dark:border-blue-400 text-slate-900 dark:text-blue-400 font-semibold pl-[10px]"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:pl-1"
        }
      `}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
      {label}
    </Link>
  );
}

function ProBadge({ isPremium, isAdmin }: { isPremium: boolean; isAdmin: boolean }) {
  if (isAdmin) {
    return (
      <div className="mx-3 p-3 rounded-xl bg-gradient-to-br from-slate-800 dark:from-indigo-950 to-slate-900 dark:to-slate-900 text-white shadow-lg border border-slate-700 dark:border-indigo-500/30">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Administrator</span>
        </div>
        <p className="text-[11px] text-slate-400">Full access to all features</p>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="mx-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 dark:from-indigo-500/10 to-indigo-50 dark:to-purple-500/10 border border-blue-200 dark:border-indigo-500/20 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-indigo-300">Pro Member</span>
        </div>
        <p className="text-[11px] text-blue-600 dark:text-indigo-400">All features unlocked</p>
      </div>
    );
  }

  return (
    <Link
      href="/pricing"
      className="mx-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
    >
      <Sparkles className="w-4 h-4" />
      Upgrade to Pro
    </Link>
  );
}

export function Sidebar() {
  const { dark, toggle } = useTheme();
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
    { href: "/resources", label: "Resources", icon: "library_books" },
    { href: "/history", label: "Reports", icon: "analytics" },
    { href: "/settings", label: "Settings", icon: "settings" },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/users", label: "Users", icon: "group" },
    { href: "/admin/exams", label: "Exams", icon: "assignment" },
    { href: "/admin/questions", label: "Questions", icon: "quiz" },
    { href: "/admin/plans", label: "Plans", icon: "sell" },
  ];

  const handleSignOut = () => { logout(); router.push("/"); };

  return (
    <>
      <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center">
        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-12 w-auto" priority style={dark ? { filter: "brightness(0) invert(1)" } : undefined} />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              <div className="space-y-0.5">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname?.startsWith(item.href)}
                    isComingSoon={item.comingSoon}
                  />
                ))}
              </div>

              {isAdmin && (
                <div className="mt-6">
                  <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Admin</p>
                  <div className="space-y-0.5">
                    {adminNavItems.map((item) => (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={pathname?.startsWith(item.href)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <ProBadge isPremium={isPremium} isAdmin={isAdmin} />
              <button
                onClick={handleSignOut}
                className="mt-3 w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <nav className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col z-50">
        <div className="my-6 px-4 flex justify-center">
          <Image src="/bandami.png" alt="Bandami" width={192} height={192} className="h-16 w-auto" priority style={dark ? { filter: "brightness(0) invert(1)" } : undefined} />
        </div>

        <div className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname?.startsWith(item.href)}
              isComingSoon={item.comingSoon}
            />
          ))}

          {isAdmin && (
            <div className="mt-6">
              <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Admin</p>
              <div className="space-y-0.5">
                {adminNavItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname?.startsWith(item.href)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto px-3 pb-4 space-y-3">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <ProBadge isPremium={isPremium} isAdmin={isAdmin} />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
