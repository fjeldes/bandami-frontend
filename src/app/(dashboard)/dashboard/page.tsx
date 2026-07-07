"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import { useDashboardStats, useExams, useStudyPlan, useGenerateStudyPlan, useToggleStudyPlanDay } from "@/hooks/useApi";
import { showError } from "@/components/ui/Toast";
import {
  PenTool, Mic, BarChart3, TrendingUp, Sparkles, BookOpen, CalendarDays,
  CheckCircle, ArrowRight, Target, Flag, X, ChevronLeft, ChevronRight,
  Flame, Clock, Check, RefreshCw, Lightbulb, Star, Award
} from "lucide-react";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`} />;
}

function Sparkline({ points, height = 80, color = "#3b82f6" }: { points: number[]; height?: number; color?: string }) {
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
        <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill={color} />
      ))}
    </svg>
  );
}

function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: PenTool, title: "Writing Practice", desc: "Submit essays and get band scores with detailed feedback on all 4 marking criteria.", color: "blue" },
    { icon: Mic, title: "Speaking Practice", desc: "Record your voice answering IELTS-style questions. Get evaluated on fluency, pronunciation, and more.", color: "purple" },
    { icon: BarChart3, title: "Track Progress", desc: "Your history shows every exam with band scores. Watch your improvement over time.", color: "indigo" },
    { icon: Sparkles, title: "Unlimited Practice", desc: "Practice as much as you want. Upgrade to Pro for detailed feedback and full access.", color: "amber" },
  ];

  const s = steps[step];
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-100 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
    purple: { bg: "bg-purple-100 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
    indigo: { bg: "bg-indigo-100 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    amber: { bg: "bg-amber-100 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full text-center relative">
        <button onClick={onDismiss} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <X className="w-5 h-5" />
        </button>
        <div className={`w-16 h-16 rounded-2xl ${colorMap[s.color].bg} flex items-center justify-center mx-auto mb-4`}>
          <s.icon className={`w-8 h-8 ${colorMap[s.color].text}`} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{s.desc}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-blue-600 dark:bg-blue-400" : "bg-slate-200 dark:bg-slate-700"}`} />
            ))}
          </div>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-opacity">
              Next
            </button>
          ) : (
            <button onClick={onDismiss} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-opacity">
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
    A1: { label: "Beginner", description: "Can understand and use basic phrases.", color: "text-red-500 dark:text-red-400" },
    A2: { label: "Elementary", description: "Can communicate in simple, routine tasks.", color: "text-orange-500 dark:text-orange-400" },
    B1: { label: "Intermediate", description: "Can handle everyday situations and express opinions.", color: "text-yellow-600 dark:text-yellow-500" },
    B2: { label: "Upper Intermediate", description: "Can interact fluently on familiar topics.", color: "text-lime-600 dark:text-lime-500" },
    C1: { label: "Advanced", description: "Can express ideas fluently and spontaneously.", color: "text-emerald-600 dark:text-emerald-500" },
    C2: { label: "Proficient", description: "Can understand virtually everything with ease.", color: "text-blue-600 dark:text-blue-400" },
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
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-blue-600 dark:text-blue-400 font-semibold">Retry</button>
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

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stats?.total_exams ? `${stats.total_exams} exams completed` : "Start practicing to see your stats"}
              </p>
              {streak > 1 && (
                <span className="text-sm text-orange-500 dark:text-orange-400 font-semibold flex items-center gap-1">
                  <Flame className="w-4 h-4" /> {streak}-day streak
                </span>
              )}
              {totalTime !== "" && (
                <span className="text-sm text-slate-500 dark:text-slate-400">· {totalTime}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {target != null && (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Target</span>
                  <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">Band {target.toFixed(1)}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{cefrLevel(target)}</span>
                </div>
                {latestBand != null && (
                  <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {target > latestBand ? `${((latestBand / target) * 100).toFixed(0)}%` : "🎯 Goal met!"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {target > latestBand ? `Gap: ${(target - latestBand).toFixed(1)}` : ""}
                        </span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all" style={{ width: `${Math.min(100, (latestBand / target) * 100)}%` }} />
                      </div>
                    </div>
                    <button onClick={() => { setTarget(null); localStorage.removeItem("ielts_target"); }} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {latestBand == null && (
                  <button onClick={() => { setTarget(null); localStorage.removeItem("ielts_target"); }} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            {target == null && (
              <button onClick={() => { setGoalInput(latestBand ? String(Math.min(9, latestBand + 1)) : "7.0"); setShowGoalModal(true); }}
                className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-2 rounded-lg transition-all font-semibold">
                <Target className="w-4 h-4" />
                Set Goal
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Award, label: "Average Band", value: stats?.average_band ? stats.average_band.toFixed(1) : "--", sub: stats?.average_band ? `CEFR ${cefrLevel(stats.average_band)}` : "--", color: "blue" },
          { icon: TrendingUp, label: "Best", value: bestBand ? bestBand.toFixed(1) : "--", sub: "Highest score", color: "emerald" },
          { icon: Sparkles, label: "Progress", value: target && latestBand ? `${((latestBand / target) * 100).toFixed(0)}%` : "--", sub: target ? `to Band ${target.toFixed(1)}` : "Set goal ↑", color: "indigo" },
        ].map((c, idx) => (
          <div key={c.label} className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${0.1 + idx * 0.08}s` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                c.color === "blue" ? "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                c.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              }`}>
                <c.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</span>
            </div>
            <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white mb-1">{c.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Band Score Trend</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                <span className="text-slate-500 dark:text-slate-400">Writing</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                <span className="text-slate-500 dark:text-slate-400">Speaking</span>
              </span>
            </div>
          </div>
          {writingBands.length < 2 && speakingBands.length < 2 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Complete a few exams to see your trend.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {writingBands.length >= 2 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Writing</span>
                    <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{writingBands[writingBands.length - 1].b.toFixed(1)}</span>
                  </div>
                  <div className="h-24 bg-gradient-to-b from-blue-50 dark:from-blue-500/5 to-transparent rounded-xl p-2 -mx-2">
                    <Sparkline points={writingBands.map((w) => w.b)} height={80} color="#3b82f6" />
                  </div>
                </div>
              )}
              {speakingBands.length >= 2 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Speaking</span>
                    <span className="font-mono text-lg font-bold text-cyan-600 dark:text-cyan-400">{speakingBands[speakingBands.length - 1].b.toFixed(1)}</span>
                  </div>
                  <div className="h-24 bg-gradient-to-b from-cyan-50 dark:from-cyan-500/5 to-transparent rounded-xl p-2 -mx-2">
                    <Sparkline points={speakingBands.map((s) => s.b)} height={80} color="#06b6d4" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">This Week</h3>
            {daysThisWeek.every((d) => d.count === 0) ? (
              <div className="text-center py-4">
                <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No activity yet this week. Start practicing!</p>
              </div>
            ) : (
              <div className="flex items-end gap-2 h-24 px-2">
                {daysThisWeek.map((d, i) => {
                  const maxH = 72;
                  const barH = d.count > 0 ? Math.min(Math.max(8, d.count * 24), maxH) : 4;
                  return (
                    <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end h-full">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.count}
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 hover:brightness-110 ${d.count > 0 ? "bg-blue-600 dark:bg-blue-400" : "bg-slate-200 dark:bg-slate-700"}`}
                          style={{ height: `${barH}px`, opacity: d.count > 0 ? undefined : 0.4 }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {weakCriteria.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 dark:from-blue-500/10 to-white dark:to-slate-900 rounded-2xl border border-blue-200 dark:border-blue-500/20 p-5 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Focus Areas</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Based on your last evaluation</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {weakCriteria.map((c) => (
                  <span key={c} className="capitalize bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs px-3 py-1.5 rounded-lg font-medium">{c}</span>
                ))}
              </div>
              <Link href={lastEval?.exam_type === "speaking" ? "/speaking" : "/writing"} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
                Practice now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { href: "/writing", icon: PenTool, label: "Writing", sub: `${stats?.writing_exams ?? 0} completed`, accent: "blue" },
          { href: "/speaking", icon: Mic, label: "Speaking", sub: `${stats?.speaking_exams ?? 0} completed`, accent: "purple" },
          { href: "/reading", icon: BookOpen, label: "Reading", sub: "Coming soon", comingSoon: true },
          { href: "/history", icon: BarChart3, label: "Reports", sub: "Review past exams", accent: "blue" },
        ].map((a) => (
          a.comingSoon ? (
            <div key={a.href} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm opacity-50 cursor-default select-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <a.icon className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{a.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{a.sub}</p>
                </div>
              </div>
            </div>
          ) : (
            <Link key={a.href} href={a.href} className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                  a.accent === "blue" ? "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                  "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                }`}>
                  <a.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{a.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{a.sub}</p>
                </div>
              </div>
            </Link>
          )
        ))}
      </div>

      {isPremium && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">7-Day Study Plan</h3>
                {studyPlan && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {studyPlan.filter((d: any) => d.completed).length}/{studyPlan.length} days completed
                    <span className="mx-2">·</span>
                    {remainingThisMonth}/4 plans this month
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!studyPlan && remainingThisMonth > 0 && exams.length > 0 && (
                <button onClick={generatePlan} disabled={planLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {planLoading ? "Generating..." : "Generate Plan"}
                </button>
              )}
              {studyPlan && remainingThisMonth > 0 && exams.length > 0 && (
                <button onClick={() => setShowRegenModal(true)} disabled={planLoading}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              )}
            </div>
          </div>

          {studyPlan && studyPlan.length > 0 && (
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${(studyPlan.filter((d: any) => d.completed).length / studyPlan.length) * 100}%` }}
              />
            </div>
          )}

          {planMessage && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{planMessage}</p>}
          {studyPlan && studyPlan.length > 0 && (
            <div className="space-y-2">
              {studyPlan.map((item: any, i: number) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  item.completed ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20" : "bg-slate-50 dark:bg-slate-800"
                }`}>
                  <button
                    onClick={() => toggleDay(item.day)}
                    className={`w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center transition-all border-2 ${
                      item.completed
                        ? "bg-blue-600 dark:bg-blue-400 border-blue-600 dark:border-blue-400 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-blue-600 dark:hover:border-blue-400"
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className={item.completed ? "opacity-50" : ""}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{
                        item.day
                      }</span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.focus}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-8">{item.task}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!studyPlan && remainingThisMonth <= 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
              You&apos;ve used all 4 plans this month. New plans unlock next month.
            </p>
          )}
          {!studyPlan && exams.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
              Complete at least one exam to generate a study plan.
            </p>
          )}
        </div>
      )}

      {showRegenModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Regenerate Study Plan?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              You have <strong>{remainingThisMonth} of 4 plans</strong> remaining this month.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Your current plan will be replaced.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegenModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowRegenModal(false); generatePlan(); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all"
              >
                Yes, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
          <Link href="/history" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">View All</Link>
        </div>
        {exams.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No exams yet. Start practicing to see your activity here.</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/writing" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all">Practice Writing</Link>
              <Link href="/speaking" className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all">Practice Speaking</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {exams.slice().reverse().slice((activityPage - 1) * ACTIVITY_PAGE_SIZE, activityPage * ACTIVITY_PAGE_SIZE).map((exam) => {
                const ev = exam.evaluations?.[0] || (exam as any).evaluations;
                const band = ev?.overall_band;
                return (
                  <div key={exam.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {exam.exam_type === "writing" ? (
                      <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Mic className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-white truncate capitalize">{exam.exam_type} {exam.task_type ? `Task ${exam.task_type.replace("task", "")}` : ""}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(exam.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="text-right">
                      {band != null ? (
                        <Link href={`/${exam.exam_type}/results?examId=${exam.id}`} className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">{band.toFixed(1)}</Link>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{exam.status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {exams.length > ACTIVITY_PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {((activityPage - 1) * ACTIVITY_PAGE_SIZE) + 1}–{Math.min(activityPage * ACTIVITY_PAGE_SIZE, exams.length)} of {exams.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                    disabled={activityPage === 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-default"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => setActivityPage((p) => Math.min(Math.ceil(exams.length / ACTIVITY_PAGE_SIZE), p + 1))}
                    disabled={activityPage * ACTIVITY_PAGE_SIZE >= exams.length}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-default"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
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
