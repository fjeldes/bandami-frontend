"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuestions, createExam } from "@/lib/api";
import { apiFetch } from "@/lib/api";
import type { Question, Exam } from "@/lib/types";
import { showError } from "@/components/ui/Toast";

const TOTAL_TIME = 600; // 10 minutes

function fmt(s: number) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`; }

export default function ListeningTestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("id");
  const [question, setQuestion] = useState<Question | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!questionId) { setError("No question ID"); setLoading(false); return; }
    getQuestions({ exam_type: "listening" }).then((qs) => {
      const found = qs.find((q) => q.id === questionId);
      if (!found) throw new Error("Question not found");
      setQuestion(found);
      return createExam({ exam_type: "listening", question_id: found.id });
    }).then(setExam).catch((err) => setError(err instanceof Error ? err.message : "Failed")).finally(() => setLoading(false));
  }, [questionId]);

  useEffect(() => {
    if (!exam || submitting) return;
    const i = setInterval(() => setTimeLeft((p) => { if (p <= 1) { handleSubmit(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(i);
  }, [exam, submitting]);

  const handleSubmit = async () => {
    if (!exam || submitting) return;
    const hasAnswers = Object.values(answers).some((a) => a.trim().length > 0);
    if (!hasAnswers) { showError("Please answer at least one question before submitting."); return; }
    setSubmitting(true);
    try {
      const payload = { exam_id: exam.id, answers };
      await apiFetch("/evaluate/listening/", { method: "POST", body: JSON.stringify(payload) });
      router.push(`/listening/results?examId=${exam.id}`);
    } catch (err) { showError(err instanceof Error ? err.message : "Failed"); setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><span className="material-symbols-outlined text-[36px] text-primary animate-spin">progress_activity</span></div>;
  if (error || !question) return <div className="text-center py-16"><p className="text-body-md text-error mb-4">{error}</p><button onClick={() => router.push("/listening")} className="text-primary font-semibold">Back</button></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-sm uppercase">{question.module || "section1"}</span>
          <span className={`font-mono text-data-md font-bold ${timeLeft < 60 ? "text-error animate-pulse" : "text-on-surface"}`}>{fmt(timeLeft)}</span>
        </div>
        <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit Answers"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">headphones</span>
            <div>
              <h2 className="text-headline-md font-bold text-on-surface">{question.title || "Listening Exercise"}</h2>
              <p className="text-label-sm text-on-surface-variant">Read the questions below, then listen carefully.</p>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-4 mb-4 text-body-md text-on-surface whitespace-pre-wrap">{question.prompt_text}</div>
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 text-center">
            <span className="material-symbols-outlined text-primary text-[24px] mb-2">play_circle</span>
            <p className="text-body-md text-on-surface-variant">Audio player will be available in the production version. For now, read the text above and answer the questions.</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 h-fit">
          <h3 className="text-body-md font-semibold text-on-surface mb-4">Your Answers</h3>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-3">
              <label htmlFor={`lq${i}`} className="text-label-sm text-on-surface-variant mb-1 block">Question {i}</label>
              <input id={`lq${i}`} value={answers[`q${i}`] || ""} onChange={(e) => setAnswers((a) => ({ ...a, [`q${i}`]: e.target.value }))}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary"
                placeholder="Your answer..." />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
