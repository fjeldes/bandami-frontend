"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { getUserSubscription, getDashboardStats, apiFetch } from "@/lib/api";
import { showSuccess, showError } from "@/components/ui/Toast";
import {
  User,
  Mail,
  Pencil,
  Check,
  X,
  CreditCard,
  Receipt,
  Calendar,
  ShieldCheck,
  Crown,
  Sparkles,
  ExternalLink,
  Lock,
  LogOut,
} from "lucide-react";
import type { UserSubscription as UserSubType, DashboardStats } from "@/lib/types";

function Avatar({ name, size = "lg" }: { name?: string; size?: "sm" | "lg" }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const sizeClass = size === "lg" ? "w-16 h-16 text-2xl" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg`}>
      {initial}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{children}</p>;
}

function ProfileSection({ user, editName, setEditName, nameValue, setNameValue, saveName, savingName }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex items-start gap-5 mb-6">
        <Avatar name={user?.full_name} />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{user?.full_name || "Your Profile"}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {user?.subscription_tier === "premium" ? "Pro" : "Free"} Plan
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel>Full Name</FieldLabel>
          {editName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
              />
              <button
                onClick={saveName}
                disabled={savingName}
                className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditName(false)}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
              <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.full_name || "—"}</p>
              <button
                onClick={() => { setNameValue(user?.full_name || ""); setEditName(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
          )}
        </div>

        <div>
          <FieldLabel>Email Address</FieldLabel>
          <div className="flex items-center gap-2 mt-1">
            <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.email || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionCard({ isPremium, subData }: { isPremium: boolean; subData?: any }) {
  if (!isPremium) {
    return (
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Upgrade to Pro</h3>
            <p className="text-sm text-orange-100">Unlock all features</p>
          </div>
        </div>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          View Plans
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">Pro Member</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Active
            </span>
          </div>
          <p className="text-sm text-slate-400">Your subscription is active</p>
        </div>
      </div>

      <div className="bg-white/10 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Plan</p>
        <p className="text-sm font-medium">{subData?.plan_name || "Pro Member"} {subData?.plan_amount ? `· $${subData.plan_amount}/month` : ""}</p>
      </div>

      <a
        href="#"
        onClick={async (e) => {
          e.preventDefault();
          try {
            const result = await apiFetch<{ url?: string }>("/payments/create-portal", { method: "POST" });
            if (result.url) window.open(result.url, "_blank");
          } catch { showError("Could not open billing portal"); }
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
      >
        <CreditCard className="w-4 h-4" />
        Manage Subscription
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: any }) {
  const url = invoice.hosted_invoice_url || invoice.invoice_pdf;
  const label = invoice.payment_type === "first_charge" ? "First charge" : "Monthly";

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">${invoice.amount_paid.toFixed(2)}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3" />
            {new Date(invoice.created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            <span className="text-slate-300 dark:text-slate-600">·</span>
            {label}
          </div>
        </div>
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
        >
          View
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

function SubscriptionSection({ user }: { user: any }) {
  const [subData, setSubData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [switchModal, setSwitchModal] = useState<string | null>(null);

  const load = async () => {
    const [sub, inv] = await Promise.all([
      apiFetch("/payments/subscription").catch(() => null),
      apiFetch<{ invoices: any[] }>("/payments/invoices").catch(() => ({ invoices: [] })),
    ]);
    setSubData(sub);
    setInvoices(inv.invoices || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const switchPlan = async (planSlug: string) => {
    setSwitchModal(null);
    setActionLoading(true);
    try {
      const result = await apiFetch<{ status: string; url?: string }>("/payments/switch-plan", { method: "POST", body: JSON.stringify({ plan_slug: planSlug }) });
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      showSuccess("Plan switched successfully!");
      load();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to switch plan");
    }
    setActionLoading(false);
  };

  if (loading) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
  }

  if (!subData?.has_subscription) {
    return <SubscriptionCard isPremium={false} />;
  }

  const periodEnd = subData.current_period_end ? new Date(subData.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";
  const willCancel = subData.cancel_at_period_end;
  const isOneTime = subData.is_one_time;

  return (
    <div className="space-y-4">
      <SubscriptionCard isPremium={true} subData={subData} />

      {/* Plan Details */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Plan Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <FieldLabel>Status</FieldLabel>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${willCancel ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span className="text-sm font-semibold text-slate-800 dark:text-white">
                {willCancel ? "Cancels soon" : "Active"}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <FieldLabel>{isOneTime ? "Expires" : "Next billing"}</FieldLabel>
            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">{periodEnd}</p>
          </div>
          {!isOneTime && subData.card_brand && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 col-span-2">
              <FieldLabel>Payment Method</FieldLabel>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
                  {subData.card_brand} ····{subData.card_last4}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice History */}
      {invoices.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Invoice History</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.slice(0, 5).map((inv: any) => (
              <InvoiceRow key={inv.id} invoice={inv} />
            ))}
          </div>
        </div>
      )}

      {/* Switch Plan Modal */}
      {switchModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSwitchModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Switch to Monthly</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Convert to Pro Monthly at $14.99/month. Your billing period will be adjusted automatically.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSwitchModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => switchPlan(switchModal)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Switching..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function PasswordSection({ user, changePw, setChangePw, currentPw, setCurrentPw, newPw, setNewPw, confirmPw, setConfirmPw, savingPw, savePassword }: any) {
  if (user?.google_id) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update your password</p>
          </div>
        </div>
      </div>

      {changePw ? (
        <div className="space-y-3">
          <div>
            <FieldLabel>Current Password</FieldLabel>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all mt-1"
            />
          </div>
          <div>
            <FieldLabel>New Password</FieldLabel>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all mt-1"
            />
          </div>
          <div>
            <FieldLabel>Confirm New Password</FieldLabel>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all mt-1"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={savePassword}
              disabled={savingPw}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingPw ? "Saving..." : "Change Password"}
            </button>
            <button
              onClick={() => setChangePw(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setChangePw(true)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Change password
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subscription, setSubscription] = useState<UserSubType | null>(null);
  const [loading, setLoading] = useState(true);

  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [changePw, setChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    const mounted = { current: true };
    const controller = new AbortController();

    const sessionId = searchParams.get("session_id");
    const transactionId = searchParams.get("transaction_id");
    const isCheckoutSuccess = searchParams.get("checkout") === "success";
    const storedCheckoutId = typeof window !== "undefined" ? sessionStorage.getItem("pending_checkout_id") : null;
    const checkoutId = sessionId || transactionId || storedCheckoutId;

    if (isCheckoutSuccess && checkoutId) {
      if (storedCheckoutId) sessionStorage.removeItem("pending_checkout_id");
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/payments/verify-session?session_id=${checkoutId}`, {
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      })
        .then((r) => r.json())
        .then((r) => {
          if (!mounted.current) return;
          if (r.status === "ok" || r.status === "already_processed") {
            useAuthStore.getState().refreshSession().then(() => {
              if (!mounted.current) return;
              showSuccess("Payment confirmed! Your plan is now active.");
              router.replace("/settings");
            });
          } else if (r.status === "pending") {
            if (!mounted.current) return;
            showError("Payment still processing. It may take a few moments.");
          }
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          if (!mounted.current) return;
          showError("Could not verify payment. Please refresh.");
        });
    } else if (isCheckoutSuccess) {
      useAuthStore.getState().refreshSession();
    }

    Promise.all([
      getUserSubscription().catch(() => null),
      getDashboardStats().catch(() => null),
    ]).then(([sub, s]) => {
      if (!mounted.current) return;
      setSubscription(sub);
      setLoading(false);
    });

    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, []);

  const saveName = async () => {
    if (!nameValue.trim()) return;
    setSavingName(true);
    try {
      await apiFetch("/users/me/profile", { method: "PATCH", body: JSON.stringify({ full_name: nameValue.trim() }) });
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

                        const handleSignOut = async () => { await logout(); router.push("/"); };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-headline-lg font-bold text-slate-800 dark:text-white mb-1">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account and subscription</p>
        </div>

        {searchParams.get("checkout") === "success" && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Your purchase was successful!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Your premium plan is now active. Enjoy all features!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Profile */}
          <div className="space-y-6">
            <ProfileSection
              user={user}
              editName={editName}
              setEditName={setEditName}
              nameValue={nameValue}
              setNameValue={setNameValue}
              saveName={saveName}
              savingName={savingName}
            />
            <PasswordSection
              user={user}
              changePw={changePw}
              setChangePw={setChangePw}
              currentPw={currentPw}
              setCurrentPw={setCurrentPw}
              newPw={newPw}
              setNewPw={setNewPw}
              confirmPw={confirmPw}
              setConfirmPw={setConfirmPw}
              savingPw={savingPw}
              savePassword={savePassword}
            />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Right Column: Subscription */}
          <div>
            <SubscriptionSection user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
