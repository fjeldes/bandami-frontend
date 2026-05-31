"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserExams } from "@/lib/api";
import type { ExamWithEvaluation } from "@/lib/types";

function bandColors(band: number) {
  if (band >= 7.5) {
    return {
      accent: "border-l-4 border-primary",
      icon: "bg-primary-fixed text-primary",
      circle: "border-primary/20 bg-primary-fixed text-primary",
      cefr: "bg-primary-fixed text-on-primary-fixed-variant",
    };
  }
  if (band >= 6) {
    return {
      accent: "border-l-4 border-secondary-container",
      icon: "bg-secondary-fixed/50 text-secondary-container",
      circle: "border-secondary-container/30 bg-secondary-fixed/50 text-secondary-container",
      cefr: "bg-secondary-fixed/50 text-secondary-container",
    };
  }
  if (band >= 5) {
    return {
      accent: "border border-outline-variant/30",
      icon: "bg-surface-container-high text-on-surface-variant",
      circle: "border-outline-variant/30 bg-surface-container text-on-surface-variant",
      cefr: "bg-surface-container text-on-surface-variant",
    };
  }
  return {
    accent: "border-l-4 border-error",
    icon: "bg-error-container text-error",
    circle: "border-error/30 bg-error-container text-error",
    cefr: "bg-error-container text-error",
  };
}

function cefrLevel(band: number) {
  if (band >= 8.5) return "C2";
  if (band >= 7.0) return "C1";
  if (band >= 5.5) return "B2";
  if (band >= 4.0) return "B1";
  if (band >= 3.0) return "A2";
  return "A1";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function HistoryPage() {
  const [exams, setExams] = useState<ExamWithEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "writing" | "speaking">("all");

  const fetchExams = () => {
    getUserExams({ limit: 50 })
      .then(setExams)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExams(); }, []);

  const filtered =
    filter === "all" ? exams : exams.filter((e) => e.exam_type === filter);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-headline-md font-bold text-on-surface mb-1">Exam History</h1>
        <p className="text-label-sm text-on-surface-variant">Review your past performance and track improvements.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex gap-1.5">
          {(["all", "writing", "speaking"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-label-sm font-semibold transition-colors ${
                filter === f
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-body-lg text-error mb-4">{error}</p>
          <button onClick={fetchExams} className="text-primary font-semibold">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3">history</span>
          <p className="text-body-lg text-on-surface-variant">No exams yet.</p>
          <p className="text-body-md text-on-surface-variant/70">Start practicing to see your history here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((exam) => {
            const eval_ = exam.evaluations?.[0];
            const band = eval_?.overall_band;
            const isVisible = eval_?.is_feedback_visible;
            const unlockDate = eval_?.feedback_unlocks_at;
            const isPending = !band && exam.status !== "completed";
            const isLocked = band != null && !isVisible;
            const colors = band != null ? bandColors(band) : { accent: "border border-outline-variant/30", icon: "bg-surface-container text-on-surface-variant", circle: "", cefr: "" };

            return (
              <div
                key={exam.id}
                className={`bg-surface-container-lowest rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 ${colors.accent} ${isPending ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${colors.icon}`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {exam.exam_type === "writing" ? "edit" : "mic"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-body-md font-semibold text-on-surface capitalize">
                      {exam.exam_type}
                      {exam.task_type ? ` Task ${exam.task_type.replace("task", "")}` : ""}
                    </h3>
                    <div className="flex items-center gap-3 text-label-sm text-on-surface-variant flex-wrap mt-1">
                      <span>{formatDate(exam.created_at)}</span>
                      {eval_?.provider_used && (
                        <>
                          <span className="opacity-40">·</span>
                          <span className={`px-2 py-0.5 rounded border ${
                            eval_.provider_used === "openai"
                              ? "bg-secondary-container/10 text-secondary-container border-secondary-container/20"
                              : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                          }`}>
                            {eval_.provider_used === "openai" ? "GPT-4o" : "Gemini"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isPending ? (
                    <div className="flex items-center gap-2 bg-surface-container py-2 px-4 rounded-lg">
                      <span className="material-symbols-outlined text-outline text-[18px]">progress_activity</span>
                      <span className="text-label-sm text-on-surface-variant capitalize">{exam.status}</span>
                    </div>
                  ) : isLocked ? (
                    <div className="flex items-center gap-2 bg-surface-container py-2 px-4 rounded-lg">
                      <span className="material-symbols-outlined text-outline text-[18px]">lock</span>
                      <span className="text-label-sm text-on-surface-variant">
                        {unlockDate ? `Unlocks ${formatDate(unlockDate)}` : "Upgrade to unlock"}
                      </span>
                    </div>
                  ) : band != null ? (
                    <div className="flex items-center gap-2.5">
                      <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-4 ${colors.circle}`}>
                        <span className="font-mono text-sm font-bold">{band.toFixed(1)}</span>
                      </div>
                      <span className={`text-label-sm font-bold px-2 py-0.5 rounded-md ${colors.cefr}`}>
                        {cefrLevel(band)}
                      </span>
                    </div>
                  ) : null}

                  <Link
                    href={`/${exam.exam_type}/results?examId=${exam.id}`}
                    className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
