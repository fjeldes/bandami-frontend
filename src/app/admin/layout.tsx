"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  HelpCircle,
  Tag,
  BarChart3,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Sun,
  Moon,
  Library,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  dashboard: LayoutDashboard,
  group: Users,
  assignment: ClipboardList,
  quiz: HelpCircle,
  sell: Tag,
  bar_chart: BarChart3,
  library: Library,
};

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/exams", label: "Exams", icon: "assignment" },
  { href: "/admin/questions", label: "Questions", icon: "quiz" },
  { href: "/admin/resources", label: "Resources", icon: "library" },
  { href: "/admin/plans", label: "Plans", icon: "sell" },
  { href: "/admin/analytics", label: "Analytics", icon: "bar_chart" },
];

function AdminBadge() {
  return (
    <div className="mx-3 p-4 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-500/30">
      <div className="flex items-center gap-2.5 mb-1">
        <ShieldAlert className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold uppercase tracking-wider">Admin Portal</span>
      </div>
      <p className="text-[11px] text-slate-400">System Control</p>
    </div>
  );
}

function NavItem({ href, label, icon, isActive, onNav }: { href: string; label: string; icon: string; isActive: boolean; onNav?: () => void }) {
  const Icon = ICON_MAP[icon] || LayoutDashboard;

  return (
    <Link
      href={href}
      onClick={onNav}
      className={`
        group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? "bg-indigo-500/10 border-l-4 border-indigo-500 text-indigo-400 font-semibold pl-[10px]"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:pl-1"
        }
      `}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-indigo-500" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const { dark, toggle } = useTheme();

  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  const handleSignOut = async () => { await logout(); router.push("/"); };

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <button
        onClick={() => setMobileNav(true)}
        aria-label="Open admin menu"
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>

      {mobileNav && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">Admin</span>
              </div>
              <button
                onClick={() => setMobileNav(false)}
                aria-label="Close menu"
                className="w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              <div className="space-y-0.5">
                {adminNav.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))}
                    onNav={() => setMobileNav(false)}
                  />
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <AdminBadge />
              <Link
                href="/dashboard"
                onClick={() => setMobileNav(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to App</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Admin</span>
          </div>
        </div>

        <div className="flex-1 px-3 space-y-0.5 overflow-y-auto overscroll-contain">
          {adminNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))}
            />
          ))}
        </div>

        <div className="mt-auto px-3 pb-4 space-y-3">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <AdminBadge />
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to App</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-6 md:ml-64 overflow-y-auto bg-slate-50 dark:bg-slate-950">{children}</main>
    </div>
  );
}
