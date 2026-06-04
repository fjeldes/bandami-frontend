"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { getUserSubscription, getDashboardStats, apiFetch } from "@/lib/api";
import { showSuccess, showError } from "@/components/ui/Toast";

function SubscriptionSection() {
  const [subData, setSubData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [switchModal, setSwitchModal] = useState<string | null>(null);

  const load = () => {
    Promise.all([
      apiFetch("/payments/subscription").catch(() => null),
      apiFetch<{ invoices: any[] }>("/payments/invoices").catch(() => ({ invoices: [] })),
    ]).then(([sub, inv]) => {
      setSubData(sub);
      setInvoices(inv.invoices || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancel = async () => {
    if (!confirm("Your Premium access will continue until the end of the billing period. After that, you'll be switched to the Free plan. Continue?")) return;
    setActionLoading(true);
    try {
      await apiFetch("/payments/cancel", { method: "POST" });
      showSuccess("Subscription will be canceled at period end.");
      load();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to cancel");
    }
    setActionLoading(false);
  };

  const reactivate = async () => {
    setActionLoading(true);
    try {
      await apiFetch("/payments/reactivate", { method: "POST" });
      showSuccess("Subscription reactivated!");
      load();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to reactivate");
    }
    setActionLoading(false);
  };

  const switchPlan = async (planSlug: string) => {
    setSwitchModal(null);
    setActionLoading(true);
    try {
      const result = await apiFetch<{ status: string; url?: string }>("/payments/switch-plan", { method: "POST", body: JSON.stringify({ plan_slug: planSlug }) });
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      showSuccess(`Switched to ${planSlug === "premium" ? "Premium Monthly" : "Exam Week Pass"}!`);
      load();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to switch plan");
    }
    setActionLoading(false);
  };

  if (loading) return <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5"><div className="animate-pulse bg-surface-container-high rounded-lg h-20" /></section>;
  if (!subData?.has_subscription) return null;

  const periodEnd = subData.current_period_end ? new Date(subData.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";
  const willCancel = subData.cancel_at_period_end;
  const isOneTime = subData.is_one_time;
  const isMonthly = !isOneTime && subData.plan_interval === "month";
  const isWeekPass = isOneTime || subData.plan_interval === "week";

  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
      <h3 className="text-body-md font-semibold text-on-surface mb-4">Subscription</h3>
      <div className="space-y-4">
        {/* Plan details card */}
        <div className="bg-surface-container rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-label-sm text-on-surface-variant">Plan</p>
            <p className="text-body-md font-semibold text-on-surface">
              {subData.plan_name} · ${subData.plan_amount}/{subData.plan_interval}
            </p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Status</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${willCancel ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span className="text-body-md text-on-surface capitalize">
                {willCancel ? "Cancels at period end" : isWeekPass ? "Active" : "Active"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">{isOneTime ? "Expires" : "Next billing"}</p>
            <p className="text-body-md text-on-surface">{periodEnd}</p>
          </div>
          {!isOneTime && (
            <div>
              <p className="text-label-sm text-on-surface-variant">Payment</p>
              <p className="text-body-md text-on-surface capitalize">
                {subData.card_brand ? `${subData.card_brand} ····${subData.card_last4}` : "—"}
              </p>
            </div>
          )}
          {isOneTime && (
            <div>
              <p className="text-label-sm text-on-surface-variant">Type</p>
              <p className="text-body-md text-on-surface">One-time payment</p>
            </div>
          )}
        </div>

        {/* Switch Plan */}
        <div className="bg-surface-container rounded-xl p-4">
          <p className="text-label-sm font-semibold text-on-surface-variant mb-3">Switch Plan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setSwitchModal("premium")}
              disabled={actionLoading || isMonthly}
              className={`p-3 rounded-lg border text-left transition-colors ${isMonthly ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:border-primary/50"}`}
            >
              <p className="text-body-md font-semibold text-on-surface">Premium</p>
              <p className="text-label-sm text-on-surface-variant">$14.99/month</p>
              {isMonthly && <span className="text-[10px] font-semibold text-primary bg-primary-container/20 px-1.5 py-0.5 rounded mt-1 inline-block">Current</span>}
            </button>
            <button
              onClick={() => setSwitchModal("exam_week_pass")}
              disabled={actionLoading || isWeekPass}
              className={`p-3 rounded-lg border text-left transition-colors ${isWeekPass ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:border-primary/50"}`}
            >
              <p className="text-body-md font-semibold text-on-surface">Week Pass</p>
              <p className="text-label-sm text-on-surface-variant">$4.99/7 days</p>
              {isWeekPass && <span className="text-[10px] font-semibold text-primary bg-primary-container/20 px-1.5 py-0.5 rounded mt-1 inline-block">Current</span>}
            </button>
          </div>
        </div>

        {/* Actions — only for subscription-based plans */}
        {!isOneTime && (
          <div className="flex flex-wrap gap-2">
            {willCancel ? (
            <button onClick={reactivate} disabled={actionLoading}
              className="bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-semibold hover:scale-[0.98] active:scale-[0.97] transition-all disabled:opacity-50">
              Reactivate Subscription
            </button>
          ) : (
            <button onClick={cancel} disabled={actionLoading}
              className="px-4 py-2 rounded-xl border border-error/30 text-error text-label-sm font-semibold hover:bg-error-container/20 transition-colors">
              Cancel Subscription
            </button>
            )}
            <button onClick={async () => {
              try {
                const { url } = await apiFetch<{ url: string }>("/payments/create-portal", { method: "POST" });
                window.location.href = url;
              } catch { showError("Could not open billing settings"); }
          }} className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant text-label-sm font-semibold hover:bg-surface-container-high transition-colors">
            Update Payment Method
            </button>
          </div>
        )}

        {/* Invoice History */}
        {invoices.length > 0 && (
          <div className="pt-4 border-t border-outline-variant/30">
            <h4 className="text-label-sm text-on-surface-variant font-semibold mb-3 uppercase tracking-wider">Invoice History</h4>
            <div className="space-y-1.5">
              {invoices.slice(0, 5).map((inv: any) => (
                <a key={inv.id} href={inv.hosted_invoice_url || inv.invoice_pdf} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container transition-colors text-body-md">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">receipt_long</span>
                    <div>
                      <p className="text-body-md text-on-surface">${inv.amount_paid.toFixed(2)}</p>
                      <p className="text-label-sm text-on-surface-variant">{new Date(inv.created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className="text-primary text-label-sm hover:underline">View</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Switch Plan Modal */}
      {switchModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4" onClick={() => setSwitchModal(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-headline-md font-bold text-on-surface mb-2">Switch Plan</h4>
            <p className="text-body-md text-on-surface-variant mb-6">
              {switchModal === "premium" && isOneTime
                ? "Premium is a monthly subscription. You'll be redirected to our secure checkout to set up your recurring payment."
                : switchModal === "premium"
                ? "Switch to Premium Monthly ($14.99/month). Your billing period will be adjusted automatically."
                : "Switch to Exam Week Pass ($4.99/7 days). Your billing period will be adjusted automatically."}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSwitchModal(null)} className="px-4 py-2 rounded-xl text-on-surface-variant text-label-sm font-semibold hover:bg-surface-container-high transition-colors">Cancel</button>
              <button onClick={() => switchPlan(switchModal)} disabled={actionLoading}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-semibold hover:scale-[0.98] active:scale-[0.97] transition-all disabled:opacity-50">
                {actionLoading ? "Switching..." : "Confirm Switch"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
import type { UserSubscription as UserSubType, DashboardStats } from "@/lib/types";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subscription, setSubscription] = useState<UserSubType | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [changePw, setChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [refLoading, setRefLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const isCheckoutSuccess = searchParams.get("checkout") === "success";

    if (isCheckoutSuccess && sessionId) {
      showSuccess("Verifying payment...");
      apiFetch<{ status: string; tier?: string }>(`/payments/verify-session?session_id=${sessionId}`)
        .then((r) => {
          if (r.status === "ok") {
            useAuthStore.getState().refreshSession().then(() => {
              showSuccess("Payment confirmed! Your plan is now active.");
              setTimeout(() => window.location.href = "/settings", 1500);
            });
          } else {
            showError("Payment still processing. It may take a few moments.");
          }
        })
        .catch(() => {
          showError("Could not verify payment. Please refresh.");
        });
    } else if (isCheckoutSuccess) {
      showSuccess("Payment successful! Refreshing...");
      setTimeout(() => window.location.href = "/settings", 2000);
    }
    Promise.all([
      
      getUserSubscription().catch(() => null),
      getDashboardStats().catch(() => null),
    ]).then(([sub, s]) => {
      setSubscription(sub);
      setStats(s);
      setLoading(false);
    });

    apiFetch<{ referral_code: string; referral_count: number; referral_discounts: number }>("/users/me/referral")
      .then((r) => { setReferralCode(r.referral_code); setReferralCount(r.referral_count); setHasDiscount(r.referral_discounts > 0); })
      .catch(() => {})
      .finally(() => setRefLoading(false));
  }, []);

  const saveName = async () => {
    if (!nameValue.trim()) return;
    setSavingName(true);
    try {
      await apiFetch("/users/me/profile", { method: "PATCH", body: JSON.stringify({ full_name: nameValue.trim() }) });
      // refresh user data
      useAuthStore.getState().refreshSession();
      showSuccess("Name updated");
      setEditName(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update name");
    }
    setSavingName(false);
  };

  const savePassword = async () => {
    if (newPw.length < 8) { showError("Password must be at least 8 characters"); return; }
    if (newPw !== confirmPw) { showError("Passwords don't match"); return; }
    setSavingPw(true);
    try {
      await apiFetch("/users/me/change-password", { method: "POST", body: JSON.stringify({ current_password: currentPw, new_password: newPw }) });
      showSuccess("Password changed");
      setChangePw(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to change password");
    }
    setSavingPw(false);
  };

  const handleSignOut = () => { logout(); router.push("/"); };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-headline-md font-bold text-on-surface">Settings</h1>

      {/* Profile */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
        <h3 className="text-body-md font-semibold text-on-surface mb-4">Profile</h3>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <span className="font-mono text-headline-md font-bold">{user?.full_name?.charAt(0)?.toUpperCase() || "?"}</span>
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <label className="text-label-sm text-on-surface-variant">Full Name</label>
              {editName ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input value={nameValue} onChange={(e) => setNameValue(e.target.value)} className="bg-surface-container border border-outline-variant rounded-lg px-3 py-1.5 text-body-md text-on-surface outline-none focus:border-primary flex-1" />
                  <button onClick={saveName} disabled={savingName} className="text-primary text-label-sm font-semibold hover:underline">{savingName ? "Saving..." : "Save"}</button>
                  <button onClick={() => setEditName(false)} className="text-on-surface-variant text-label-sm">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-body-md text-on-surface">{user?.full_name || "—"}</p>
                  <button onClick={() => { setNameValue(user?.full_name || ""); setEditName(true); }} className="text-primary text-label-sm hover:underline">Edit</button>
                </div>
              )}
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant">Email</label>
              <p className="text-body-md text-on-surface">{user?.email || "—"}</p>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant">Plan</label>
              <p className="text-body-md text-on-surface capitalize flex items-center gap-2">
                {user?.subscription_tier || "free"}
                {subscription && <span className="text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">Active</span>}
              </p>
              {user?.subscription_tier === "premium" && (
                <span className="text-label-sm text-on-surface-variant ml-2">· See Subscription section below for plan management</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Management */}
      {user?.subscription_tier === "premium" && (
        <SubscriptionSection />
      )}

      {/* Password */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
        <h3 className="text-body-md font-semibold text-on-surface mb-4">Password</h3>
        {changePw ? (
          <div className="space-y-3">
            <div>
              <label className="text-label-sm text-on-surface-variant">Current Password</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary mt-1" />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant">New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary mt-1" />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant">Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary mt-1" />
            </div>
            <div className="flex gap-2">
              <button onClick={savePassword} disabled={savingPw} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity">{savingPw ? "Saving..." : "Change Password"}</button>
              <button onClick={() => setChangePw(false)} className="text-on-surface-variant text-label-sm hover:underline">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setChangePw(true)} className="text-primary text-label-sm font-semibold hover:underline">Change password</button>
        )}
      </section>
      {/* Referral */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
        <h3 className="text-body-md font-semibold text-on-surface mb-4">Referral Program</h3>
        {refLoading ? (
          <div className="animate-pulse bg-surface-container-high rounded-lg h-20" />
        ) : (
          <div className="space-y-3">
            {hasDiscount && (
              <div className="bg-referral-bg rounded-xl border border-referral-border p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-referral-text text-[24px]">stars</span>
                <div>
                  <p className="text-body-md font-semibold text-referral-text">50% off your next Week Pass</p>
                  <p className="text-label-sm text-referral-text/70">Referral reward — expires after use</p>
                </div>
              </div>
            )}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
              <p className="text-label-sm text-on-surface-variant mb-2">Your referral code</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-data-md font-bold text-primary tracking-wider">{referralCode || "—"}</span>
                <button onClick={() => { navigator.clipboard.writeText(referralCode); showSuccess("Code copied!"); }} className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-label-sm">
              <span className="text-on-surface-variant">People referred</span>
              <span className="font-mono font-bold text-primary">{referralCount}</span>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralCode}`); showSuccess("Share link copied!"); }} className="w-full bg-primary-container/20 text-primary font-semibold py-2.5 rounded-lg text-label-sm hover:bg-primary-container/40 transition-colors">
              Copy Share Link
            </button>
          </div>
        )}
      </section>

      {/* Sign Out */}

      <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 bg-error-container/30 text-error font-semibold py-3 rounded-xl hover:bg-error-container/50 transition-colors text-body-md">
        <span className="material-symbols-outlined">logout</span> Sign Out
      </button>
    </div>
  );
}
