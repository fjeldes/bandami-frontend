"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { showSuccess, showError } from "@/components/ui/Toast";

interface ConfigItem {
  key: string;
  value: string;
  description?: string;
}

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = () => {
    setLoading(true);
    apiFetch<ConfigItem[]>("/admin/settings")
      .then(setConfigs)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConfigs(); }, []);

  const updateValue = (key: string, value: string) => {
    setConfigs((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)));
  };

  const saveAll = async () => {
    setSaving(true);
    const updates: Record<string, string> = {};
    configs.forEach((c) => { updates[c.key] = c.value; });
    try {
      await apiFetch("/admin/settings", { method: "PATCH", body: JSON.stringify({ updates }) });
      showSuccess("Settings saved");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  const categories = {
    "Limits": ["default_free_daily_limit", "default_premium_daily_limit"],
    "AI & Feedback": ["default_free_feedback_delay", "default_provider"],
    "Payments": ["stripe_price_free", "stripe_price_premium"],
    "General": ["frontend_url", "app_name"],
  };

  const labelMap: Record<string, string> = {
    default_free_daily_limit: "Free daily limit",
    default_premium_daily_limit: "Premium daily limit",
    default_free_feedback_delay: "Free feedback delay (hours)",
    default_provider: "Default AI provider",
    stripe_price_free: "Stripe price ID — Free",
    stripe_price_premium: "Stripe price ID — Premium",
    frontend_url: "Frontend URL",
    app_name: "App name",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface mb-1">Settings</h1>
          <p className="text-body-md text-on-surface-variant">Global application configuration</p>
        </div>
        <button onClick={saveAll} disabled={saving} className="bg-accent text-on-accent hover:bg-accent-hover font-semibold px-5 py-2.5 rounded-lg text-label-sm transition-opacity disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(categories).map(([cat, keys]) => (
          <section key={cat} className="ds-card p-5">
            <h3 className="text-body-md font-semibold text-on-surface mb-4">{cat}</h3>
            <div className="space-y-3">
              {keys.map((key) => {
                const config = configs.find((c) => c.key === key);
                if (!config) return null;
                return (
                  <div key={key}>
                    <label className="text-label-sm text-on-surface-variant block mb-1">{labelMap[key] || key}</label>
                    {config.description && <p className="text-label-sm text-on-surface-variant/60 mb-1.5">{config.description}</p>}
                    {key === "default_provider" ? (
                      <select value={config.value} onChange={(e) => updateValue(key, e.target.value)}
                        className="w-full max-w-xs bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary">
                        <option value="gemini">Gemini</option>
                        <option value="openai">OpenAI</option>
                      </select>
                    ) : (
                      <input type={key.startsWith("stripe_") || key === "frontend_url" ? "text" : "number"}
                        value={config.value} onChange={(e) => updateValue(key, e.target.value)}
                        className="w-full max-w-xs bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary"
                        min={key.includes("daily") ? 0 : undefined} />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
