"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuestions, createWritingExam, submitWritingEvaluation } from "@/lib/api";
import { showError } from "@/components/ui/Toast";
import type { Question, Exam } from "@/lib/types";

const DEFAULT_TIME = 40 * 60;

type Phase = "writing" | "submitting" | "done";

export default function WritingTestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("id");

  const [question, setQuestion] = useState<Question | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [phase, setPhase] = useState<Phase>("writing");
  const [error, setError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!questionId) return;
    getQuestions({ exam_type: "writing" })
      .then((questions) => {
        const found = questions.find((q) => q.id === questionId);
        if (!found) throw new Error("Question not found");
        setQuestion(found);
        return createWritingExam({ exam_type: "writing", task_type: found.task_type, question_id: found.id });
      })
      .then(setExam)
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
      router.push(`/writing/results?examId=${exam.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      setError(msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")
        ? "Our AI is experiencing high demand. Your answer has been saved. Please try again in a few moments."
        : msg);
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <span className="material-symbols-outlined text-[64px] text-primary mb-6 animate-spin">progress_activity</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Generating Your Report</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 max-w-md">
          Our AI is analyzing your writing. This usually takes 15–30 seconds.
        </p>
        <div className="w-full max-w-xs h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
        </div>
        <p className="font-label-md text-label-md text-on-surface-variant mt-6">
          {wordCount} words submitted
        </p>
        {error && (
          <div className="mt-8 bg-error-container/30 border border-error/20 rounded-xl p-5 max-w-md">
            <p className="font-body-md text-body-md text-error mb-3">{error}</p>
            <button onClick={handleSubmit} className="bg-primary text-on-primary font-label-md text-label-md px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
              Retry Submission
            </button>
          </div>
        )}
      </div>
    );
  }

  // === WRITING SCREEN ===
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[60vh] md:h-[calc(100dvh-9rem)]">
      <div className="lg:w-2/5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 overflow-y-auto ghost-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm tracking-wide uppercase">{question.task_type?.replace("task", "Task ")}</span>
            <span className="px-3 py-1 rounded-full bg-primary-container/10 text-primary font-label-sm text-label-sm tracking-wide uppercase">{question.module || "general"}</span>
          </div>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">{question.title || "Writing Prompt"}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">{question.prompt_text}</p>
        <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">Tips</p>
          <ul className="font-label-md text-label-md text-on-surface-variant space-y-1 list-disc pl-4">
            <li>Write at least {question.task_type === "task1" ? "150" : "250"} words</li>
            <li>Plan your response before writing</li>
            <li>Leave time to review your answer</li>
          </ul>
        </div>
      </div>

      <div className="lg:w-3/5 flex flex-col gap-4">
        <div className="flex items-center justify-between bg-surface-container-lowest rounded-2xl border border-outline-variant/30 px-5 py-3 ghost-shadow">
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
          className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-full hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">send</span>
          Submit for Evaluation
        </button>
      </div>
    </div>
  );
}
