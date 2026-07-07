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
            <button onClick={handleSubmit} className="bg-primary text-on-primary text-label-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">Retry</button>
          </div>
        ) : error ? (
          <div className="mt-6 bg-error-container/30 border border-error/20 rounded-xl p-5 w-full max-w-md">
            <p className="text-body-md text-error mb-3">{error}</p>
            <button onClick={handleSubmit} className="bg-primary text-on-primary text-label-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">Retry</button>
          </div>
        ) : null}
      </div>
    );
  }

  // === WRITING SCREEN ===
  return (
    <div className="pt-4 md:pt-6 max-w-[1400px] mx-auto px-4">
      {showInterruptedBanner && (
        <div className="mb-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 animate-fade-in-up shadow-sm">
          <span className="material-symbols-outlined text-amber-500 shrink-0 mt-0.5">info</span>
          <div className="flex-1">
            <p className="text-body-md text-amber-800 dark:text-amber-300 font-semibold">Session interrupted</p>
            <p className="text-label-sm text-amber-600 dark:text-amber-400">Your last writing test didn&apos;t finish. A new session has been created.</p>
          </div>
          <button
            onClick={() => { setShowInterruptedBanner(false); if (typeof window !== "undefined") localStorage.removeItem("writing_test_in_progress"); }}
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-lg transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-amber-500">close</span>
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[60vh] md:h-[calc(100dvh-9rem)]">

        {/* LEFT PANEL — Prompt & Instructions */}
        <div className="lg:w-1/2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700/50 p-6 md:p-8 overflow-y-auto shadow-sm">
          <div className="flex items-center flex-wrap gap-2 mb-5">
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-label-sm tracking-wide uppercase">
              {question.task_type?.replace("task", "Task ")}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-label-sm tracking-wide uppercase">
              {question.module || "general"}
            </span>
          </div>

          <h1 className="text-headline-lg font-extrabold text-slate-800 dark:text-white mb-5 leading-tight">
            {question.title || "Writing Prompt"}
          </h1>

          {question.img_url && (
            <img src={question.img_url} alt="Question visual" className="w-full max-h-96 object-contain rounded-xl border border-gray-200 dark:border-slate-700 mb-5" />
          )}

          <RichTextRenderer content={question.prompt_text} className="text-body-lg text-gray-600 dark:text-slate-400 leading-relaxed mb-6" />

          {/* Tips Card — gradient sidebar card */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900 border border-blue-100 dark:border-blue-500/20 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">lightbulb</span>
              </div>
              <span className="text-label-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Quick Tips</span>
            </div>
            <div className="space-y-3.5">
              {[
                { icon: "text_snippet", text: `Write at least ${question.task_type === "task1" ? "150" : "250"} words` },
                { icon: "edit_note", text: "Plan your response before writing" },
                { icon: "timer", text: "Leave time to review your answer" },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <span className="material-symbols-outlined text-blue-500 text-[20px] mt-0.5 shrink-0">{tip.icon}</span>
                  <span className="text-body-md text-gray-700 dark:text-slate-300">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Writing area */}
        <div className="lg:w-1/2 flex flex-col gap-4">

          {/* Status bar — floating dashboard header */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700/50 px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-[24px] ${timeLeft < 60 ? "text-red-500" : timeLeft < 300 ? "text-amber-500" : "text-gray-400 dark:text-slate-500"}`}>
                {timeLeft < 60 ? "timer_off" : timeLeft < 300 ? "timer_alert" : "timer"}
              </span>
              <span className={`font-mono text-2xl font-bold tracking-tight ${
                timeLeft < 60 ? "text-red-500" : timeLeft < 300 ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-white"
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-label-sm font-semibold">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
              <span className="text-label-sm text-gray-400 dark:text-slate-500">
                / {question.task_type === "task1" ? "150+" : "250+"}
              </span>
            </div>
          </div>

          {/* Textarea — modern editor */}
          <div className="flex-1 relative group mt-1">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <textarea
              aria-label="Writing response"
              className="relative w-full h-full min-h-[300px] bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700/50 p-6 text-base text-slate-800 dark:text-slate-200 resize-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none shadow-sm transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              style={{ lineHeight: "1.7", fontFamily: "Inter, Segoe UI, system-ui, sans-serif" }}
              placeholder="Start writing your response here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
              <p className="text-label-md text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit button — gradient, right-aligned */}
          <div className="flex justify-end">
            <button onClick={handleSubmit} disabled={!text.trim()}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-600 dark:to-blue-500 text-white text-label-md font-semibold hover:from-blue-800 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-400 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 shadow-md hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-500/20">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              Submit for Evaluation
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
