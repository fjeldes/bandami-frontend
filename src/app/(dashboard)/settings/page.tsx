"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { getUserCreditPacks, getUserSubscription, getDashboardStats, apiFetch } from "@/lib/api";
import { showSuccess, showError } from "@/components/ui/Toast";
import { CreditPackModal } from "@/components/ui/CreditPackModal";
import type { UserCreditPack, UserSubscription as UserSubType, DashboardStats } from "@/lib/types";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [creditPacks, setCreditPacks] = useState<UserCreditPack[]>([]);
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
  const [refCredits, setRefCredits] = useState(0);
  const [refLoading, setRefLoading] = useState(true);
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    const isCheckoutSuccess = searchParams.get("checkout") === "success";
    if (isCheckoutSuccess) {
      showSuccess("Payment successful! Your plan is now active. Refreshing...");
      setTimeout(() => window.location.href = "/settings", 2000);
    }
    Promise.all([
      getUserCreditPacks().catch(() => [] as UserCreditPack[]),
      getUserSubscription().catch(() => null),
      getDashboardStats().catch(() => null),
    ]).then(([packs, sub, s]) => {
      setCreditPacks(packs);
      setSubscription(sub);
      setStats(s);
      setLoading(false);
    });

    apiFetch<{ referral_code: string; referral_count: number; credits_remaining: number }>("/users/me/referral")
      .then((r) => { setReferralCode(r.referral_code); setReferralCount(r.referral_count); setRefCredits(r.credits_remaining); })
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
            </div>
          </div>
        </div>
      </section>

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

      {/* Credit Packs */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
        <h3 className="text-body-md font-semibold text-on-surface mb-4">Credit Packs</h3>
        {creditPacks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-body-md text-on-surface-variant mb-3">No active credit packs</p>
            <button onClick={() => setShowCreditModal(true)} className="bg-primary-container text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity inline-block">Buy Credits</button>
          </div>
        ) : (
          <div className="space-y-2">
            {creditPacks.map((pack) => {
              const pct = pack.credits_total > 0 ? (pack.credits_remaining / pack.credits_total) * 100 : 0;
              return (
                <div key={pack.id} className="bg-surface-container rounded-lg p-3 border border-outline-variant/30">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-body-md text-on-surface font-semibold">{pack.credits_total} Credits</span>
                    <span className="font-mono text-label-sm text-primary font-bold">{pack.credits_remaining} left</span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-1.5"><div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Referral */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
        <h3 className="text-body-md font-semibold text-on-surface mb-4">Referral Program</h3>
        {refLoading ? (
          <div className="animate-pulse bg-surface-container-high rounded-lg h-20" />
        ) : (
          <div className="space-y-3">
            {refCredits > 0 && (
              <div className="bg-referral-bg rounded-xl border border-referral-border p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-referral-text text-[24px]">stars</span>
                <div>
                  <p className="text-body-md font-semibold text-referral-text">{refCredits} earned {refCredits === 1 ? "credit" : "credits"}</p>
                  <p className="text-label-sm text-referral-text/70">from {referralCount} {referralCount === 1 ? "referral" : "referrals"}</p>
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
      <CreditPackModal open={showCreditModal} onClose={() => setShowCreditModal(false)} />

      <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 bg-error-container/30 text-error font-semibold py-3 rounded-xl hover:bg-error-container/50 transition-colors text-body-md">
        <span className="material-symbols-outlined">logout</span> Sign Out
      </button>
    </div>
  );
}
