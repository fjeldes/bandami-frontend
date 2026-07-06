"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getUserExams, apiFetch } from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import type { ExamWithEvaluation } from "@/lib/types";

function bandColors(band: number) {
  if (band >= 7.5) return { accent: "border-l-4 border-primary", icon: "bg-primary-fixed text-primary", circle: "border-primary/20 bg-primary-fixed text-primary", cefr: "bg-primary-fixed text-on-primary-fixed-variant" };
  if (band >= 6) return { accent: "border-l-4 border-secondary-container", icon: "bg-secondary-fixed/50 text-secondary-container", circle: "border-secondary-container/30 bg-secondary-fixed/50 text-secondary-container", cefr: "bg-secondary-fixed/50 text-secondary-container" };
  if (band >= 5) return { accent: "border border-outline-variant/30", icon: "bg-surface-container-high text-on-surface-variant", circle: "border-outline-variant/30 bg-surface-container text-on-surface-variant", cefr: "bg-surface-container text-on-surface-variant" };
  return { accent: "border-l-4 border-error", icon: "bg-error-container text-error", circle: "border-error/30 bg-error-container text-error", cefr: "bg-error-container text-error" };
}

function cefrLevel(band: number) {
  if (band >= 8.5) return "C2"; if (band >= 7.0) return "C1"; if (band >= 5.5) return "B2"; if (band >= 4.0) return "B1"; if (band >= 3.0) return "A2"; return "A1";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function Sparkline({ points, height = 60, color = "#004f35" }: { points: number[]; height?: number; color?: string }) {
  if (points.length < 2) return <div className="flex items-center justify-center text-label-sm text-on-surface-variant/50" style={{ height }}>Not enough data</div>;
  const max = Math.max(...points, 1); const min = Math.min(...points, 0); const range = max - min || 1;
  const w = 200; const h = height; const padY = 6;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((p) => padY + ((max - p) / range) * (h - padY * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (<circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill={color} />))}
    </svg>
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
  const bands = completed.map((e) => e.evaluations[0].overall_band);
  const avgBand = bands.length > 0 ? bands.reduce((a, b) => a + b, 0) / bands.length : null;
  const bestBand = bands.length > 0 ? Math.max(...bands) : null;
  const latestBand = bands.length > 0 ? bands[0] : null;

  const writingExams = completed.filter((e) => e.exam_type === "writing");
  const speakingExams = completed.filter((e) => e.exam_type === "speaking");
  const writingAvg = writingExams.length > 0 ? writingExams.reduce((a, e) => a + e.evaluations[0].overall_band, 0) / writingExams.length : null;
  const speakingAvg = speakingExams.length > 0 ? speakingExams.reduce((a, e) => a + e.evaluations[0].overall_band, 0) / speakingExams.length : null;

  const trendPoints = completed.slice(0, 10).reverse().map((e) => e.evaluations[0].overall_band);

  const filtered = filter === "all" ? exams : exams.filter((e) => e.exam_type === filter);
  const paginated = filtered.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-headline-md font-bold text-on-surface mb-1">Reports</h1>
        <p className="text-label-sm text-on-surface-variant">Track your progress, trends, and performance breakdown.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>
      ) : error ? (
        <div className="text-center py-16"><p className="text-body-lg text-error mb-4">{error}</p><button onClick={fetchExams} className="text-primary font-semibold">Retry</button></div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Exams", value: completed.length, icon: "assignment", sub: `${exams.length} total (incl. pending)` },
              { label: "Average Band", value: avgBand?.toFixed(1) ?? "—", icon: "trending_up", sub: latestBand ? `Latest: ${latestBand.toFixed(1)}` : "No exams yet" },
              { label: "Best Band", value: bestBand?.toFixed(1) ?? "—", icon: "emoji_events", sub: bestBand ? `CEFR ${cefrLevel(bestBand)}` : "—" },
              { label: "Writing vs Speaking", value: writingAvg && speakingAvg ? `W ${writingAvg.toFixed(1)} · S ${speakingAvg.toFixed(1)}` : "—", icon: "compare_arrows", sub: writingExams.length + speakingExams.length > 0 ? `${writingExams.length}W / ${speakingExams.length}S` : "No data" },
            ].map((s) => (
              <div key={s.label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">{s.icon}</span>
                  <span className="text-label-sm text-on-surface-variant">{s.label}</span>
                </div>
                <p className="text-headline-md font-bold text-on-surface mb-1">{s.value}</p>
                <p className="text-label-sm text-on-surface-variant">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Error Patterns (Premium) */}
          {isPremium && errorPatterns.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5 mb-5">
              <h3 className="text-body-md font-semibold text-on-surface mb-4">Common Error Patterns</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {errorPatterns.map((p: any) => (
                  <div key={p.type} className="bg-error-container/10 rounded-lg p-3 border border-error-container/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-label-sm font-semibold text-on-surface">{p.type}</span>
                      <span className="font-mono text-xs font-bold text-error px-2 py-0.5 rounded-full bg-error-container/30">{p.count}x</span>
                    </div>
                    {p.examples.slice(0, 2).map((ex: any, i: number) => (
                      <div key={i} className="text-label-sm mt-1">
                        <span className="text-error line-through">{ex.original}</span>
                        <span className="text-on-surface-variant"> → </span>
                        <span className="text-emerald-700">{ex.corrected}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Band Trend + Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
              <h3 className="text-body-md font-semibold text-on-surface mb-4">Band Score Trend</h3>
              {trendPoints.length >= 2 ? (
                <div>
                  <Sparkline points={trendPoints} height={80} />
                  <div className="flex justify-between mt-2 text-label-sm text-on-surface-variant">
                    <span>Oldest</span>
                    <span>Latest</span>
                  </div>
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant/50 py-4 text-center">Complete at least 2 exams to see your trend.</p>
              )}
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
              <h3 className="text-body-md font-semibold text-on-surface mb-4">By Exam Type</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-label-sm mb-1"><span className="text-on-surface-variant">Writing</span><span className="font-semibold text-on-surface">{writingExams.length} exams</span></div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: writingAvg ? `${(writingAvg / 9) * 100}%` : "0%" }} />
                  </div>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">{writingAvg ? `Avg Band ${writingAvg.toFixed(1)}` : "No data"}</p>
                </div>
                <div>
                  <div className="flex justify-between text-label-sm mb-1"><span className="text-on-surface-variant">Speaking</span><span className="font-semibold text-on-surface">{speakingExams.length} exams</span></div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: speakingAvg ? `${(speakingAvg / 9) * 100}%` : "0%" }} />
                  </div>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">{speakingAvg ? `Avg Band ${speakingAvg.toFixed(1)}` : "No data"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exam List */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm">
            <div className="p-5 border-b border-outline-variant/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-body-md font-semibold text-on-surface">Exam History</h3>
              <div className="flex gap-1.5">
                {(["all", "writing", "speaking"] as const).map((f) => (
                  <button key={f} onClick={() => { setFilter(f); setListPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-label-sm font-semibold transition-colors ${filter === f ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"}`}>
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-[40px] text-outline mb-3">analytics</span>
                <p className="text-body-md text-on-surface-variant">No exams yet. Start practicing to see your reports.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-outline-variant/30">
                  {paginated.map((exam, idx) => {
                    const eval_ = exam.evaluations?.[0];
                    const band = eval_?.overall_band;
                    const isVisible = eval_?.is_feedback_visible;
                    const isPending = !band && exam.status !== "completed";
                    const colors = band != null ? bandColors(band) : { accent: "border border-outline-variant/30", icon: "bg-surface-container text-on-surface-variant", circle: "", cefr: "" };
                    return (
                      <div key={exam.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 hover:bg-surface-container-low transition-colors ${isPending ? "opacity-50" : ""}`}>
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${colors.icon}`}>
                            <span className="material-symbols-outlined text-[18px]">{exam.exam_type === "writing" ? "edit" : "mic"}</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-body-md font-semibold text-on-surface capitalize">{exam.exam_type}{exam.task_type ? ` Task ${exam.task_type.replace("task", "")}` : ""}</h4>
                            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant flex-wrap mt-0.5">
                              <span>{formatDate(exam.created_at)}</span>
                              
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-9 md:ml-0">
                          {isPending ? (
                            <span className="text-label-sm text-on-surface-variant capitalize flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">progress_activity</span>{exam.status}</span>
                          ) : band != null ? (
                            <div className="flex items-center gap-2">
                              <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border-3 ${colors.circle}`}><span className="font-mono text-sm font-bold">{band.toFixed(1)}</span></div>
                              <span className={`text-label-sm font-bold px-2 py-0.5 rounded ${colors.cefr}`}>{cefrLevel(band)}</span>
                            </div>
                          ) : null}
                          <Link href={`/${exam.exam_type}/results?examId=${exam.id}`} className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                            <span className="material-symbols-outlined">chevron_right</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/40">
                    <span className="text-label-sm text-on-surface-variant">{filtered.length} exams</span>
                    <div className="flex gap-1">
                      <button onClick={() => setListPage((p) => Math.max(1, p - 1))} disabled={listPage === 1} className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>
                      <span className="flex items-center px-2 text-label-sm text-on-surface-variant">{listPage}/{totalPages}</span>
                      <button onClick={() => setListPage((p) => Math.min(totalPages, p + 1))} disabled={listPage >= totalPages} className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
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
  );
}
