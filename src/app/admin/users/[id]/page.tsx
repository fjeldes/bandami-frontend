"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface UserDetail {
  user: { id: string; email: string; full_name: string | null; subscription_tier: string; role: string; created_at: string | null };
  exams: any[];
  subscriptions: any[];
  credit_packs: any[];
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState("");
  const [tier, setTier] = useState("");

  const fetchUser = () => {
    setLoading(true);
    apiFetch<UserDetail>(`/admin/users/${id}`)
      .then((d) => {
        setData(d);
        setRole(d.user.role);
        setTier(d.user.subscription_tier);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUser(); }, [id]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role, subscription_tier: tier }),
      });
      fetchUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-body-md text-error mb-4">{error || "User not found"}</p>
        <button onClick={() => router.push("/admin/users")} className="text-primary font-semibold">Back to Users</button>
      </div>
    );
  }

  const { user, exams, subscriptions, credit_packs } = data;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/admin/users")} className="text-on-surface-variant hover:text-primary p-1 rounded-lg hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-headline-md font-bold text-on-surface">User Detail</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface">{user.full_name || "Unknown"}</h2>
            <p className="text-body-md text-on-surface-variant">{user.email}</p>
            <p className="text-label-sm text-on-surface-variant mt-1">
              Joined {user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
            </p>
          </div>
          <div className="flex gap-3">
            <div className={`text-label-sm font-semibold px-3 py-1.5 rounded-full ${user.subscription_tier === "premium" ? "bg-secondary-container/30 text-secondary-container" : "bg-surface-container-high text-on-surface-variant"}`}>
              {user.subscription_tier || "free"}
            </div>
            <div className={`text-label-sm font-semibold px-3 py-1.5 rounded-full ${user.role === "admin" ? "bg-primary-container/30 text-primary" : "text-on-surface-variant bg-surface-container-high"}`}>
              {user.role || "user"}
            </div>
          </div>
        </div>

        {/* Edit Controls */}
        <div className="flex flex-wrap items-end gap-4 p-4 bg-surface-container rounded-lg">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm text-on-surface-variant">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-body-md text-on-surface outline-none focus:border-primary">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm text-on-surface-variant">Subscription Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-body-md text-on-surface outline-none focus:border-primary">
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="bg-primary text-on-primary font-semibold px-4 py-1.5 rounded-lg text-label-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exams */}
        <div className="lg:col-span-2">
          <h3 className="text-headline-md font-bold text-on-surface mb-3">Recent Exams ({exams.length})</h3>
          {exams.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 text-center">
              <p className="text-body-md text-on-surface-variant">No exams found.</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Band</th>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((e: any) => (
                    <tr key={e.id} className="border-b border-outline-variant/30">
                      <td className="py-2.5 px-4 text-body-md text-on-surface capitalize">{e.exam_type} {e.task_type ? `T${e.task_type.replace("task", "")}` : ""}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-label-sm px-2 py-0.5 rounded-full ${
                          e.status === "completed" ? "bg-emerald-100 text-emerald-800" : e.status === "failed" ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"
                        }`}>{e.status}</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-data-md text-on-surface">
                        {e.evaluations?.overall_band ? `Band ${e.evaluations.overall_band.toFixed(1)}` : "—"}
                      </td>
                      <td className="py-2.5 px-4 text-label-sm text-on-surface-variant">
                        {e.created_at ? new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Subscriptions + Credit Packs */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-headline-md font-bold text-on-surface mb-3">Subscriptions</h3>
            {subscriptions.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 text-center">
                <p className="text-label-sm text-on-surface-variant">No subscriptions</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {subscriptions.map((s: any) => (
                  <div key={s.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-label-sm font-semibold px-2 py-0.5 rounded-full ${
                        s.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-surface-container-high text-on-surface-variant"
                      }`}>{s.status}</span>
                      <span className="text-label-sm text-on-surface-variant">
                        {s.current_period_start ? new Date(s.current_period_start).toLocaleDateString() : ""} → {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "∞"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-headline-md font-bold text-on-surface mb-3">Credit Packs</h3>
            {credit_packs.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 text-center">
                <p className="text-label-sm text-on-surface-variant">No credit packs</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {credit_packs.map((c: any) => (
                  <div key={c.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-body-md text-on-surface font-semibold">{c.credits_remaining}/{c.credits_total}</span>
                      <span className="text-label-sm text-on-surface-variant">{c.purchased_at ? new Date(c.purchased_at).toLocaleDateString() : ""}</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 mt-2">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${c.credits_total > 0 ? (c.credits_remaining / c.credits_total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
