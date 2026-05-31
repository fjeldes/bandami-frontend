"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = () => {
    apiFetch<any[]>("/admin/plans")
      .then(setPlans)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const updatePlan = async (id: string, updates: Record<string, any>) => {
    await apiFetch(`/admin/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    fetchPlans();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>;
  }

  return (
    <div>
      <h1 className="font-heading text-display-md text-on-surface mb-1">Plans</h1>
      <p className="text-body-md text-on-surface-variant mb-6">Manage subscription plans and limits.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-heading text-headline-md text-on-surface">{p.name}</h3>
                <p className="text-label-sm text-on-surface-variant capitalize">{p.slug} — {p.interval}</p>
              </div>
              <span className={`text-label-sm px-2 py-0.5 rounded-full ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-surface-container-high text-on-surface-variant"}`}>
                {p.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-label-sm text-on-surface-variant">Daily Limit</span>
                <input
                  type="number"
                  defaultValue={p.daily_eval_limit}
                  onBlur={(e) => updatePlan(p.id, { daily_eval_limit: Number(e.target.value) })}
                  className="w-20 bg-surface-container rounded-lg border border-outline-variant py-1.5 px-2 text-label-sm text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label-sm text-on-surface-variant">Provider</span>
                <select
                  defaultValue={p.provider}
                  onChange={(e) => updatePlan(p.id, { provider: e.target.value })}
                  className="bg-surface-container rounded-lg border border-outline-variant py-1.5 px-2 text-label-sm"
                >
                  <option value="gemini">Gemini (Free)</option>
                  <option value="openai">OpenAI (Paid)</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label-sm text-on-surface-variant">Feedback Delay (h)</span>
                <input
                  type="number"
                  defaultValue={p.feedback_delay_hours}
                  onBlur={(e) => updatePlan(p.id, { feedback_delay_hours: Number(e.target.value) })}
                  className="w-20 bg-surface-container rounded-lg border border-outline-variant py-1.5 px-2 text-label-sm text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label-sm text-on-surface-variant">Active</span>
                <button
                  onClick={() => updatePlan(p.id, { is_active: !p.is_active })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${p.is_active ? "bg-primary" : "bg-surface-container-high"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${p.is_active ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/30 text-label-sm text-on-surface-variant">
              <span>${(p.price_cents / 100).toFixed(2)} / {p.interval}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
