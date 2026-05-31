"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Evaluation } from "@/lib/types";
import { useAuthStore } from "@/hooks/useAuth";

export default function ReadingResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = searchParams.get("examId");
  const user = useAuthStore((s) => s.user);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!examId) { setError("No exam ID"); setLoading(false); return; }
    const load = async () => {
      try {
        const data = await apiFetch<Evaluation>(`/evaluate/reading/${examId}/evaluation`);
        if (data.overall_band != null) setEvaluation(data);
        else setTimeout(load, 2000);
      } catch (err) { const msg = err instanceof Error ? err.message : ""; if (msg.includes("404")) setTimeout(load, 2000); else setError(msg || "Failed"); }
      setLoading(false);
    };
    load();
  }, [examId]);

  if (loading) return <div className="flex flex-col items-center justify-center py-16 gap-3"><span className="material-symbols-outlined text-[36px] text-primary animate-spin">progress_activity</span><p className="text-body-md text-on-surface-variant">Evaluating your reading...</p></div>;
  if (error) return <div className="text-center py-12"><p className="text-body-md text-error mb-4">{error}</p><button onClick={() => router.push("/reading")} className="text-primary font-semibold">Back</button></div>;
  if (!evaluation) return null;

  const band = evaluation.overall_band ?? 0;
  const isAdmin = user?.role === "admin";
  const locked = isAdmin ? false : !evaluation.is_feedback_visible;
  const feedback = evaluation.general_feedback || evaluation.detailed_feedback;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-headline-md font-bold text-primary">Reading Results</h1>
        <div className="flex gap-3">
          <Link href="/dashboard" className="px-4 py-1.5 border border-outline rounded-lg text-label-sm text-primary hover:bg-surface-container transition-colors">Dashboard</Link>
          <Link href="/reading" className="px-4 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-label-sm font-semibold hover:opacity-90 transition-colors">Try Another</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center border border-outline-variant/40">
          <h2 className="text-body-md text-on-surface-variant mb-4">Overall Band Score</h2>
          <div className="relative w-full max-w-[160px] mb-4">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#004ac6" /><stop offset="100%" stopColor="#2563eb" /></linearGradient></defs>
              <path className="fill-none stroke-surface-variant" strokeWidth="2.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="fill-none" stroke="url(#rg)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(band / 9) * 77.7}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text className="fill-primary font-mono font-extrabold" x="18" y="19.5" textAnchor="middle" fontSize="0.6em">{band.toFixed(1)}</text>
            </svg>
          </div>
          <p className="text-label-sm text-on-surface-variant">{band >= 7 ? "Great comprehension!" : band >= 5.5 ? "Good effort." : "Keep practicing."}</p>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-5">
          {feedback && (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-tint text-[20px]">lightbulb</span>
                <h3 className="text-body-md font-semibold text-on-surface">{locked ? "Quick Assessment" : "Detailed Feedback"}</h3>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
