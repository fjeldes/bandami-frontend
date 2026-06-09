"use client";

import { useEffect, useState, useMemo } from "react";
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
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
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
  const [studyPlan, setStudyPlan] = useState<any[] | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planMessage, setPlanMessage] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [remainingThisMonth, setRemainingThisMonth] = useState(4);
  const [canGenerate, setCanGenerate] = useState(true);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITY_PAGE_SIZE = 5;
  const isPremium = user?.subscription_tier === "premium" || user?.role === "admin";

  useEffect(() => {
    Promise.all([getDashboardStats(), getUserExams({ limit: 30 })])
      .then(([s, result]) => { setStats(s); setExams(result.exams.reverse()); })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));

    // Load existing study plan
    apiFetch<{ plan: any[] | null; message: string; can_generate: boolean; remaining_this_month: number; id?: string }>("/users/me/study-plan")
      .then((res) => {
        if (res.plan && res.plan.length > 0) {
          setStudyPlan(res.plan);
          setPlanMessage(res.message);
          if (res.id) setPlanId(res.id);
        }
        setCanGenerate(res.can_generate);
        setRemainingThisMonth(res.remaining_this_month);
      })
      .catch(() => {});

    const stored = typeof window !== "undefined" ? localStorage.getItem("ielts_target") : null;
    if (stored) setTarget(parseFloat(stored));

    const onboarded = typeof window !== "undefined" ? localStorage.getItem("ielts_onboarded") : "1";
    if (!onboarded) setShowOnboarding(true);

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

  const streak = useMemo(() => {
    let count = 0; const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 90; i++) { const d = new Date(today); d.setDate(d.getDate() - i); const ds = d.toDateString(); if (exams.some((e) => new Date(e.created_at).toDateString() === ds)) count++; else break; }
    return count;
  }, [exams]);

  const totalTime = useMemo(() => {
    const secs = exams.filter((e) => e.time_taken_seconds).reduce((a, e) => a + (e.time_taken_seconds || 0), 0);
    const hrs = Math.floor(secs / 3600); const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m studied`; if (mins > 0) return `${mins}m studied`; return "";
  }, [exams]);

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
  const isUnlimited = limit === -1;
  const evalsPct = !isUnlimited && limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  const toggleDay = async (day: number) => {
    if (!planId || !studyPlan) return;
    const item = studyPlan.find((d: any) => d.day === day);
    if (!item) return;
    const newCompleted = !item.completed;
    try {
      await apiFetch(`/users/me/study-plan/${planId}`, {
        method: "PATCH",
        body: JSON.stringify({ day, completed: newCompleted }),
      });
      setStudyPlan(studyPlan.map((d: any) => d.day === day ? { ...d, completed: newCompleted } : d));
    } catch (err) {
      showError("Failed to update");
    }
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      const result = await apiFetch<{ plan: any[]; message: string; id: string; can_generate: boolean; remaining_this_month: number }>("/users/me/study-plan", { method: "POST" });
      setStudyPlan(result.plan);
      setPlanMessage(result.message);
      if (result.id) setPlanId(result.id);
      setCanGenerate(result.can_generate);
      setRemainingThisMonth(result.remaining_this_month);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate plan";
      if (msg.includes("429") || msg.includes("all")) showError("You've used all your plans this month. New plans unlock next month.");
      else showError(msg);
    }
    setPlanLoading(false);
  };

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
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-body-md text-on-surface-variant">
                {stats?.total_exams ? `${stats.total_exams} exams completed` : "Start practicing to see your stats"}
              </p>
              {streak > 1 && (
                <span className="text-body-md text-secondary font-semibold flex items-center gap-1">🔥 {streak}-day streak</span>
              )}
              {totalTime !== "" && (
                <span className="text-body-md text-on-surface-variant">· {totalTime}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {target != null && latestBand != null ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-primary-fixed/30 rounded-full px-3 py-1.5">
                  <span className="text-label-sm text-on-surface-variant">Target:</span>
                  <span className="font-mono text-data-md font-bold text-primary">Band {target.toFixed(1)}</span>
                  <button onClick={() => { setTarget(null); localStorage.removeItem("ielts_target"); }} className="text-on-surface-variant hover:text-error text-[14px] material-symbols-outlined">close</button>
                </div>
                {target > latestBand ? (
                  <div className="w-48">
                    <div className="flex justify-between text-label-sm text-on-surface-variant mb-0.5">
                      <span>Band {latestBand.toFixed(1)}</span>
                      <span>{((latestBand / target) * 100).toFixed(0)}% to target</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (latestBand / target) * 100)}%` }} />
                    </div>
                  </div>
                ) : (
                  <span className="text-label-sm text-emerald-600">🎯 Target reached!</span>
                )}
              </div>
            ) : target != null ? (
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
          { icon: "today", label: "Today", value: limit === -1 ? "Unlimited" : `${used}/${limit}`, sub: limit === -1 ? "free access" : "evaluations", color: "text-primary" },
          { icon: "analytics", label: "Average Band", value: stats?.average_band ? stats.average_band.toFixed(1) : "--", sub: `CEFR ${cefrLevel(stats?.average_band || 0)}`, color: "text-secondary-container" },
          { icon: "trending_up", label: "Best", value: bestBand ? bestBand.toFixed(1) : "--", sub: "highest score", color: "text-emerald-600" },
          { icon: "auto_awesome", label: "Progress", value: target && latestBand ? `${((latestBand / target) * 100).toFixed(0)}%` : "--", sub: target ? `to Band ${target.toFixed(1)}` : "set goal ↑", color: "text-primary" },
        ].map((c, idx) => (
          <div key={c.label} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up" style={{ animationDelay: `${0.1 + idx * 0.08}s` }}>
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
                  <div className="h-20 overflow-hidden"><Sparkline points={writingBands.map((w) => w.b)} height={80} /></div>
                </div>
              )}
              {speakingBands.length >= 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-secondary-container" />
                    <span className="text-label-sm text-on-surface-variant">Speaking</span>
                    <span className="text-label-sm text-on-surface ml-auto font-mono">{speakingBands[speakingBands.length - 1].b.toFixed(1)}</span>
                  </div>
                  <div className="h-20 overflow-hidden"><Sparkline points={speakingBands.map((s) => s.b)} height={80} /></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity Heatmap + Study Plan */}
        <div className="space-y-5">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-body-md font-semibold text-on-surface mb-3">This Week</h3>
            {daysThisWeek.every((d) => d.count === 0) ? (
              <div className="text-center py-4">
                <span className="material-symbols-outlined text-[32px] text-outline mb-2">calendar_today</span>
                <p className="text-label-sm text-on-surface-variant">No activity yet this week. Start practicing!</p>
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-16 overflow-hidden px-1">
                {daysThisWeek.map((d, i) => {
                  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  const today = new Date();
                  today.setDate(today.getDate() - (6 - i));
                  const month = today.toLocaleDateString("en-US", { month: "short" });
                  const dayNum = today.getDate();
                  return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className={`w-full rounded-sm transition-all ${d.count > 0 ? "bg-primary" : "bg-surface-variant"} ${d.count > 1 ? "opacity-100" : d.count > 0 ? "opacity-70" : "opacity-30"}`}
                      style={{ height: `${Math.min(Math.max(4, d.count * 20), 64)}px` }} />
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] font-semibold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {d.count} {d.count === 1 ? "eval" : "evals"} · {month} {dayNum}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">{d.day}</span>
                  </div>
                )})}
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
      {limit !== -1 && used >= limit && (
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
          { href: "/reading", icon: "menu_book", label: "Reading", sub: "Coming soon", comingSoon: true },
          { href: "/history", icon: "analytics", label: "Reports", sub: "Review past exams" },
        ].map((a) => (
          a.comingSoon ? (
            <div key={a.href} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-sm opacity-50 cursor-default select-none">
              <div className="flex items-center gap-3">
                <div className="bg-surface-variant p-2.5 rounded-lg text-outline">
                  <span className="material-symbols-outlined text-[24px]">{a.icon}</span>
                </div>
                <div>
                  <h3 className="text-body-md font-semibold text-on-surface">{a.label}</h3>
                  <p className="text-label-sm text-on-surface-variant">{a.sub}</p>
                </div>
              </div>
            </div>
          ) : (
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
          )
        ))}
      </div>

      {/* Study Plan (Premium) */}
      {isPremium && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-body-md font-semibold text-on-surface">7-Day Study Plan</h3>
              {studyPlan && (
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  {studyPlan.filter((d: any) => d.completed).length}/{studyPlan.length} days completed
                  <span className="mx-2">·</span>
                  {remainingThisMonth}/4 plans this month
                </p>
              )}
              {!studyPlan && remainingThisMonth < 4 && (
                <p className="text-label-sm text-on-surface-variant mt-0.5">{remainingThisMonth}/4 plans remaining this month</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!studyPlan && remainingThisMonth > 0 && exams.length > 0 && (
                <button onClick={generatePlan} disabled={planLoading}
                  className="bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-semibold hover:scale-[0.98] active:scale-[0.97] transition-all disabled:opacity-50 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  {planLoading ? "Generating..." : "Generate Plan"}
                </button>
              )}
              {studyPlan && remainingThisMonth > 0 && exams.length > 0 && (
                <button onClick={() => setShowRegenModal(true)} disabled={planLoading}
                  className="bg-surface-container-high text-on-surface px-3 py-2 rounded-xl text-label-sm font-semibold hover:bg-surface-container transition-all disabled:opacity-50 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Regenerate
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {studyPlan && studyPlan.length > 0 && (
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(studyPlan.filter((d: any) => d.completed).length / studyPlan.length) * 100}%` }}
              />
            </div>
          )}

          {planMessage && <p className="text-body-md text-on-surface-variant mb-4">{planMessage}</p>}
          {studyPlan && studyPlan.length > 0 && (
            <div className="space-y-2">
              {studyPlan.map((item: any, i: number) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  item.completed ? "bg-primary-container/20 border border-primary/20" : "bg-surface-container"
                }`}>
                  <button
                    onClick={() => toggleDay(item.day)}
                    className={`w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center transition-all border-2 ${
                      item.completed
                        ? "bg-primary border-primary text-on-primary"
                        : "border-outline-variant hover:border-primary"
                    }`}
                  >
                    {item.completed && (
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                  </button>
                  <div className={item.completed ? "opacity-50" : ""}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{
                        item.day
                      }</span>
                      <p className="text-label-sm font-semibold text-on-surface">{item.focus}</p>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mt-1 ml-8">{item.task}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!studyPlan && remainingThisMonth <= 0 && (
            <p className="text-label-sm text-on-surface-variant text-center py-4">
              You've used all 4 plans this month. New plans unlock next month.
            </p>
          )}
          {!studyPlan && exams.length === 0 && (
            <p className="text-label-sm text-on-surface-variant text-center py-4">
              Complete at least one exam to generate a study plan.
            </p>
          )}
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/50 p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-warning-container/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-warning" style={{ fontVariationSettings: "'FILL' 1" }}>refresh</span>
            </div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">Regenerate Study Plan?</h3>
            <p className="text-body-md text-on-surface-variant mb-1">
              You have <strong>{remainingThisMonth} of 4 plans</strong> remaining this month.
            </p>
            <p className="text-body-md text-on-surface-variant mb-6">
              Your current plan will be replaced.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegenModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-outline-variant text-on-surface text-label-sm font-semibold hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowRegenModal(false); generatePlan(); }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Yes, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

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
              <Link href="/writing" className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-label-sm font-semibold hover:scale-[0.98] active:scale-[0.97] transition-all">Practice Writing</Link>
              <Link href="/speaking" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:scale-[0.98] active:scale-[0.97] transition-all">Practice Speaking</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-outline-variant/30">
              {exams.slice().reverse().slice((activityPage - 1) * ACTIVITY_PAGE_SIZE, activityPage * ACTIVITY_PAGE_SIZE).map((exam) => {
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
            {/* Pagination */}
            {exams.length > ACTIVITY_PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/40">
                <span className="text-label-sm text-on-surface-variant">
                  {((activityPage - 1) * ACTIVITY_PAGE_SIZE) + 1}–{Math.min(activityPage * ACTIVITY_PAGE_SIZE, exams.length)} of {exams.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                    disabled={activityPage === 1}
                    className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-default"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setActivityPage((p) => Math.min(Math.ceil(exams.length / ACTIVITY_PAGE_SIZE), p + 1))}
                    disabled={activityPage * ACTIVITY_PAGE_SIZE >= exams.length}
                    className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-default"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
