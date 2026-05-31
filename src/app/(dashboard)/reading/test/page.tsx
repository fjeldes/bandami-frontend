"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuestions, createExam, submitReading } from "@/lib/api";
import type { Question, Exam } from "@/lib/types";
import { showError } from "@/components/ui/Toast";

const TOTAL_TIME = 1200; // 20 minutes

function formatTime(s: number) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`; }

export default function ReadingTestPage() {
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
    getQuestions({ exam_type: "reading" }).then((qs) => {
      const found = qs.find((q) => q.id === questionId);
      if (!found) throw new Error("Question not found");
      setQuestion(found);
      return createExam({ exam_type: "reading", question_id: found.id });
    }).then(setExam).catch((err) => setError(err instanceof Error ? err.message : "Failed")).finally(() => setLoading(false));
  }, [questionId]);

  useEffect(() => {
    if (!exam || submitting) return;
    const interval = setInterval(() => setTimeLeft((p) => { if (p <= 1) { handleSubmit(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(interval);
  }, [exam, submitting]);

  const handleSubmit = async () => {
    if (!exam || submitting) return;
    const hasAnswers = Object.values(answers).some((a) => a.trim().length > 0);
    if (!hasAnswers) { showError("Please answer at least one question before submitting."); return; }
    setSubmitting(true);
    try {
      const payload = { exam_id: exam.id, answers };
      await submitReading(payload);
      router.push(`/reading/results?examId=${exam.id}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><span className="material-symbols-outlined text-[36px] text-primary animate-spin">progress_activity</span></div>;
  if (error || !question) return <div className="text-center py-16"><p className="text-body-md text-error mb-4">{error}</p><button onClick={() => router.push("/reading")} className="text-primary font-semibold">Back</button></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-sm uppercase">{question.module || "general"}</span>
          <span className={`font-mono text-data-md font-bold ${timeLeft < 60 ? "text-error animate-pulse" : "text-on-surface"}`}>{formatTime(timeLeft)}</span>
        </div>
        <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 rounded-full bg-primary text-on-primary text-label-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit Answers"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
          <h2 className="text-headline-md font-bold text-on-surface mb-4">{question.title || "Reading Passage"}</h2>
          <div className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">{question.prompt_text}</div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 h-fit">
          <h3 className="text-body-md font-semibold text-on-surface mb-4">Your Answers</h3>
          <p className="text-label-sm text-on-surface-variant mb-4">Read the passage and answer the questions. The AI will evaluate your comprehension.</p>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-3">
              <label htmlFor={`rq${i}`} className="text-label-sm text-on-surface-variant mb-1 block">Question {i}</label>
              <textarea
                id={`rq${i}`}
                value={answers[`q${i}`] || ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [`q${i}`]: e.target.value }))}
                rows={2}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-2 text-body-md text-on-surface outline-none focus:border-primary resize-none"
                placeholder="Type your answer..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
