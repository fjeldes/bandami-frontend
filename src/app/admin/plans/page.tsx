"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Layers, Brain, Hourglass, Crown, Zap, ToggleLeft, ToggleRight } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  interval: string;
  price_cents: number;
  daily_eval_limit: number;
  provider: string;
  feedback_delay_hours: number;
  is_active: boolean;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = () => {
    apiFetch<Plan[]>("/admin/plans")
      .then(setPlans)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const updatePlan = async (id: string, updates: Record<string, unknown>) => {
    await apiFetch(`/admin/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    fetchPlans();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 dark:border-slate-700 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold dark:text-white text-slate-900 tracking-tight mb-2">Plans</h1>
        <p className="dark:text-slate-400 text-slate-500 text-base">Manage subscription plans and limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPremium = plan.name.toLowerCase().includes("premium") || plan.slug === "premium";
          const isInactive = !plan.is_active;

          return (
            <div
              key={plan.id}
              className={`
                dark:bg-slate-900 bg-white rounded-2xl border shadow-sm p-6 flex flex-col justify-between
                hover:shadow-md transition-all duration-200
                ${isPremium ? "dark:border-blue-900/50 border-blue-200 ring-1 dark:ring-blue-900/30 ring-blue-100" : "dark:border-slate-800 border-slate-200"}
                ${isInactive ? "opacity-60" : ""}
              `}
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPremium ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "dark:bg-slate-800 bg-slate-100"}`}>
                      {isPremium ? <Crown className="w-4.5 h-4.5 text-white" /> : <Zap className="w-4.5 h-4.5 dark:text-slate-400 text-slate-600" />}
                    </div>
                    <div>
                      <h3 className="font-bold dark:text-white text-base">{plan.name}</h3>
                      <p className="text-xs dark:text-slate-400 text-slate-500 capitalize">{plan.slug}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updatePlan(plan.id, { is_active: !plan.is_active })}
                    className={`p-1 rounded-lg transition-colors ${plan.is_active ? "text-blue-600 dark:text-blue-400 hover:dark:bg-blue-900/20 hover:bg-blue-50" : "dark:text-slate-500 text-slate-400 hover:dark:bg-slate-800 hover:bg-slate-100"}`}
                    title={plan.is_active ? "Deactivate plan" : "Activate plan"}
                  >
                    {plan.is_active ? (
                      <ToggleRight className="w-7 h-7" />
                    ) : (
                      <ToggleLeft className="w-7 h-7" />
                    )}
                  </button>
                </div>

                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mb-4 ${plan.is_active ? "dark:bg-emerald-900/30 dark:text-emerald-400 bg-emerald-50 text-emerald-700" : "dark:bg-slate-800 dark:text-slate-400 bg-slate-100 text-slate-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${plan.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {plan.is_active ? "Active" : "Inactive"}
                </div>

                {isPremium && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold dark:bg-gradient-to-r dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border dark:border-amber-900/30 border-amber-200">
                      <Crown className="w-3 h-3" />
                      Best Seller
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <span className="text-3xl font-extrabold dark:text-white text-slate-900">${(plan.price_cents / 100).toFixed(2)}</span>
                  <span className="text-sm dark:text-slate-500 text-slate-400 ml-1">/ {plan.interval}</span>
                </div>

                <div className="border-t dark:border-slate-800 border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b dark:border-slate-800 border-slate-50">
                    <div className="flex items-center gap-2.5 dark:text-slate-400 text-slate-600">
                      <Layers className="w-4 h-4" />
                      <span className="text-sm">Daily Limit</span>
                    </div>
                    <input
                      type="number"
                      defaultValue={plan.daily_eval_limit}
                      onBlur={(e) => updatePlan(plan.id, { daily_eval_limit: Number(e.target.value) })}
                      className="w-16 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-transparent bg-slate-50 rounded-xl border border-slate-200 py-1.5 px-3 text-sm text-right font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b dark:border-slate-800 border-slate-50">
                    <div className="flex items-center gap-2.5 dark:text-slate-400 text-slate-600">
                      <Brain className="w-4 h-4" />
                      <span className="text-sm">Provider</span>
                    </div>
                    <select
                      defaultValue={plan.provider}
                      onChange={(e) => updatePlan(plan.id, { provider: e.target.value })}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-transparent bg-slate-50 rounded-xl border border-slate-200 py-1.5 px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow cursor-pointer"
                    >
                      <option value="gemini">Gemini</option>
                      <option value="groq">Groq</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5 dark:text-slate-400 text-slate-600">
                      <Hourglass className="w-4 h-4" />
                      <span className="text-sm">Feedback Delay</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        defaultValue={plan.feedback_delay_hours}
                        onBlur={(e) => updatePlan(plan.id, { feedback_delay_hours: Number(e.target.value) })}
                        className="w-14 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-transparent bg-slate-50 rounded-xl border border-slate-200 py-1.5 px-3 text-sm text-right font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      />
                      <span className="text-xs dark:text-slate-500 text-slate-400">h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
