"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, BarChart3, Trophy, Edit3, Mic, Clock, AlertTriangle, CheckCircle, ArrowRight, TrendingUp, BookOpen } from "lucide-react";
import { getUserExams, apiFetch } from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import type { ExamWithEvaluation } from "@/lib/types";

function cefrLevel(band: number) {
  if (band >= 8.5) return "C2"; if (band >= 7.0) return "C1"; if (band >= 5.5) return "B2"; if (band >= 4.0) return "B1"; if (band >= 3.0) return "A2"; return "A1";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getBandColors(band: number) {
  if (band >= 8) return { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200", badge: "bg-emerald-100 text-emerald-700" };
  if (band >= 6.5) return { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-200", badge: "bg-blue-100 text-blue-700" };
  if (band >= 5.5) return { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200", badge: "bg-amber-100 text-amber-700" };
  return { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-200", badge: "bg-red-100 text-red-700" };
}

function Sparkline({ points, height = 80, color = "#004ac6" }: { points: number[]; height?: number; color?: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1); const min = Math.min(...points, 0); const range = max - min || 1;
  const w = 300; const h = height; const padX = 4; const padY = 8;
  const xs = points.map((_, i) => padX + (i / (points.length - 1)) * (w - padX * 2));
  const ys = points.map((p) => padY + ((max - p) / range) * (h - padY * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const area = `${path} L ${xs[xs.length - 1]} ${h - padY} L ${xs[0]} ${h - padY} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sparkGrad)`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (<circle key={i} cx={xs[i]} cy={ys[i]} r="3.5" fill={color} className="drop-shadow-sm" />))}
    </svg>
  );
}

function KPICard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub: string; icon: any; color: string }) {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "bg-blue-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", icon: "bg-violet-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "bg-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "bg-amber-100" },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 dark:border-slate-800">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${c.icon} dark:${c.icon?.replace("bg-", "dark:bg-")} flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
    </div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-100 dark:border-slate-800 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2" />
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-1" />
      <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 w-14 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-6 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

function ErrorPatternCard({ pattern }: { pattern: any }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{pattern.type}</span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold ring-1 ring-amber-200">
          <AlertTriangle className="w-3 h-3" />
          {pattern.count}x
        </span>
      </div>
      <div className="space-y-2">
        {pattern.examples.slice(0, 2).map((ex: any, i: number) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <div className="flex-1 p-2 rounded-lg bg-red-50 text-red-700 line-through font-medium">
              {ex.original}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mt-2" />
            <div className="flex-1 p-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
              {ex.corrected}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamRow({ exam }: { exam: ExamWithEvaluation }) {
  const eval_ = exam.evaluations?.[0];
  const band = eval_?.overall_band;
  const isPending = !band && exam.status !== "completed";
  const colors = band != null ? getBandColors(band) : null;
  const Icon = exam.exam_type === "writing" ? Edit3 : Mic;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${band != null ? colors?.bg : "bg-slate-100 dark:bg-slate-800"}`}>
          <Icon className={`w-5 h-5 ${band != null ? colors?.text : "text-slate-400 dark:text-slate-500"}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
            {exam.exam_type}{exam.task_type ? ` Task ${exam.task_type.replace("task", "")}` : ""}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(exam.created_at)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Pending
          </span>
        ) : band != null ? (
          <>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${colors?.badge} font-bold text-sm`}>
              <BarChart3 className="w-4 h-4" />
              {band.toFixed(1)}
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {cefrLevel(band)}
            </span>
          </>
        ) : null}
        <Link
          href={isPending ? `/${exam.exam_type}` : `/${exam.exam_type}/results?examId=${exam.id}`}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
            isPending
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-700 hover:text-white"
          }`}
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.subscription_tier === "premium" || user?.role === "admin";
  const [exams, setExams] = useState<ExamWithEvaluation[]>([]);
  const [errorPatterns, setErrorPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "writing" | "speaking">("all");
  const [listPage, setListPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchExams = () => {
    Promise.all([
      getUserExams({ limit: 100 }),
      isPremium ? apiFetch<{ patterns: any[] }>("/users/me/error-patterns").catch(() => ({ patterns: [] })) : Promise.resolve({ patterns: [] }),
    ]).then(([examResult, patternsResult]) => {
      setExams(examResult.exams);
      setErrorPatterns(patternsResult.patterns);
    }).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExams(); }, []);

  const completed = exams.filter((e) => e.evaluations?.[0]?.overall_band != null && e.status === "completed");
  const bands = completed.map((e) => e.evaluations[0].overall_band!);
  const avgBand = bands.length > 0 ? bands.reduce((a, b) => a + b, 0) / bands.length : null;
  const bestBand = bands.length > 0 ? Math.max(...bands) : null;
  const latestBand = bands.length > 0 ? bands[bands.length - 1] : null;

  const writingExams = completed.filter((e) => e.exam_type === "writing");
  const speakingExams = completed.filter((e) => e.exam_type === "speaking");
  const writingAvg = writingExams.length > 0 ? writingExams.reduce((a, e) => a + e.evaluations[0].overall_band!, 0) / writingExams.length : null;
  const speakingAvg = speakingExams.length > 0 ? speakingExams.reduce((a, e) => a + e.evaluations[0].overall_band!, 0) / speakingExams.length : null;

  const trendPoints = completed.slice(-10).reverse().map((e) => e.evaluations[0].overall_band!);

  const filtered = filter === "all" ? exams : exams.filter((e) => e.exam_type === filter);
  const paginated = filtered.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const filterTabs = [
    { key: "all" as const, label: "All" },
    { key: "writing" as const, label: "Writing" },
    { key: "speaking" as const, label: "Speaking" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-headline-lg font-bold text-slate-800 dark:text-white mb-1">Reports</h1>
          <p className="text-slate-500 dark:text-slate-400">Track your progress, trends, and performance breakdown.</p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <ChartSkeleton />
              </div>
              <ChartSkeleton />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[1, 2, 3, 4, 5].map((i) => <TableRowSkeleton key={i} />)}
              </div>
            </div>
          </>
        ) : error ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-red-500">!</span>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchExams} className="bg-slate-800 dark:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KPICard
                label="Total Exams"
                value={completed.length}
                sub={`${exams.length} total (${exams.length - completed.length} pending)`}
                icon={Activity}
                color="blue"
              />
              <KPICard
                label="Average Band"
                value={avgBand?.toFixed(1) ?? "—"}
                sub={latestBand ? `Latest: ${latestBand.toFixed(1)}` : "No exams yet"}
                icon={TrendingUp}
                color="violet"
              />
              <KPICard
                label="Best Band"
                value={bestBand?.toFixed(1) ?? "—"}
                sub={bestBand ? cefrLevel(bestBand) : "—"}
                icon={Trophy}
                color="amber"
              />
              <KPICard
                label="Writing vs Speaking"
                value={writingAvg && speakingAvg ? `${writingAvg.toFixed(1)} / ${speakingAvg.toFixed(1)}` : "—"}
                sub={`${writingExams.length}W / ${speakingExams.length}S`}
                icon={BarChart3}
                color="emerald"
              />
            </div>

            {/* Error Patterns (Premium) */}
            {isPremium && errorPatterns.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Common Error Patterns</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Focus areas to improve your score</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {errorPatterns.map((p: any) => (
                    <ErrorPatternCard key={p.type} pattern={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Trend + Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Trend Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Band Score Trend</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your recent performance</p>
                  </div>
                  {trendPoints.length >= 2 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Latest: {trendPoints[trendPoints.length - 1].toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {trendPoints.length >= 2 ? (
                  <Sparkline points={trendPoints} height={100} color="#004ac6" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Complete at least 2 exams to see your trend.</p>
                  </div>
                )}
              </div>

              {/* Type Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">By Exam Type</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Writing</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{writingExams.length} exams</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${writingAvg ? (writingAvg / 9) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      {writingAvg ? `Avg: ${writingAvg.toFixed(1)}` : "No data"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Speaking</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{speakingExams.length} exams</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-500"
                        style={{ width: `${speakingAvg ? (speakingAvg / 9) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      {speakingAvg ? `Avg: ${speakingAvg.toFixed(1)}` : "No data"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exam History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Exam History</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} exams found</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 inline-flex">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setFilter(tab.key); setListPage(1); }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        filter === tab.key
                          ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No exams yet. Start practicing to see your reports.</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginated.map((exam) => (
                      <ExamRow key={exam.id} exam={exam} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Page {listPage} of {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setListPage((p) => Math.max(1, p - 1))}
                          disabled={listPage === 1}
                          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>
                        <button
                          onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
                          disabled={listPage >= totalPages}
                          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
