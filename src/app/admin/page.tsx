"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Crown,
  ClipboardList,
  TrendingUp,
  UserPlus,
  Activity,
  Clock,
  ArrowRight,
  GraduationCap,
  BarChart3,
  ChevronRight,
  Zap,
  Target,
  Eye,
} from "lucide-react";

interface AdminStats {
  total_users: number;
  admin_count: number;
  premium_count: number;
  active_subscriptions: number;
  total_exams: number;
  completed_exams: number;
  average_band: number;
  active_questions: number;
  new_users_this_month: number;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string;
  created_at: string;
}

interface RecentExam {
  id: string;
  user_email: string;
  exam_type: string;
  status: string;
  created_at: string;
}

interface DailyRow {
  day: string;
  free: number;
  premium: number;
}

interface AnalyticsData {
  summary: {
    total_users: number;
    free_users: number;
    premium_users: number;
    active_this_month: number;
    active_free: number;
    active_premium: number;
    conversions_total: number;
    conversions_this_month: number;
    monthly_evals_free: number;
    monthly_evals_premium: number;
  };
  dau: DailyRow[];
  evaluations_per_day: DailyRow[];
}

function AnimatedBarChart({ data, colorFree, colorPremium, maxVal }: { data: DailyRow[]; colorFree: string; colorPremium: string; maxVal: number }) {
  return (
    <div className="flex items-end gap-[3px] h-28">
      {data.map((d, i) => {
        const total = d.free + d.premium;
        const heightPct = maxVal > 0 ? (total / maxVal) * 100 : 0;
        const premiumPct = total > 0 ? (d.premium / total) * 100 : 0;

        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div
              className="w-full rounded-t-md overflow-hidden flex flex-col justify-end"
              style={{ height: `${Math.max(heightPct, 2)}%` }}
            >
              {d.premium > 0 && (
                <div
                  className={`w-full rounded-t-md ${colorPremium}`}
                  style={{ height: `${premiumPct}%`, minHeight: 2 }}
                />
              )}
              {d.free > 0 && (
                <div
                  className={`w-full ${colorFree}`}
                  style={{ height: `${100 - premiumPct}%`, minHeight: 2 }}
                />
              )}
            </div>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-200 text-[10px] font-semibold px-2 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20 shadow-xl">
              {total} · {new Date(d.day + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function KPICard({ label, value, sub, icon: Icon, accentColor, trend }: { label: string; value: string | number; sub: string; icon: any; accentColor: string; trend?: string }) {
  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800/50 p-6 hover:border-gray-300 dark:hover:border-slate-700/60 transition-all duration-300 group hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
            <Zap className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">{value}</p>
      <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3">{label}</p>
      <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{sub}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, accentColor }: { label: string; value: string | number; sub: string; icon: any; accentColor: string }) {
  return (
    <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-800/50 p-4 hover:bg-gray-100 dark:hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-0.5">{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-500">{sub}</p>
    </div>
  );
}

function RecentUsersTable({ users }: { users: RecentUser[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800/50 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Users</h3>
            <p className="text-xs text-gray-500 dark:text-slate-500">Latest registrations</p>
          </div>
        </div>
        <Link href="/admin/users" className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-slate-800/50">
        {users.slice(0, 5).map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.full_name || "Anonymous"}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.subscription_tier === "premium"
                  ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700"
              }`}>
                {user.subscription_tier === "premium" ? (
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Pro
                  </span>
                ) : "Free"}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveActivityFeed({ exams }: { exams: RecentExam[] }) {
  const getExamIcon = (type: string) => {
    return type === "writing" ? (
      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
        <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
    ) : (
      <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
        <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase border border-emerald-200 dark:border-emerald-500/30">Done</span>;
    }
    if (status === "in_progress") {
      return <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-200 dark:border-amber-500/30 animate-pulse">Active</span>;
    }
    return <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 text-[10px] font-bold uppercase border border-gray-200 dark:border-slate-700">Pending</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800/50 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Live Activity</h3>
            <p className="text-xs text-gray-500 dark:text-slate-500">Recent exam submissions</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {exams.slice(0, 8).map((exam) => (
          <div key={exam.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
            {getExamIcon(exam.exam_type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{exam.exam_type}</p>
                {getStatusBadge(exam.status)}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 truncate mt-0.5">{exam.user_email}</p>
              <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">
                {new Date(exam.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {exams.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-gray-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-slate-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800/50 p-6 hover:border-gray-300 dark:hover:border-slate-700/60 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
        <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function TierBreakdownTable({ summary }: { summary: AnalyticsData["summary"] }) {
  const tiers = [
    {
      name: "Free",
      color: "text-blue-600 dark:text-blue-400",
      bgDot: "bg-blue-500",
      total: summary.free_users,
      active: summary.active_free,
      evals: summary.monthly_evals_free,
    },
    {
      name: "Pro",
      color: "text-amber-600 dark:text-amber-400",
      bgDot: "bg-amber-500",
      total: summary.premium_users,
      active: summary.active_premium,
      evals: summary.monthly_evals_premium,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800/50 overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Tier Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900/50 text-left">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 tracking-wider uppercase">Tier</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 tracking-wider uppercase">Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 tracking-wider uppercase">Active (30d)</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 tracking-wider uppercase">% Active</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 tracking-wider uppercase">Evals / Month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800/50">
            {tiers.map((tier) => {
              const pctActive = tier.total > 0 ? ((tier.active / tier.total) * 100).toFixed(0) : "0";
              return (
                <tr key={tier.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3.5">
                    <span className={`flex items-center gap-2 font-semibold ${tier.color}`}>
                      <span className={`w-2 h-2 rounded-full ${tier.bgDot}`} />
                      {tier.name}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`font-mono ${tier.total > 0 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-600"}`}>{tier.total}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`font-mono ${tier.active > 0 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-600"}`}>{tier.active}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`font-mono ${parseInt(pctActive) > 0 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-600"}`}>{pctActive}%</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`font-mono ${tier.evals > 0 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-600"}`}>{tier.evals}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [exams, setExams] = useState<RecentExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<AdminStats>("/admin/stats").catch(() => null),
      apiFetch<AnalyticsData>("/admin/analytics").catch(() => null),
      apiFetch<{ users: RecentUser[] }>("/admin/users?limit=5").catch(() => ({ users: [] })),
      apiFetch<{ exams: RecentExam[] }>("/admin/exams?limit=10").catch(() => ({ exams: [] })),
    ])
      .then(([statsData, analyticsData, usersData, examsData]) => {
        setStats(statsData);
        setAnalytics(analyticsData);
        setUsers(usersData.users || []);
        setExams(examsData.exams || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 dark:text-slate-500">You may not have admin access.</p>
        </div>
      </div>
    );
  }

  const conversionRate = stats.total_users > 0 ? ((stats.premium_count / stats.total_users) * 100).toFixed(1) : "0";
  const completionRate = stats.total_exams > 0 ? Math.round((stats.completed_exams / stats.total_exams) * 100) : 0;

  const maxDAU = analytics?.dau?.length ? Math.max(1, ...analytics.dau.map((d) => d.free + d.premium)) : 1;
  const maxEvals = analytics?.evaluations_per_day?.length ? Math.max(1, ...analytics.evaluations_per_day.map((d) => d.free + d.premium)) : 1;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-slate-500">Overview of your Bandami platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <KPICard
            label="Total Users"
            value={stats.total_users.toLocaleString()}
            sub={`${stats.new_users_this_month} this month`}
            icon={Users}
            accentColor="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
            trend={`+${stats.new_users_this_month}`}
          />
          <KPICard
            label="Premium Users"
            value={stats.premium_count.toLocaleString()}
            sub={`${stats.active_subscriptions} active subs`}
            icon={Crown}
            accentColor="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <KPICard
            label="Total Exams"
            value={stats.total_exams.toLocaleString()}
            sub={`${stats.completed_exams} completed`}
            icon={ClipboardList}
            accentColor="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <KPICard
            label="Avg Band Score"
            value={stats.average_band > 0 ? stats.average_band.toFixed(1) : "—"}
            sub={`${stats.active_questions} questions`}
            icon={TrendingUp}
            accentColor="bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Completion Rate"
            value={`${completionRate}%`}
            sub={`${stats.completed_exams}/${stats.total_exams} exams`}
            icon={Target}
            accentColor="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <MetricCard
            label="Conversion"
            value={`${conversionRate}%`}
            sub={`${stats.premium_count} pro / ${stats.total_users} total`}
            icon={Zap}
            accentColor="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <MetricCard
            label="Active Questions"
            value={stats.active_questions}
            sub="Available in pool"
            icon={BarChart3}
            accentColor="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <MetricCard
            label="New Users"
            value={`+${stats.new_users_this_month}`}
            sub="Registered this month"
            icon={UserPlus}
            accentColor="bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />
        </div>

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Daily Active Users" subtitle="Last 30 days">
              <AnimatedBarChart
                data={analytics.dau}
                colorFree="bg-gray-300 dark:bg-slate-700"
                colorPremium="bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-md"
                maxVal={maxDAU}
              />
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-t from-blue-600 to-indigo-400" />
                  Pro
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-slate-700" />
                  Free
                </span>
              </div>
            </ChartCard>

            <ChartCard title="Daily Evaluations" subtitle="Last 30 days">
              <AnimatedBarChart
                data={analytics.evaluations_per_day}
                colorFree="bg-gray-300 dark:bg-slate-700"
                colorPremium="bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md"
                maxVal={maxEvals}
              />
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-t from-emerald-600 to-teal-400" />
                  Pro
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-slate-700" />
                  Free
                </span>
              </div>
            </ChartCard>
          </div>
        )}

        {analytics && <div className="mb-8"><TierBreakdownTable summary={analytics.summary} /></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentUsersTable users={users} />
          </div>
          <div>
            <LiveActivityFeed exams={exams} />
          </div>
        </div>
      </div>
    </div>
  );
}
