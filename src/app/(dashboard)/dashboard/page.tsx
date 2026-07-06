"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import { useDashboardStats, useExams, useStudyPlan, useGenerateStudyPlan, useToggleStudyPlanDay } from "@/hooks/useApi";
import { showSuccess, showError } from "@/components/ui/Toast";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />;
}

function Sparkline({ points, height = 80, color = "#004ac6" }: { points: number[]; height?: number; color?: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = 100;
  const h = height;
  const padX = 2;
  const padY = 6;
  const xs = points.map((_, i) => padX + (i / (points.length - 1)) * (w - padX * 2));
  const ys = points.map((p) => padY + ((max - p) / range) * (h - padY * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const area = `${path} L ${xs[xs.length - 1]} ${h - padY} L ${xs[0]} ${h - padY} Z`;
  const gradId = `sparkGrad_${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="60%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill={color} className="drop-shadow-sm" />
      ))}
    </svg>
  );
}

function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: "edit_note", title: "Writing Practice", desc: "Submit essays and get band scores with detailed feedback on all 4 marking criteria." },
    { icon: "record_voice_over", title: "Speaking Practice", desc: "Record your voice answering IELTS-style questions. Get evaluated on fluency, pronunciation, and more." },
    { icon: "history", title: "Track Progress", desc: "Your history shows every exam with band scores. Watch your improvement over time." },
    { icon: "bolt", title: "Unlimited Practice", desc: "Practice as much as you want. Upgrade to Pro for detailed feedback and full access." },
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
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: examsData, isLoading: examsLoading } = useExams(30);
  const { data: studyPlanData } = useStudyPlan();
  const exams = examsData?.exams ? [...examsData.exams].reverse() : [];
  const loading = statsLoading || examsLoading;
  const error = statsError ? (statsError instanceof Error ? statsError.message : "Failed to load") : "";

  const studyPlan = studyPlanData?.plan || null;
  const planMessage = studyPlanData?.message || "";
  const planId = studyPlanData?.id || null;
  const canGenerate = studyPlanData?.can_generate ?? true;
  const remainingThisMonth = studyPlanData?.remaining_this_month ?? 4;

  const generatePlanMutation = useGenerateStudyPlan();
  const togglePlanDay = useToggleStudyPlanDay();

  const [target, setTarget] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState("7.0");
  const [planLoading, setPlanLoading] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITY_PAGE_SIZE = 5;
  const isPremium = user?.subscription_tier === "premium" || user?.role === "admin";

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("ielts_target") : null;
    if (stored) setTarget(parseFloat(stored));
    const onboarded = typeof window !== "undefined" ? localStorage.getItem("ielts_onboarded") : "1";
    if (!onboarded) setShowOnboarding(true);
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem("ielts_onboarded", "1");
    setShowOnboarding(false);
  };

  const cefrInfo: Record<string, { label: string; description: string; color: string }> = {
    A1: { label: "Beginner", description: "Can understand and use basic phrases.", color: "text-red-500" },
    A2: { label: "Elementary", description: "Can communicate in simple, routine tasks.", color: "text-orange-500" },
    B1: { label: "Intermediate", description: "Can handle everyday situations and express opinions.", color: "text-yellow-600" },
    B2: { label: "Upper Intermediate", description: "Can interact fluently on familiar topics.", color: "text-lime-600" },
    C1: { label: "Advanced", description: "Can express ideas fluently and spontaneously.", color: "text-emerald-600" },
    C2: { label: "Proficient", description: "Can understand virtually everything with ease.", color: "text-primary" },
  };

  const bandOptions = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

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

  const toggleDay = async (day: number) => {
    if (!planId || !studyPlan) return;
    const item = studyPlan.find((d: any) => d.day === day);
    if (!item) return;
    const newCompleted = !item.completed;
    togglePlanDay.mutate(
      { planId, day, completed: newCompleted },
      { onError: () => showError("Failed to update") }
    );
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    generatePlanMutation.mutate(undefined, {
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "Failed to generate plan";
        if (msg.includes("429") || msg.includes("all")) showError("You've used all your plans this month. New plans unlock next month.");
        else showError(msg);
        setPlanLoading(false);
      },
      onSuccess: () => setPlanLoading(false),
    });
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
            {target != null && (
              <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
                  <span className="text-label-sm text-on-surface-variant">Target</span>
                  <span className="font-mono text-data-md font-bold text-primary">Band {target.toFixed(1)}</span>
                  <span className="text-label-sm text-on-surface-variant px-1.5 py-0.5 rounded bg-surface-container-high">{cefrLevel(target)}</span>
                </div>
                {latestBand != null && (
                  <div className="flex items-center gap-2 pl-3 border-l border-outline-variant/30">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-label-sm text-on-surface-variant">
                          {target > latestBand ? `${((latestBand / target) * 100).toFixed(0)}%` : "🎯 Goal met!"}
                        </span>
                        <span className="text-label-sm text-on-surface-variant">
                          {target > latestBand ? `Gap: ${(target - latestBand).toFixed(1)}` : ""}
                        </span>
                      </div>
                      <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (latestBand / target) * 100)}%` }} />
                      </div>
                    </div>
                    <button onClick={() => { setTarget(null); localStorage.removeItem("ielts_target"); }} className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
                {latestBand == null && (
                  <button onClick={() => { setTarget(null); localStorage.removeItem("ielts_target"); }} className="text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            )}
            {target == null && (
              <button onClick={() => { setGoalInput(latestBand ? String(Math.min(9, latestBand + 1)) : "7.0"); setShowGoalModal(true); }}
                className="flex items-center gap-1.5 text-label-sm text-primary bg-primary-fixed/20 hover:bg-primary-fixed/40 px-3 py-2 rounded-lg transition-all font-semibold">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                Set Goal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: "analytics", label: "Average Band", value: stats?.average_band ? stats.average_band.toFixed(1) : "--", sub: stats?.average_band ? `CEFR ${cefrLevel(stats.average_band)}` : "--", color: "text-primary", gradient: "from-primary/10 to-transparent" },
          { icon: "trending_up", label: "Best", value: bestBand ? bestBand.toFixed(1) : "--", sub: "Highest score", color: "text-emerald-500", gradient: "from-emerald-500/10 to-transparent" },
          { icon: "auto_awesome", label: "Progress", value: target && latestBand ? `${((latestBand / target) * 100).toFixed(0)}%` : "--", sub: target ? `to Band ${target.toFixed(1)}` : "Set goal ↑", color: "text-primary", gradient: "from-primary/10 to-transparent" },
        ].map((c, idx) => (
          <div key={c.label} className={`group relative bg-gradient-to-br ${c.gradient} rounded-2xl p-5 shadow-card hover:shadow-card-float hover:-translate-y-1 transition-all duration-300 ease-out animate-fade-in-up border border-transparent hover:border-outline-variant/50`} style={{ animationDelay: `${0.1 + idx * 0.08}s` }}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center ${c.color}`}>
                <span className={`material-symbols-outlined text-[20px]`}>{c.icon}</span>
              </div>
              <span className="text-label-sm text-on-surface-variant font-medium">{c.label}</span>
            </div>
            <p className="relative font-mono text-headline-md font-bold text-on-surface mb-1">{c.value}</p>
            <p className="relative text-label-sm text-on-surface-variant">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Progress Chart */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body-md font-semibold text-on-surface">Band Score Trend</h3>
            <div className="flex items-center gap-3 text-label-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-on-surface-variant">Writing</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="text-on-surface-variant">Speaking</span>
              </span>
            </div>
          </div>
          {writingBands.length < 2 && speakingBands.length < 2 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[40px] text-outline mb-3">show_chart</span>
              <p className="text-body-md text-on-surface-variant">Complete a few exams to see your trend.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {writingBands.length >= 2 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm text-on-surface-variant">Writing</span>
                    <span className="font-mono text-data-md font-bold text-primary">{writingBands[writingBands.length - 1].b.toFixed(1)}</span>
                  </div>
                  <div className="h-24 bg-gradient-to-b from-primary/5 to-transparent rounded-xl p-2 -mx-2">
                    <Sparkline points={writingBands.map((w) => w.b)} height={80} color="#004ac6" />
                  </div>
                </div>
              )}
              {speakingBands.length >= 2 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm text-on-surface-variant">Speaking</span>
                    <span className="font-mono text-data-md font-bold text-secondary">{speakingBands[speakingBands.length - 1].b.toFixed(1)}</span>
                  </div>
                  <div className="h-24 bg-gradient-to-b from-secondary/5 to-transparent rounded-xl p-2 -mx-2">
                    <Sparkline points={speakingBands.map((s) => s.b)} height={80} color="#0390d4" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity Heatmap + Study Plan */}
        <div className="space-y-5">
          <div className="bg-surface-container-lowest rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-5 border border-outline-variant/30 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-body-md font-semibold text-on-surface mb-4">This Week</h3>
            {daysThisWeek.every((d) => d.count === 0) ? (
              <div className="text-center py-4">
                <span className="material-symbols-outlined text-[32px] text-outline mb-2">calendar_today</span>
                <p className="text-label-sm text-on-surface-variant">No activity yet this week. Start practicing!</p>
              </div>
            ) : (
              <div className="flex items-end gap-2 h-24 px-2">
                {daysThisWeek.map((d, i) => {
                  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  const today = new Date();
                  today.setDate(today.getDate() - (6 - i));
                  const month = today.toLocaleDateString("en-US", { month: "short" });
                  const dayNum = today.getDate();
                  const maxH = 72;
                  const barH = d.count > 0 ? Math.min(Math.max(8, d.count * 24), maxH) : 4;
                  const opacity = d.count > 1 ? "100" : d.count > 0 ? "70" : "30";
                  return (
                  <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-semibold text-on-surface-variant mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {d.count}
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 hover:brightness-110 ${d.count > 0 ? "bg-primary" : "bg-surface-variant"}`}
                        style={{ height: `${barH}px`, opacity: d.count > 0 ? undefined : 0.4 }}
                      />
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium">{d.day}</span>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] font-semibold px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-10">
                      {d.count} {d.count === 1 ? "eval" : "evals"} · {month} {dayNum}
                    </span>
                  </div>
                )})}
              </div>
            )}
          </div>

          {weakCriteria.length > 0 && (
            <div className="bg-gradient-to-br from-primary/8 to-transparent rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5 border border-primary/20 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent text-[20px]">lightbulb</span>
                </div>
                <div>
                  <h3 className="text-body-md font-semibold text-on-surface">Focus Areas</h3>
                  <p className="text-label-xs text-on-surface-variant">Based on your last evaluation</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {weakCriteria.map((c) => (
                  <span key={c} className="capitalize bg-primary-fixed/60 text-on-primary-fixed-variant text-label-sm px-3 py-1.5 rounded-lg font-medium">{c}</span>
                ))}
              </div>
              <Link href={lastEval?.exam_type === "speaking" ? "/speaking" : "/writing"} className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-on-accent px-5 py-2.5 rounded-xl text-label-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Practice now
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { href: "/writing", icon: "edit", label: "Writing", sub: `${stats?.writing_exams ?? 0} completed`, accent: "primary" },
          { href: "/speaking", icon: "mic", label: "Speaking", sub: `${stats?.speaking_exams ?? 0} completed`, accent: "secondary" },
          { href: "/reading", icon: "menu_book", label: "Reading", sub: "Coming soon", comingSoon: true },
          { href: "/history", icon: "analytics", label: "Reports", sub: "Review past exams", accent: "primary" },
        ].map((a) => (
          a.comingSoon ? (
            <div key={a.href} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm opacity-50 cursor-default select-none transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px] text-outline">{a.icon}</span>
                </div>
                <div>
                  <h3 className="text-body-md font-semibold text-on-surface">{a.label}</h3>
                  <p className="text-label-sm text-on-surface-variant">{a.sub}</p>
                </div>
              </div>
            </div>
          ) : (
          <Link key={a.href} href={a.href} className={`group relative bg-surface-container-lowest rounded-2xl p-5 shadow-card hover:shadow-card-float border border-transparent hover:border-${a.accent === 'secondary' ? 'secondary' : 'outline-variant'}/50 transition-all duration-300 hover:-translate-y-1`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-${a.accent === 'secondary' ? 'secondary' : 'primary'}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${a.accent === 'secondary' ? 'secondary' : 'primary'}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <span className={`material-symbols-outlined text-[24px] text-${a.accent === 'secondary' ? 'secondary' : 'primary'}`}>{a.icon}</span>
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

          {/* Study Plan (Pro) */}
      {isPremium && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5 mb-6 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
              </div>
              <div>
                <h3 className="text-body-md font-semibold text-on-surface">7-Day Study Plan</h3>
                {studyPlan && (
                  <p className="text-label-xs text-on-surface-variant mt-0.5">
                    {studyPlan.filter((d: any) => d.completed).length}/{studyPlan.length} days completed
                    <span className="mx-2">·</span>
                    {remainingThisMonth}/4 plans this month
                  </p>
                )}
                {!studyPlan && remainingThisMonth < 4 && (
                  <p className="text-label-xs text-on-surface-variant mt-0.5">{remainingThisMonth}/4 plans remaining this month</p>
                )}
              </div>
            </div>
              <div className="flex items-center gap-3">
              {!studyPlan && remainingThisMonth > 0 && exams.length > 0 && (
                <button onClick={generatePlan} disabled={planLoading}
                  className="bg-accent hover:bg-accent-hover text-on-accent px-5 py-2.5 rounded-xl text-label-sm font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  {planLoading ? "Generating..." : "Generate Plan"}
                </button>
              )}
              {studyPlan && remainingThisMonth > 0 && exams.length > 0 && (
                <button onClick={() => setShowRegenModal(true)} disabled={planLoading}
                  className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-2.5 rounded-xl text-label-sm font-semibold border border-outline-variant/50 hover:border-outline transition-all disabled:opacity-50 flex items-center gap-2">
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
      <div className="bg-surface-container-lowest rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-outline-variant/30">
        <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
          <h3 className="text-body-md font-semibold text-on-surface">Recent Activity</h3>
          <Link href="/history" className="text-label-sm text-primary font-semibold hover:text-accent transition-colors">View All</Link>
        </div>
        {exams.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-[40px] text-outline mb-3">assignment</span>
            <p className="text-body-md text-on-surface-variant">No exams yet. Start practicing to see your activity here.</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/writing" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-label-sm font-semibold hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">Practice Writing</Link>
              <Link href="/speaking" className="bg-secondary hover:bg-secondary/90 text-on-secondary px-5 py-2.5 rounded-xl text-label-sm font-semibold hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">Practice Speaking</Link>
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

          {/* Goal Setting Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowGoalModal(false)}>
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/50 p-6 md:p-8 max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full bg-primary-fixed/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                </div>
                <h3 className="text-headline-sm font-bold text-on-surface mb-1">Set Your Target Band</h3>
                <p className="text-body-md text-on-surface-variant mb-6">Choose the IELTS band score you're working toward.</p>

                {latestBand != null && (
                  <div className="bg-surface-container-high rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">Current band</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-data-md font-bold text-on-surface">{latestBand.toFixed(1)}</span>
                      <span className="text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">{cefrLevel(latestBand)}</span>
                    </div>
                  </div>
                )}

                {/* Band Picker */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {bandOptions.map((b) => {
                    const selected = parseFloat(goalInput) === b;
                    const isCurrent = latestBand != null && Math.abs(latestBand - b) < 0.1;
                    return (
                      <button
                        key={b}
                        onClick={() => setGoalInput(String(b))}
                        className={`font-mono text-data-md font-bold px-3 py-2 rounded-lg transition-all border-2 min-w-[52px] ${
                          selected
                            ? "bg-primary text-on-primary border-primary shadow-md scale-105"
                            : isCurrent
                              ? "bg-surface-container border-outline text-on-surface-variant"
                              : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary"
                        }`}
                      >
                        {b.toFixed(1)}
                      </button>
                    );
                  })}
                </div>

                {/* CEFR Preview */}
                {goalInput && (
                  <div className="bg-surface-container-high rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-bold text-body-md ${cefrInfo[cefrLevel(parseFloat(goalInput))]?.color || ""}`}>
                        {cefrLevel(parseFloat(goalInput))}
                      </span>
                      <span className="text-label-sm text-on-surface-variant">
                        · {cefrInfo[cefrLevel(parseFloat(goalInput))]?.label || ""}
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant leading-relaxed">
                      {cefrInfo[cefrLevel(parseFloat(goalInput))]?.description || ""}
                    </p>
                  </div>
                )}

                {latestBand != null && parseFloat(goalInput) > latestBand && (
                  <div className="flex items-center gap-2 justify-center text-label-sm text-on-surface-variant mb-6">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>{((latestBand / parseFloat(goalInput)) * 100).toFixed(0)}% of the way there · {((parseFloat(goalInput) - latestBand) * 2).toFixed(0)} half-band improvement needed</span>
                  </div>
                )}
                {latestBand != null && parseFloat(goalInput) <= latestBand && (
                  <div className="flex items-center gap-2 justify-center text-label-sm text-emerald-600 mb-6">
                    <span className="material-symbols-outlined text-[16px]">celebration</span>
                    <span>You've already reached this band! Aim higher.</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-outline-variant text-on-surface text-label-sm font-semibold hover:bg-surface-container transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const v = parseFloat(goalInput);
                      if (v >= 0 && v <= 9) {
                        setTarget(v);
                        localStorage.setItem("ielts_target", String(v));
                      }
                      setShowGoalModal(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Set Target
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
