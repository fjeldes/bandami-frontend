"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import { getDashboardStats, getUserExams, apiFetch } from "@/lib/api";
import { showSuccess, showError } from "@/components/ui/Toast";
import type { DashboardStats, ExamWithEvaluation } from "@/lib/types";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container-high rounded-lg ${className}`} />;
}

function Sparkline({ points, height = 80 }: { points: number[]; height?: number }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = 100;
  const h = height;
  const padX = 0;
  const padY = 8;
  const xs = points.map((_, i) => padX + (i / (points.length - 1)) * (w - padX * 2));
  const ys = points.map((p) => padY + ((max - p) / range) * (h - padY * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const area = `${path} L ${xs[xs.length - 1]} ${h} L ${xs[0]} ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#004ac6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke="#004ac6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r="2.5" fill="#2563eb" />
      ))}
    </svg>
  );
}

function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: "edit_note", title: "Writing Practice", desc: "Submit essays and get AI-evaluated band scores with detailed feedback on all 4 criteria." },
    { icon: "record_voice_over", title: "Speaking Practice", desc: "Record your voice answering IELTS-style questions. AI evaluates pronunciation, fluency, and more." },
    { icon: "history", title: "Track Progress", desc: "Your history shows every exam with band scores. Watch your improvement over time." },
    { icon: "bolt", title: "4 Free Evaluations Daily", desc: "You get 4 free AI evaluations every day. Upgrade for unlimited access and instant detailed feedback." },
  ];

  const s = steps[step];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/50 p-8 max-w-sm w-full text-center relative">
        <button onClick={onDismiss} className="absolute top-3 right-3 p-1 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="material-symbols-outlined text-[48px] text-primary mb-4">{s.icon}</span>
        <h3 className="text-headline-md font-bold text-on-surface mb-2">{s.title}</h3>
        <p className="text-body-md text-on-surface-variant mb-6">{s.desc}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-primary" : "bg-surface-variant"}`} />
            ))}
          </div>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity">
              Next
            </button>
          ) : (
            <button onClick={onDismiss} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity">
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function cefrLevel(band: number) {
  if (band >= 8.5) return "C2";
  if (band >= 7.0) return "C1";
  if (band >= 5.5) return "B2";
  if (band >= 4.0) return "B1";
  if (band >= 3.0) return "A2";
  return "A1";
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [exams, setExams] = useState<ExamWithEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTargetInput, setShowTargetInput] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [refCredits, setRefCredits] = useState(0);
  const [refCount, setRefCount] = useState(0);

  useEffect(() => {
    Promise.all([getDashboardStats(), getUserExams({ limit: 30 })])
      .then(([s, e]) => { setStats(s); setExams(e.reverse()); })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));

    const stored = typeof window !== "undefined" ? localStorage.getItem("ielts_target") : null;
    if (stored) setTarget(parseFloat(stored));

    const onboarded = typeof window !== "undefined" ? localStorage.getItem("ielts_onboarded") : "1";
    if (!onboarded) setShowOnboarding(true);

    apiFetch<{ credits_remaining: number; referral_count: number }>("/users/me/referral")
      .then((r) => { setRefCredits(r.credits_remaining); setRefCount(r.referral_count); })
      .catch(() => {});
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem("ielts_onboarded", "1");
    setShowOnboarding(false);
  };

  const saveTarget = () => {
    const v = parseFloat(targetInput);
    if (v >= 0 && v <= 9) {
      setTarget(v);
      localStorage.setItem("ielts_target", String(v));
    }
    setShowTargetInput(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
        <p className="text-body-lg text-on-surface-variant mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-primary font-semibold">Retry</button>
      </div>
    );
  }

  const used = stats?.daily_evals_used ?? 0;
  const limit = stats?.daily_eval_limit ?? 4;
  const evalsPct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  const bandHistory = exams
    .filter((e) => e.evaluations?.[0]?.overall_band != null)
    .map((e) => ({
      band: e.evaluations[0].overall_band,
      date: new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: e.exam_type,
    }));

  const bands = bandHistory.map((h) => h.band);
  const latestBand = bands.length > 0 ? bands[bands.length - 1] : stats?.average_band;
  const bestBand = stats?.highest_band ?? (bands.length > 0 ? Math.max(...bands) : null);

  const recentExams = exams.slice(-10);
  const writingBands = recentExams.filter((e) => e.exam_type === "writing" && e.evaluations?.[0]?.overall_band != null).map((e) => ({ b: e.evaluations[0].overall_band, d: new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }));
  const speakingBands = recentExams.filter((e) => e.exam_type === "speaking" && e.evaluations?.[0]?.overall_band != null).map((e) => ({ b: e.evaluations[0].overall_band, d: new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }));

  const lastEval = exams.filter((e) => e.evaluations?.[0]?.criteria_scores).slice(-1)[0];
  const weakCriteria: string[] = [];
  if (lastEval?.evaluations?.[0]?.criteria_scores) {
    const cs = lastEval.evaluations[0].criteria_scores;
    const entries = Object.entries(cs) as [string, { score: number; comment: string }][];
    const sorted = entries.sort((a, b) => a[1].score - b[1].score);
    weakCriteria.push(...sorted.slice(0, 2).map(([k]) => k.replace(/_/g, " ")));
  }

  const daysThisWeek = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toDateString();
    const count = exams.filter((e) => new Date(e.created_at).toDateString() === ds).length;
    return { day: d.toLocaleDateString("en-US", { weekday: "short" })[0], count };
  });

  return (
    <div>
      {showOnboarding && <OnboardingOverlay onDismiss={dismissOnboarding} />}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">
              Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              {stats?.total_exams ? `${stats.total_exams} exams completed` : "Start practicing to see your stats"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {target != null ? (
              <div className="flex items-center gap-2 bg-primary-fixed/30 rounded-full px-3 py-1.5">
                <span className="text-label-sm text-on-surface-variant">Target:</span>
                <span className="font-mono text-data-md font-bold text-primary">Band {target.toFixed(1)}</span>
                <button onClick={() => { setTarget(null); localStorage.removeItem("ielts_target"); }} className="text-on-surface-variant hover:text-error text-[14px] material-symbols-outlined">close</button>
              </div>
            ) : showTargetInput ? (
              <div className="flex items-center gap-1">
                <input type="number" min={0} max={9} step={0.5} value={targetInput} onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="7.0" className="w-16 bg-surface-container border border-outline-variant rounded-lg px-2 py-1 text-body-md text-on-surface text-center outline-none focus:border-primary" />
                <button onClick={saveTarget} className="text-primary text-label-sm font-semibold">Set</button>
                <button onClick={() => setShowTargetInput(false)} className="text-on-surface-variant text-[16px] material-symbols-outlined">close</button>
              </div>
            ) : (
              <button onClick={() => setShowTargetInput(true)} className="flex items-center gap-1.5 text-label-sm text-primary hover:underline">
                <span className="material-symbols-outlined text-[16px]">flag</span> Set Goal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: "today", label: "Today", value: `${used}/${limit}`, sub: "evaluations", color: "text-primary" },
          { icon: "analytics", label: "Average Band", value: stats?.average_band ? stats.average_band.toFixed(1) : "--", sub: `CEFR ${cefrLevel(stats?.average_band || 0)}`, color: "text-secondary-container" },
          { icon: "trending_up", label: "Best", value: bestBand ? bestBand.toFixed(1) : "--", sub: "highest score", color: "text-emerald-600" },
          { icon: "auto_awesome", label: "Progress", value: target && latestBand ? `${((latestBand / target) * 100).toFixed(0)}%` : "--", sub: target ? `to Band ${target.toFixed(1)}` : "set goal ↑", color: "text-primary" },
        ].map((c) => (
          <div key={c.label} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className={`material-symbols-outlined text-[18px] ${c.color}`}>{c.icon}</span>
              <span className="text-label-sm text-on-surface-variant">{c.label}</span>
            </div>
            <p className="font-mono text-headline-md font-bold text-on-surface mb-1">{c.value}</p>
            <p className="text-label-sm text-on-surface-variant">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Progress Chart */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
          <h3 className="text-body-md font-semibold text-on-surface mb-4">Band Score Trend</h3>
          {writingBands.length < 2 && speakingBands.length < 2 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[40px] text-outline mb-3">show_chart</span>
              <p className="text-body-md text-on-surface-variant">Complete a few exams to see your trend.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {writingBands.length >= 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-label-sm text-on-surface-variant">Writing</span>
                    <span className="text-label-sm text-on-surface ml-auto font-mono">{writingBands[writingBands.length - 1].b.toFixed(1)}</span>
                  </div>
                  <div className="h-20"><Sparkline points={writingBands.map((w) => w.b)} height={80} /></div>
                </div>
              )}
              {speakingBands.length >= 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-secondary-container" />
                    <span className="text-label-sm text-on-surface-variant">Speaking</span>
                    <span className="text-label-sm text-on-surface ml-auto font-mono">{speakingBands[speakingBands.length - 1].b.toFixed(1)}</span>
                  </div>
                  <div className="h-20"><Sparkline points={speakingBands.map((s) => s.b)} height={80} /></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity Heatmap + Study Plan */}
        <div className="space-y-5">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
            <h3 className="text-body-md font-semibold text-on-surface mb-3">This Week</h3>
            {daysThisWeek.every((d) => d.count === 0) ? (
              <div className="text-center py-4">
                <span className="material-symbols-outlined text-[32px] text-outline mb-2">calendar_today</span>
                <p className="text-label-sm text-on-surface-variant">No activity yet this week. Start practicing!</p>
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-16">
                {daysThisWeek.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-sm transition-all ${d.count > 0 ? "bg-primary" : "bg-surface-variant"} ${d.count > 1 ? "opacity-100" : d.count > 0 ? "opacity-70" : "opacity-30"}`}
                      style={{ height: `${Math.max(8, d.count * 20)}px` }} />
                    <span className="text-[10px] text-on-surface-variant">{d.day}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {weakCriteria.length > 0 && (
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/80 rounded-l-full" />
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                <h3 className="text-body-md font-semibold text-on-surface">Focus Areas</h3>
              </div>
              <p className="text-label-sm text-on-surface-variant mb-3">
                Based on your last evaluation, improve these criteria:
              </p>
              <div className="space-y-1.5">
                {weakCriteria.map((c) => (
                  <span key={c} className="inline-block capitalize bg-primary-fixed/50 text-on-primary-fixed-variant text-label-sm px-2.5 py-0.5 rounded-full mr-2 mb-1.5">{c}</span>
                ))}
              </div>
              <Link href={lastEval?.exam_type === "speaking" ? "/speaking" : "/writing"} className="text-label-sm text-primary font-semibold hover:underline mt-2 inline-block">
                Practice now →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {used >= limit && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">bolt</span>
            <div>
              <p className="text-body-md font-semibold text-on-surface">Daily limit reached</p>
              <p className="text-label-sm text-on-surface-variant">You've used all {limit} free evaluations today. Upgrade to continue practicing.</p>
            </div>
          </div>
          <Link href="/pricing" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">Upgrade</Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { href: "/writing", icon: "edit", label: "Writing", sub: `${stats?.writing_exams ?? 0} completed` },
          { href: "/speaking", icon: "mic", label: "Speaking", sub: `${stats?.speaking_exams ?? 0} completed` },
          { href: "/reading", icon: "menu_book", label: "Reading", sub: "Comprehension practice" },
          { href: "/history", icon: "history", label: "History", sub: "Review past exams" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-sm hover:border-primary hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-primary-container/20 p-2.5 rounded-lg text-primary group-hover:bg-primary-container/40 transition-colors">
                <span className="material-symbols-outlined text-[24px]">{a.icon}</span>
              </div>
              <div>
                <h3 className="text-body-md font-semibold text-on-surface">{a.label}</h3>
                <p className="text-label-sm text-on-surface-variant">{a.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Referral Banner */}
      <div className="bg-referral-bg rounded-xl border border-referral-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary-fixed p-3 rounded-xl text-primary shrink-0">
            <span className="material-symbols-outlined text-[28px]">stars</span>
          </div>
          <div>
            <h3 className="text-body-md font-semibold text-on-surface">Earn Free Evaluations</h3>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              {refCredits > 0
                ? `You have ${refCredits} referral credits from ${refCount} ${refCount === 1 ? "friend" : "friends"}.`
                : `Invite friends and earn +2 credits each. You both get rewarded.`}
            </p>
          </div>
        </div>
        <Link href="/settings" className="px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap shrink-0">
          {user?.referral_code ? "Invite Friends" : "Get Code"}
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm">
        <div className="p-5 border-b border-outline-variant/40 flex justify-between items-center">
          <h3 className="text-body-md font-semibold text-on-surface">Recent Activity</h3>
          <Link href="/history" className="text-label-sm text-primary font-semibold hover:underline">View All</Link>
        </div>
        {exams.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-[40px] text-outline mb-3">assignment</span>
            <p className="text-body-md text-on-surface-variant">No exams yet. Start practicing to see your activity here.</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/writing" className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity">Practice Writing</Link>
              <Link href="/speaking" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity">Practice Speaking</Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {exams.slice(-8).reverse().map((exam) => {
              const ev = exam.evaluations?.[0] || (exam as any).evaluations;
              const band = ev?.overall_band;
              return (
                <div key={exam.id} className="p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-primary text-[20px]">{exam.exam_type === "writing" ? "edit" : "mic"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md text-on-surface truncate capitalize">{exam.exam_type} {exam.task_type ? `Task ${exam.task_type.replace("task", "")}` : ""}</p>
                    <p className="text-label-sm text-on-surface-variant">{new Date(exam.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="text-right">
                    {band != null ? (
                      <Link href={`/${exam.exam_type}/results?examId=${exam.id}`} className="font-mono text-data-md font-bold text-primary hover:underline">Band {band.toFixed(1)}</Link>
                    ) : (
                      <span className="text-label-sm text-on-surface-variant capitalize">{exam.status}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
