"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuestions, getUserExams } from "@/lib/api";
import type { Question, ExamWithEvaluation } from "@/lib/types";
import { useAuthStore } from "@/hooks/useAuth";
import { redirectToCheckout } from "@/lib/stripe";

export default function SpeakingListPage() {
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.subscription_tier === "premium";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "part1" | "part2" | "part3">("all");

  useEffect(() => {
    Promise.all([getQuestions({ exam_type: "speaking" }), getUserExams({ limit: 100 })])
      .then(([qs, exams]) => {
        setQuestions(qs);
        const taken = new Set<string>();
        const scoreMap: Record<string, number> = {};
        for (const exam of exams) {
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

  const filtered = filter === "all" ? questions : questions.filter((q) => (q.module || "part2") === filter);

  const partLabel: Record<string, string> = {
    part1: "Part 1 · Interview",
    part2: "Part 2 · Long Turn",
    part3: "Part 3 · Discussion",
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface mb-1">Speaking Practice</h1>
            <p className="text-body-md text-on-surface-variant max-w-3xl">
              Practice individual speaking topics or take the full IELTS test.
            </p>
          </div>
          {isPremium ? (
            <Link
              href="/speaking/test"
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Full IELTS Test
            </Link>
          ) : (
            <button
              onClick={() => redirectToCheckout("premium")}
              className="px-5 py-2.5 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Full Test — Premium
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-outline-variant/50 mb-8 overflow-x-auto">
        {(["all", "part1", "part2", "part3"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 text-label-sm whitespace-nowrap transition-colors ${
              filter === f ? "text-primary border-b-2 border-primary font-semibold" : "text-on-surface-variant hover:text-primary"
            }`}>
            {f === "all" ? "All Parts" : partLabel[f] || f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="material-symbols-outlined text-[36px] text-primary animate-spin">progress_activity</span></div>
      ) : error ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
          <p className="text-body-md text-error mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-body-md text-on-surface-variant">No questions found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((q) => {
            const isTaken = takenIds.has(q.id);
            const bestScore = scores[q.id];
            const module = q.module || "part2";

            return (
              <div key={q.id} className="group relative bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/20 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wide">{partLabel[module] || module}</span>
                  </div>
                </div>

                <h3 className="text-body-md font-bold text-on-surface mb-3 group-hover:text-primary transition-colors flex-grow line-clamp-2">
                  {q.title || "Speaking Topic"}
                </h3>

                <div className="mt-4 pt-4 border-t border-outline-variant/50 flex items-center justify-between">
                  {isTaken && bestScore != null ? (
                    <>
                      <div className="flex flex-col">
                        <span className="text-label-sm text-on-surface-variant uppercase tracking-tighter opacity-60">Previous Score</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-primary">{bestScore.toFixed(1)}</span>
                          <span className="text-label-sm text-on-surface-variant">Band</span>
                        </div>
                      </div>
                      <Link
                        href={`/speaking/test?id=${q.id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">mic</span>
                        Retake
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/speaking/test?id=${q.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">mic</span>
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
