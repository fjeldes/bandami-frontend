"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSpeakingEvaluation } from "@/lib/api";
import type { Evaluation } from "@/lib/types";
import { useAuthStore } from "@/hooks/useAuth";
import { redirectToCheckout } from "@/lib/stripe";

function LockedPeek({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="relative overflow-hidden rounded-xl">
      <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap line-clamp-2">{text}</p>
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent pointer-events-none" style={{ top: "50%" }} />
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2 pt-8 bg-gradient-to-t from-surface-container-lowest to-transparent">
        <span className="material-symbols-outlined text-outline text-[20px] mb-1">lock</span>
        <span className="text-label-sm text-on-surface-variant mb-2">Full detailed feedback is locked</span>
        <button onClick={() => redirectToCheckout("premium")} className="bg-primary text-on-primary font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
          Unlock · $14.99/mo
        </button>
      </div>
    </div>
  );
}

function cefrLevel(band: number) {
  if (band >= 8.5) return "C2";
  if (band >= 7.0) return "C1";
  if (band >= 5.5) return "B2";
  if (band >= 4.0) return "B1";
  if (band >= 3.0) return "A2";
  return "A1";
}

function scoreColor(score: number) {
  if (score >= 7.5) return { badge: "bg-emerald-100 text-emerald-800", bar: "bg-band-excellent" };
  if (score >= 6.5) return { badge: "bg-primary-fixed text-on-primary-fixed", bar: "bg-primary" };
  return { badge: "bg-amber-100 text-amber-800", bar: "bg-band-average" };
}

export default function SpeakingResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = searchParams.get("examId");
  const user = useAuthStore((s) => s.user);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!examId) { setError("No exam ID provided"); setLoading(false); return; }
    const load = async () => {
      try {
        const evalData = await getSpeakingEvaluation(examId);
        if (evalData.overall_band != null) setEvaluation(evalData);
        else setTimeout(load, 2000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("404") || msg.includes("not found")) setTimeout(load, 2000);
        else setError(msg || "Failed to load results");
      }
      setLoading(false);
    };
    const interval = setInterval(() => { if (!evaluation?.overall_band) load(); }, 3000);
    load();
    return () => clearInterval(interval);
  }, [examId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      <p className="text-body-md text-on-surface-variant">Evaluating your speaking...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-body-md text-error mb-4">{error}</p>
      <button onClick={() => router.push("/speaking")} className="text-primary font-semibold">Back to Speaking</button>
    </div>
  );

  if (!evaluation) return null;

  const isAdmin = user?.role === "admin";
  const locked = isAdmin ? false : !evaluation.is_feedback_visible;
  const hasCriteria = evaluation.criteria_scores && Object.keys(evaluation.criteria_scores).length > 0;
  const band = evaluation.overall_band ?? 0;
  const criteria = evaluation.criteria_scores || {};
  const generalFeedback = evaluation.general_feedback;
  const detailedFeedback = evaluation.detailed_feedback;
  const transcription = evaluation.user_submission;

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="text-headline-md font-bold text-primary">Speaking Results</h1>
        <div className="flex items-center gap-1.5 text-label-sm bg-surface/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-outline-variant/40 shadow-sm">
          <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
          <span className="text-on-surface-variant">AI Evaluated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center relative overflow-hidden border border-outline-variant/40">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent pointer-events-none" />
            <h3 className="text-body-md text-on-surface-variant mb-4 text-center z-10">Overall Band Score</h3>

            <div className="relative w-28 h-28 flex items-center justify-center mb-3 z-10">
              <svg className="w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="speakingBandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#004ac6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" fill="none" r="45" stroke="#e0e3e5" strokeWidth="5" />
                <circle cx="50" cy="50" fill="none" r="45" stroke="url(#speakingBandGradient)"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (band / 9) * 282.7}
                  strokeLinecap="round" strokeWidth="5" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[36px] leading-none text-primary font-extrabold tracking-tighter">{band.toFixed(1)}</span>
              </div>
            </div>

            <span className="text-data-md font-semibold text-primary bg-primary-fixed px-2.5 py-1 rounded-md mb-3 z-10">{cefrLevel(band)}</span>

            <p className="text-label-sm text-on-surface-variant text-center z-10">
              {band >= 7.5 ? "Strong performance!" : band >= 6 ? "Good effort." : "Keep practicing."}
            </p>

            <div className="w-full grid grid-cols-2 gap-2.5 mt-4 z-10">
              <Link href="/speaking" className="w-full bg-primary-container text-on-primary-container py-2 rounded-lg text-label-sm font-semibold text-center hover:opacity-90 transition-colors">Try Another</Link>
              <Link href="/dashboard" className="w-full bg-primary text-on-primary py-2 rounded-lg text-label-sm font-semibold text-center hover:brightness-90 transition-colors shadow-sm">Dashboard</Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* General Feedback */}
          {generalFeedback && (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-tint text-[20px]">lightbulb</span>
                <h3 className="text-body-md font-semibold text-on-surface">Quick Assessment</h3>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{generalFeedback}</p>
            </div>
          )}

          {/* Criteria */}
          {!hasCriteria && !locked ? (
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 text-center">
              <span className="material-symbols-outlined text-[32px] text-outline mb-2">hourglass_empty</span>
              <p className="text-body-md text-on-surface-variant">Criteria data is being evaluated...</p>
            </div>
          ) : locked ? (
            <div className="grid grid-cols-2 gap-3 opacity-60">
              {["Fluency & Coherence", "Lexical Resource", "Grammatical Range", "Pronunciation"].map((label) => (
                <div key={label} className="bg-surface-container-lowest rounded-xl p-3 border border-dashed border-outline-variant/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-label-sm text-on-surface-variant">{label}</span>
                    <span className="text-label-sm text-outline bg-surface-variant px-2 py-0.5 rounded">--</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 mb-2"><div className="bg-surface-variant h-full rounded-full w-1/3" /></div>
                  <span className="material-symbols-outlined text-[14px] text-outline">lock</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(criteria).map(([key, val]) => {
                const score = (val as { score: number }).score;
                const comment = (val as { comment: string }).comment;
                const colors = scoreColor(score);
                return (
                  <div key={key} className="bg-surface-container-lowest rounded-xl shadow-sm p-3.5 border border-outline-variant/40 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-label-sm font-semibold text-on-surface capitalize">{key.replace(/_/g, " ")}</h4>
                      <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>{score.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 mb-2 overflow-hidden">
                      <div className={`${colors.bar} h-full rounded-full transition-all duration-700`} style={{ width: `${(score / 9) * 100}%` }} />
                    </div>
                    <p className="text-label-sm text-on-surface-variant leading-relaxed">{comment}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Transcription & Feedback */}
          {!transcription && !detailedFeedback && !locked ? null : locked ? (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40">
              {transcription && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-surface-variant p-2 rounded-lg text-on-surface-variant shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">closed_caption</span>
                    </div>
                    <h3 className="text-body-md font-semibold text-on-surface">Transcription</h3>
                  </div>
                  <p className="text-body-md text-on-surface leading-relaxed mb-5 pb-5 border-b border-outline-variant/40">{transcription}</p>
                </>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-tint text-[20px]">lightbulb</span>
                <h3 className="text-body-md font-semibold text-on-surface">Detailed Feedback</h3>
              </div>
              <LockedPeek text={detailedFeedback || generalFeedback || ""} />
            </div>
          ) : (transcription || detailedFeedback) ? (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40">
              {transcription && (
                <div className="mb-5 pb-5 border-b border-outline-variant/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-surface-variant p-2 rounded-lg text-on-surface-variant shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">closed_caption</span>
                    </div>
                    <h3 className="text-body-md font-semibold text-on-surface">Transcription</h3>
                  </div>
                  <p className="text-body-md text-on-surface leading-relaxed">{transcription}</p>
                </div>
              )}
              {detailedFeedback && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/80 rounded-l-full" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-primary-container p-2 rounded-lg text-on-primary-container shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                    </div>
                    <h3 className="text-body-md font-semibold text-on-surface">Detailed Feedback</h3>
                  </div>
                  <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">{detailedFeedback}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
