"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { TrendingUp, Users, Award, BarChart3 } from "lucide-react";

interface AnalyticsSummary {
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
}

interface DailyRow {
  day: string;
  free: number;
  premium: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  dau: DailyRow[];
  evaluations_per_day: DailyRow[];
}

function MiniBarChart({ data, colorFree, colorPremium, maxVal }: { data: DailyRow[]; colorFree: string; colorPremium: string; maxVal: number }) {
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
                <div className={`w-full ${colorPremium} rounded-t-md`} style={{ height: `${premiumPct}%`, minHeight: 2 }} />
              )}
              {d.free > 0 && (
                <div className={`w-full ${colorFree}`} style={{ height: `${100 - premiumPct}%`, minHeight: 2 }} />
              )}
            </div>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20 rounded-md">
              {total} · {new Date(d.day + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AnalyticsData>("/admin/analytics")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center py-20 text-slate-500">Failed to load analytics.</p>;
  }

  const { summary, dau, evaluations_per_day } = data;
  const conversionRate = summary.free_users > 0 ? ((summary.conversions_total / summary.free_users) * 100).toFixed(1) : "0";
  const maxDAU = Math.max(1, ...dau.map((d) => d.free + d.premium));
  const maxEvals = Math.max(1, ...evaluations_per_day.map((d) => d.free + d.premium));

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Analytics</h1>
        <p className="text-slate-500 text-base">Free vs Pro usage, DAU, evaluations, and conversions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Free Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{summary.free_users}</p>
          <p className="text-xs text-slate-400">{summary.active_free} active this month</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Pro Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{summary.premium_users}</p>
          <p className="text-xs text-slate-400">{summary.active_premium} active this month</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Conversions</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-2xl font-bold text-slate-900">{summary.conversions_total}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
              +{conversionRate}%
            </span>
          </div>
          <p className="text-xs text-slate-400">{summary.conversions_this_month} this month</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Evals This Month</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{summary.monthly_evals_premium}</p>
          <p className="text-xs text-slate-400">{summary.monthly_evals_free} free · {summary.monthly_evals_premium} pro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Daily Active Users</h3>
            <span className="text-xs text-slate-400 font-medium">Last 30 days</span>
          </div>
          <MiniBarChart data={dau} colorFree="bg-slate-200" colorPremium="bg-gradient-to-t from-blue-600 to-indigo-400" maxVal={maxDAU} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Daily Evaluations</h3>
            <span className="text-xs text-slate-400 font-medium">Last 30 days</span>
          </div>
          <MiniBarChart data={evaluations_per_day} colorFree="bg-slate-200" colorPremium="bg-gradient-to-t from-emerald-600 to-teal-400" maxVal={maxEvals} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tier Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 tracking-wider uppercase">Tier</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 tracking-wider uppercase">Total</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 tracking-wider uppercase">Active (30d)</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 tracking-wider uppercase">% Active</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 tracking-wider uppercase">Evals (month)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-6 py-3.5 font-semibold text-slate-900">Free</td>
                <td className="px-6 py-3.5 font-mono text-slate-700">{summary.free_users}</td>
                <td className="px-6 py-3.5 font-mono text-slate-700">{summary.active_free}</td>
                <td className="px-6 py-3.5 font-mono text-slate-700">
                  {summary.free_users > 0 ? ((summary.active_free / summary.free_users) * 100).toFixed(0) : 0}%
                </td>
                <td className="px-6 py-3.5 font-mono text-slate-700">{summary.monthly_evals_free}</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="px-6 py-3.5 font-semibold text-indigo-700">Pro</td>
                <td className="px-6 py-3.5 font-mono text-slate-700">{summary.premium_users}</td>
                <td className="px-6 py-3.5 font-mono text-slate-700">{summary.active_premium}</td>
                <td className="px-6 py-3.5 font-mono text-slate-700">
                  {summary.premium_users > 0 ? ((summary.active_premium / summary.premium_users) * 100).toFixed(0) : 0}%
                </td>
                <td className="px-6 py-3.5 font-mono text-slate-700">{summary.monthly_evals_premium}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
