"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuestions, getUserExams } from "@/lib/api";
import type { Question, ExamWithEvaluation } from "@/lib/types";

export default function ReadingListPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getQuestions({ exam_type: "reading" }), getUserExams({ limit: 100 })])
      .then(([qs, exams]) => {
        setQuestions(qs);
        const taken = new Set<string>();
        const scoreMap: Record<string, number> = {};
        for (const exam of exams) {
          if (exam.question_id) { taken.add(exam.question_id); const ev = exam.evaluations?.[0]; if (ev?.overall_band != null) { const cur = scoreMap[exam.question_id]; if (cur == null || ev.overall_band > cur) scoreMap[exam.question_id] = ev.overall_band; } }
        }
        setTakenIds(taken); setScores(scoreMap);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><span className="material-symbols-outlined text-[36px] text-primary animate-spin">progress_activity</span></div>;
  if (error) return <div className="text-center py-16"><span className="material-symbols-outlined text-[48px] text-error mb-4">error</span><p className="text-body-md text-error mb-4">{error}</p><button onClick={() => window.location.reload()} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-semibold hover:opacity-90 transition-opacity">Retry</button></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-headline-md font-bold text-on-surface mb-1">Reading Practice</h1>
        <p className="text-body-md text-on-surface-variant max-w-3xl">Select a passage to practice your reading comprehension.</p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3">menu_book</span>
          <p className="text-body-md text-on-surface-variant">No reading passages available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {questions.map((q) => {
            const isTaken = takenIds.has(q.id);
            const bestScore = scores[q.id];
            return (
              <div key={q.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 transition-all hover:shadow-lg hover:border-primary/20 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sm uppercase">{q.module || "general"}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/10 text-primary text-label-sm">Difficulty {q.difficulty}/5</span>
                </div>
                <h3 className="text-body-md font-bold text-on-surface mb-3 flex-grow line-clamp-2">{q.title || "Reading Passage"}</h3>
                <div className="mt-4 pt-4 border-t border-outline-variant/50 flex items-center justify-between">
                  {isTaken && bestScore != null ? (
                    <>
                      <div className="flex items-baseline gap-1"><span className="text-xl font-bold text-primary">{bestScore.toFixed(1)}</span><span className="text-label-sm text-on-surface-variant">Band</span></div>
                      <Link href={`/reading/test?id=${q.id}`} className="px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">Retake</Link>
                    </>
                  ) : (
                    <Link href={`/reading/test?id=${q.id}`} className="w-full text-center px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity">Start Test</Link>
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
