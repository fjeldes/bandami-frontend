"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuestions, createWritingExam, submitWritingEvaluation } from "@/lib/api";
import { showError } from "@/components/ui/Toast";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import type { Question, Exam } from "@/lib/types";

const TASK_TIMES: Record<string, number> = { task1: 20 * 60, task2: 40 * 60 };
const TIMER_DEFAULT = 40 * 60;

type Phase = "writing" | "submitting" | "done";

export default function WritingTestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("id");

  const [question, setQuestion] = useState<Question | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIMER_DEFAULT);
  const [phase, setPhase] = useState<Phase>("writing");
  const [error, setError] = useState("");
  const [showInterruptedBanner, setShowInterruptedBanner] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for interrupted previous session
    if (typeof window !== "undefined" && localStorage.getItem("writing_test_in_progress")) {
      setShowInterruptedBanner(true);
    }
  }, []);

  useEffect(() => {
    if (!questionId) return;
    getQuestions({ exam_type: "writing" })
      .then((questions) => {
        const found = questions.find((q) => q.id === questionId);
        if (!found) throw new Error("Question not found");
        setQuestion(found);
        setTimeLeft(TASK_TIMES[found.task_type || ""] || TIMER_DEFAULT);
        return createWritingExam({ exam_type: "writing", task_type: found.task_type, question_id: found.id });
      })
      .then((newExam) => {
        setExam(newExam);
        if (typeof window !== "undefined") {
          localStorage.setItem("writing_test_in_progress", JSON.stringify({ examId: newExam.id, startedAt: Date.now() }));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [questionId]);

  useEffect(() => {
    if (!exam) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [exam]);

  const handleSubmit = useCallback(async () => {
    if (!exam || !text.trim()) return;
    setPhase("submitting");
    setError("");

    try {
      await submitWritingEvaluation({ exam_id: exam.id, text: text.trim() });
      if (typeof window !== "undefined") localStorage.removeItem("writing_test_in_progress");
      router.push(`/writing/results?examId=${exam.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
        setError("provider_overloaded");
      } else {
        setError(msg);
      }
      setPhase("writing");
    }
  }, [exam, text, router]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // === LOADING / ERROR STATES ===
  if (error && !question) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
        <p className="font-body-lg text-body-lg text-error mb-4">{error}</p>
        <button onClick={() => router.push("/writing")} className="text-primary font-semibold hover:underline">Back to Writing</button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center py-20"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>
    );
  }

  // === SUBMITTING SCREEN ===
  if (phase === "submitting") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 max-w-[720px] mx-auto pt-8 md:pt-12">
        <div className="ds-card p-10 md:p-14 flex flex-col items-center w-full">
          <div className="relative w-[120px] h-[120px] mb-10">
            <div className="absolute inset-0 rounded-full bg-primary-container animate-pulse-ring" style={{ animationDelay: "0s" }} />
            <div className="absolute inset-0 rounded-full bg-primary-container animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
            <div className="absolute inset-[25%] rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-dot z-10" style={{ boxShadow: "0 0 25px rgba(0, 105, 72, 0.3)" }}>
              <span className="material-symbols-outlined text-on-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>article</span>
            </div>
          </div>
          <h1 className="text-headline-lg font-bold text-primary mb-4">Analyzing your essay...</h1>
          <p className="text-body-md text-on-surface-variant max-w-md mb-10">
            Our AI is evaluating Task Response, Coherence, Vocabulary, and Grammar. This usually takes 15-30 seconds.
          </p>
          <div className="flex items-end justify-center gap-1.5 h-10 mb-10">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="w-1 bg-primary-container rounded-full" style={{ animation: "waveformBar 1.2s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-label-sm text-on-surface-variant">{wordCount} words submitted</p>
        </div>
        {error === "provider_overloaded" ? (
          <div className="mt-6 bg-error-container/30 border border-error/20 rounded-xl p-5 w-full max-w-md">
            <p className="text-body-md text-error mb-3">The AI evaluation service is temporarily unavailable. This happens when many users are practicing at the same time. Your work is safe — please try again in a moment.</p>
            <button onClick={handleSubmit} className="bg-accent text-on-accent hover:bg-accent-hover hover:-translate-y-0.5 text-label-sm font-semibold px-5 py-2.5 rounded-lg transition-opacity">Retry</button>
          </div>
        ) : error ? (
          <div className="mt-6 bg-error-container/30 border border-error/20 rounded-xl p-5 w-full max-w-md">
            <p className="text-body-md text-error mb-3">{error}</p>
            <button onClick={handleSubmit} className="bg-accent text-on-accent hover:bg-accent-hover hover:-translate-y-0.5 text-label-sm font-semibold px-5 py-2.5 rounded-lg transition-opacity">Retry</button>
          </div>
        ) : null}
      </div>
    );
  }

  // === WRITING SCREEN ===
  return (
    <div className="pt-4 md:pt-6">
      {showInterruptedBanner && (
        <div className="mb-4 bg-warning-container/30 border border-warning/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined text-warning shrink-0 mt-0.5">warning</span>
          <div className="flex-1">
            <p className="text-body-md text-on-surface font-semibold">Previous session interrupted</p>
            <p className="text-label-sm text-on-surface-variant">Your last writing test didn&apos;t finish. A new session has been created.</p>
          </div>
          <button
            onClick={() => { setShowInterruptedBanner(false); if (typeof window !== "undefined") localStorage.removeItem("writing_test_in_progress"); }}
            className="p-1 hover:bg-surface-container rounded-lg transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[60vh] md:h-[calc(100dvh-9rem)]">
      <div className="lg:w-1/2 ds-card overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm tracking-wide uppercase">{question.task_type?.replace("task", "Task ")}</span>
            <span className="px-3 py-1 rounded-full bg-primary-container/10 text-primary font-label-sm text-label-sm tracking-wide uppercase">{question.module || "general"}</span>
          </div>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{question.title || "Writing Prompt"}</h2>
        {question.img_url && (
          <img src={question.img_url} alt="Question visual" className="w-full max-h-96 object-contain rounded-lg border border-outline-variant mb-4" />
        )}
        <RichTextRenderer content={question.prompt_text} className="font-body-md text-body-md text-on-surface-variant leading-relaxed" />
        <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Tips</p>
          <ul className="font-label-md text-label-md text-on-surface-variant space-y-1 list-disc pl-4">
            <li>Write at least {question.task_type === "task1" ? "150" : "250"} words</li>
            <li>Plan your response before writing</li>
            <li>Leave time to review your answer</li>
          </ul>
        </div>
      </div>

      <div className="lg:w-1/2 flex flex-col gap-4">
        <div className="ds-card">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-outline text-[20px]">timer</span>
            <span className={`font-mono text-data-lg ${timeLeft < 300 ? "text-error" : "text-on-surface"}`}>{formatTime(timeLeft)}</span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant">{wordCount} words</span>
        </div>

        <textarea
          aria-label="Writing response"
          className="flex-1 w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 font-body-md text-body-md text-on-surface resize-none focus:border-primary/40 focus:ring-0 outline-none ghost-shadow placeholder:text-on-surface-variant/50"
          placeholder="Start writing your response here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {error && (
          <div className="bg-error-container/30 border border-error/20 rounded-xl p-4">
            <p className="font-label-md text-label-md text-error">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!text.trim()}
          className="w-full bg-accent text-on-accent hover:bg-accent-hover hover:-translate-y-0.5 font-label-md text-label-md py-3.5 rounded-full active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">send</span>
          Submit for Evaluation
        </button>
      </div>
    </div>
    </div>
  );
}
