"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function AdminExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ exams: any[]; total: number }>("/admin/exams?page=1&limit=100")
      .then((d) => {
        const found = d.exams?.find((e: any) => e.id === id);
        if (!found) throw new Error("Exam not found");
        setExam(found);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="text-center py-16">
        <p className="text-body-md text-error mb-4">{error || "Exam not found"}</p>
        <button onClick={() => router.push("/admin/exams")} className="text-primary font-semibold">Back to Exams</button>
      </div>
    );
  }

  const ev = exam.evaluations;
  const criteria = ev?.criteria_scores || {};

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/admin/exams")} className="text-on-surface-variant hover:text-primary p-1 rounded-lg hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-headline-md font-bold text-on-surface">Exam Detail</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Meta */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="capitalize text-body-md font-semibold text-on-surface">{exam.exam_type} {exam.task_type ? `Task ${exam.task_type.replace("task", "")}` : ""}</span>
              <span className={`text-label-sm px-2.5 py-0.5 rounded-full ${exam.status === "completed" ? "bg-emerald-100 text-emerald-800" : exam.status === "failed" ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"}`}>
                {exam.status}
              </span>
              {ev?.overall_band != null && (
                <span className="font-mono text-data-md font-bold text-primary bg-primary-fixed px-2.5 py-1 rounded-lg">
                  Band {ev.overall_band.toFixed(1)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-label-sm text-on-surface-variant">
              <div><span className="text-on-surface-variant/60">User ID</span><p className="text-on-surface font-mono text-xs mt-0.5">{exam.user_id}</p></div>
              <div><span className="text-on-surface-variant/60">Source</span><p className="text-on-surface mt-0.5 capitalize">{exam.eval_source}</p></div>
              <div><span className="text-on-surface-variant/60">Attempt</span><p className="text-on-surface mt-0.5">#{exam.attempt_number}</p></div>
              <div><span className="text-on-surface-variant/60">Created</span><p className="text-on-surface mt-0.5">{exam.created_at ? new Date(exam.created_at).toLocaleDateString() : "—"}</p></div>
            </div>
          </div>

          {/* Criteria */}
          {Object.keys(criteria).length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
              <h3 className="text-body-md font-semibold text-on-surface mb-4">Criteria Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(criteria).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-surface-container rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-label-sm text-on-surface capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="font-mono text-label-sm font-bold text-primary">{val.score?.toFixed(1)}</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant leading-relaxed">{val.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {ev?.detailed_feedback && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
              <h3 className="text-body-md font-semibold text-on-surface mb-3">Detailed Feedback</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">{ev.detailed_feedback}</p>
            </div>
          )}

          {/* Grammar Corrections */}
          {ev?.grammar_corrections?.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
              <h3 className="text-body-md font-semibold text-on-surface mb-3">Grammar Corrections</h3>
              <div className="space-y-3">
                {ev.grammar_corrections.map((c: any, i: number) => (
                  <div key={i} className="bg-surface-container rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
                      <span className="text-label-sm text-on-surface line-through decoration-error decoration-2 bg-error-container/20 px-2 py-0.5 rounded">{c.original}</span>
                      <span className="text-label-sm text-on-surface-variant">→</span>
                      <span className="text-label-sm text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">{c.corrected}</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {ev && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
              <h3 className="text-body-md font-semibold text-on-surface mb-3">Evaluation Info</h3>
              <div className="space-y-2 text-label-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Provider</span><span className="text-on-surface capitalize">{ev.provider_used}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Model</span><span className="text-on-surface font-mono text-xs">{ev.ai_model_used || "—"}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Tokens</span><span className="text-on-surface">{ev.tokens_used ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Processing</span><span className="text-on-surface">{ev.processing_time_ms ? `${ev.processing_time_ms}ms` : "—"}</span></div>
              </div>
            </div>
          )}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
            <h3 className="text-body-md font-semibold text-on-surface mb-3">Actions</h3>
            <div className="space-y-2">
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(exam, null, 2)); }} className="w-full text-left text-label-sm text-primary hover:underline">
                Copy JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
