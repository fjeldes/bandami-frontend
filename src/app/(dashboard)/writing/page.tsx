"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuestions, getUserExams } from "@/lib/api";
import type { Question, ExamWithEvaluation } from "@/lib/types";

export default function WritingListPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "task1" | "task2">("all");

  useEffect(() => {
    Promise.all([getQuestions({ exam_type: "writing" }), getUserExams({ limit: 100 })])
      .then(([qs, result]) => {
        setQuestions(qs);
        const taken = new Set<string>();
        const scoreMap: Record<string, number> = {};
        for (const exam of result.exams) {
          if (exam.question_id) {
            taken.add(exam.question_id);
            const ev = exam.evaluations?.[0];
            if (ev?.overall_band != null) {
              const cur = scoreMap[exam.question_id];
              if (cur == null || ev.overall_band > cur) scoreMap[exam.question_id] = ev.overall_band;
            }
          }
        }
        setTakenIds(taken);
        setScores(scoreMap);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? questions : questions.filter((q) => q.task_type === filter);

  return (
    <div>
      <div className="mb-10">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Writing Practice</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
          Select a task to begin your writing practice. Choose between Task 1 (Report) and Task 2 (Essay).
        </p>
      </div>

      <div className="flex border-b border-outline-variant/50 mb-10 overflow-x-auto">
        {(["all", "task1", "task2"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-6 py-3 font-label-md text-label-md whitespace-nowrap transition-colors ${
              filter === f ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest"
            }`}>
            {f === "all" ? "All Tasks" : f === "task1" ? "Task 1 (Report)" : "Task 2 (Essay)"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>
      ) : error ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
          <p className="text-body-md text-error mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 font-body-md text-body-md text-on-surface-variant">No questions found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((q, idx) => {
            const isTaken = takenIds.has(q.id);
            const bestScore = scores[q.id];

            return (
              <div key={q.id} className="group relative bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 hover:shadow-lg hover:border-primary/20 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 0.05, 1)}s` }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wide">{q.task_type?.replace("task", "Task ")}</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-container/10 text-primary text-label-sm">{q.module ? q.module.charAt(0).toUpperCase() + q.module.slice(1) : "General"}</span>
                  </div>
                </div>

                <h3 className="text-body-md font-bold text-on-surface mb-3 group-hover:text-primary transition-colors flex-grow line-clamp-2">
                  {q.title || "Writing Task"}
                </h3>

                <div className="mt-4 pt-4 border-t border-outline-variant/50 flex items-center justify-between">
                  {isTaken && bestScore != null ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-primary">{bestScore.toFixed(1)}</span>
                        <span className="text-label-sm text-on-surface-variant">Band</span>
                      </div>
                      <Link
                        href={`/writing/test?id=${q.id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Retake
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/writing/test?id=${q.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Start Test
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
