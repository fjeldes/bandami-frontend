"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AdminStats>("/admin/stats")
      .then(setStats)
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

  if (!stats) {
    return <p className="text-center py-20 text-on-surface-variant">Failed to load stats. You may not have admin access.</p>;
  }

  const cards = [
    { label: "Total Users", value: stats.total_users, sub: `${stats.new_users_this_month} new this month`, icon: "group", color: "text-primary" },
    { label: "Premium Users", value: stats.premium_count, sub: `${stats.active_subscriptions} active subs`, icon: "workspace_premium", color: "text-secondary-container" },
    { label: "Total Exams", value: stats.total_exams, sub: `${stats.completed_exams} completed`, icon: "assignment", color: "text-emerald-600" },
    { label: "Avg Band Score", value: stats.average_band.toFixed(1), sub: `${stats.active_questions} active questions`, icon: "analytics", color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="font-heading text-display-md text-on-surface mb-1">Admin Dashboard</h1>
      <p className="text-body-md text-on-surface-variant mb-8">Overview of your platform.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className={`material-symbols-outlined ${c.color}`}>{c.icon}</span>
              <span className="text-label-sm text-on-surface-variant">{c.label}</span>
            </div>
            <p className="font-mono text-display-md text-on-surface">{c.value}</p>
            <p className="text-label-sm text-on-surface-variant mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
