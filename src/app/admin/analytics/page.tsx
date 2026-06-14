"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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

function SparkBars({ data, colorFree, colorPremium }: { data: DailyRow[]; colorFree: string; colorPremium: string }) {
  const max = Math.max(1, ...data.map((d) => d.free + d.premium));
  return (
    <div className="flex items-end gap-[2px] h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
          <div className="w-full flex flex-col justify-end" style={{ height: `${((d.free + d.premium) / max) * 100}%` }}>
            {d.premium > 0 && (
              <div className={`w-full ${colorPremium}`} style={{ height: `${((d.premium) / (d.free + d.premium)) * 100}%`, minHeight: d.premium > 0 ? 2 : 0 }} />
            )}
            {d.free > 0 && (
              <div className={`w-full ${colorFree}`} style={{ height: `${((d.free) / (d.free + d.premium)) * 100}%`, minHeight: d.free > 0 ? 2 : 0 }} />
            )}
          </div>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 bg-on-surface text-surface text-[10px] font-semibold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {d.free + d.premium} users · {new Date(d.day + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      ))}
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
        <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center py-20 text-on-surface-variant">Failed to load analytics.</p>;
  }

  const { summary, dau, evaluations_per_day } = data;
  const conversionRate = summary.free_users > 0 ? ((summary.conversions_total / summary.free_users) * 100).toFixed(1) : "0";

  return (
    <div>
      <h1 className="font-heading text-display-md text-on-surface mb-1">Analytics</h1>
      <p className="text-body-md text-on-surface-variant mb-8">Free vs Pro usage, DAU, evaluations, and conversions.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Free Users", value: summary.free_users, sub: `${summary.active_free} active this month`, icon: "person", color: "text-on-surface-variant" },
          { label: "Pro Users", value: summary.premium_users, sub: `${summary.active_premium} active this month`, icon: "verified", color: "text-primary" },
          { label: "Conversions", value: summary.conversions_total, sub: `${conversionRate}% rate · ${summary.conversions_this_month} this month`, icon: "trending_up", color: "text-emerald-600" },
          { label: "Evals This Month", value: summary.monthly_evals_premium, sub: `${summary.monthly_evals_free} free · ${summary.monthly_evals_premium} pro`, icon: "assignment", color: "text-secondary-container" },
        ].map((c) => (
          <div key={c.label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[18px] ${c.color}`}>{c.icon}</span>
              <span className="text-label-sm text-on-surface-variant">{c.label}</span>
            </div>
            <p className="font-mono text-headline-md font-bold text-on-surface">{c.value}</p>
            <p className="text-label-sm text-on-surface-variant mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* DAU Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
          <h3 className="text-body-md font-semibold text-on-surface mb-1">Daily Active Users</h3>
          <p className="text-label-sm text-on-surface-variant mb-4">Last 30 days</p>
          <SparkBars data={dau} colorFree="bg-surface-variant" colorPremium="bg-primary" />
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
          <h3 className="text-body-md font-semibold text-on-surface mb-1">Daily Evaluations</h3>
          <p className="text-label-sm text-on-surface-variant mb-4">Last 30 days · completed only</p>
          <SparkBars data={evaluations_per_day} colorFree="bg-surface-variant" colorPremium="bg-primary" />
        </div>
      </div>

      {/* Tier Breakdown Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
        <h3 className="text-body-md font-semibold text-on-surface mb-4">Tier Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-label-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-left">
                <th className="pb-2 text-on-surface-variant font-semibold">Tier</th>
                <th className="pb-2 text-on-surface-variant font-semibold">Total</th>
                <th className="pb-2 text-on-surface-variant font-semibold">Active (30d)</th>
                <th className="pb-2 text-on-surface-variant font-semibold">% Active</th>
                <th className="pb-2 text-on-surface-variant font-semibold">Evals (month)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-outline-variant/20">
                <td className="py-2.5 font-semibold text-on-surface">Free</td>
                <td className="py-2.5 font-mono text-on-surface">{summary.free_users}</td>
                <td className="py-2.5 font-mono text-on-surface">{summary.active_free}</td>
                <td className="py-2.5 font-mono text-on-surface">{summary.free_users > 0 ? ((summary.active_free / summary.free_users) * 100).toFixed(0) : 0}%</td>
                <td className="py-2.5 font-mono text-on-surface">{summary.monthly_evals_free}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-primary">Pro</td>
                <td className="py-2.5 font-mono text-on-surface">{summary.premium_users}</td>
                <td className="py-2.5 font-mono text-on-surface">{summary.active_premium}</td>
                <td className="py-2.5 font-mono text-on-surface">{summary.premium_users > 0 ? ((summary.active_premium / summary.premium_users) * 100).toFixed(0) : 0}%</td>
                <td className="py-2.5 font-mono text-on-surface">{summary.monthly_evals_premium}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
