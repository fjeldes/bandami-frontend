"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_ORIGIN as API_BASE } from "@/lib/config";
import { getSpeakingEvaluation } from "@/lib/api";
import type { Evaluation, CriterionScore } from "@/lib/types";
import { useAuthStore } from "@/hooks/useAuth";
import { redirectToCheckout } from "@/lib/payments";

const SPEAKING_CRITERIA = [
  { key: "fluency_and_coherence", label: "Fluency & Coherence", icon: "chat", description: "How smoothly and coherently you speak" },
  { key: "lexical_resource", label: "Lexical Resource", icon: "book", description: "Range and accuracy of vocabulary" },
  { key: "grammatical_range_and_accuracy", label: "Grammatical Range & Accuracy", icon: "rule", description: "Variety and correctness of grammar" },
  { key: "pronunciation", label: "Pronunciation", icon: "record_voice_over", description: "Clarity and naturalness of speech" },
];

const SPEAKING_SUB_CRITERIA: Record<string, { key: string; label: string; icon: string; description: string }[]> = {
  fluency_and_coherence: [
    { key: "fluency", label: "Fluency", icon: "pace", description: "Speech rate, pauses, fillers, and hesitation patterns" },
    { key: "coherence", label: "Coherence", icon: "link", description: "Logical connectors, topic development, and discourse structure" },
  ],
  lexical_resource: [
    { key: "vocabulary_range", label: "Range", icon: "dictionary", description: "Variety, less common words, and idiomatic expressions" },
    { key: "vocabulary_precision", label: "Precision", icon: "target", description: "Word choice accuracy, collocations, and register" },
    { key: "paraphrasing", label: "Paraphrasing", icon: "swap_horiz", description: "Ability to rephrase, use synonyms, and avoid repetition" },
  ],
  grammatical_range_and_accuracy: [
    { key: "grammar_range", label: "Range", icon: "layers", description: "Variety of sentence structures (simple, compound, complex)" },
    { key: "grammar_accuracy", label: "Accuracy", icon: "checklist", description: "Error frequency, tense control, articles, and prepositions" },
  ],
  pronunciation: [
    { key: "pronunciation_clarity", label: "Clarity", icon: "hearing", description: "Clarity inferred from transcription, word stress, and intonation" },
  ],
};

function LockedPeek({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="relative overflow-hidden rounded-xl">
      <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap line-clamp-2">{text}</p>
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent pointer-events-none" style={{ top: "50%" }} />
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2 pt-8 bg-gradient-to-t from-surface-container-lowest to-transparent">
        <span className="material-symbols-outlined text-outline text-[20px] mb-1">lock</span>
        <span className="text-label-sm text-on-surface-variant mb-2">Full detailed feedback is locked</span>
        <button onClick={() => redirectToCheckout("premium")} className="bg-primary text-on-primary font-semibold px-4 py-2 rounded-xl text-sm hover:scale-[0.98] active:scale-[0.97] transition-all">
          Unlock Pro · $14.99/mo
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
  const [examFailed, setExamFailed] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
  const isPremium = user?.subscription_tier === "premium" || user?.role === "admin";

  useEffect(() => {
    if (!examId) { setError("No exam ID provided"); setLoading(false); return; }
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 30;

    const poll = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const evalData = await getSpeakingEvaluation(examId);
        if (evalData.overall_band != null) {
          setEvaluation(evalData);
          setLoading(false);
          return;
        }
        if (evalData.exam_status === "failed") {
          setExamFailed(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("404") && !msg.includes("not found")) {
          setError(msg || "Failed to load results");
          setLoading(false);
          return;
        }
      }
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(poll, 3000);
      } else {
        setError("The evaluation took too long. Our AI agent is experiencing high demand. Please try again.");
        setLoading(false);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [examId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
      <p className="text-body-md text-on-surface-variant">Evaluating your speaking...</p>
    </div>
  );

  if (examFailed) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <span className="material-symbols-outlined text-[48px] text-error">error_outline</span>
      <h2 className="text-headline-sm font-bold text-on-surface">Evaluation Failed</h2>
      <p className="text-body-md text-on-surface-variant text-center max-w-md">
        Our AI agent encountered an error while evaluating your speaking. This may be due to audio quality or high demand. Please try again.
      </p>
      <div className="flex gap-3 mt-2">
        <button onClick={() => router.push("/speaking")} className="bg-primary text-on-primary font-semibold px-6 py-2.5 rounded-xl text-sm hover:scale-[0.98] active:scale-[0.97] transition-all">
          Try Again
        </button>
        <button onClick={() => router.push("/dashboard")} className="bg-surface-variant text-on-surface-variant font-semibold px-6 py-2.5 rounded-xl text-sm hover:scale-[0.98] active:scale-[0.97] transition-all">
          Dashboard
        </button>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <span className="material-symbols-outlined text-[48px] text-error">warning</span>
      <p className="text-body-md text-on-surface-variant text-center">{error}</p>
      <button onClick={() => router.push("/speaking")} className="bg-primary text-on-primary font-semibold px-6 py-2.5 rounded-xl text-sm hover:scale-[0.98] active:scale-[0.97] transition-all">
        Back to Speaking
      </button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>Speaking Results</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[13px] text-slate-500">
              {evaluation.created_at && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(evaluation.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">tag</span>
                ID: {examId?.slice(0, 8)}...
              </span>
              <span className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                AI Evaluated
              </span>
            </div>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300">
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column — Score */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Neumorphic Score Card */}
            <div className="rounded-2xl p-6 flex flex-col items-center text-center shadow-[6px_6px_14px_rgba(0,0,0,0.04),-6px_-6px_14px_rgba(255,255,255,0.8)] bg-white/60 border border-slate-100/60">
              <p className="text-[13px] font-medium text-slate-500 mb-5 uppercase tracking-wider">Overall Band Score</p>

              <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="speakingBandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#004ac6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" fill="none" r="45" stroke="#e2e8f0" strokeWidth="5" />
                  <circle cx="50" cy="50" fill="none" r="45" stroke="url(#speakingBandGradient)"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (band / 9) * 282.7}
                    strokeLinecap="round" strokeWidth="5" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[36px] leading-none text-slate-900 font-extrabold tracking-tighter">{band.toFixed(1)}</span>
                </div>
              </div>

              <span className="text-[13px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3">{cefrLevel(band)}</span>

              <p className="text-[12px] text-slate-400 mb-1">AI estimate — not an official IELTS score</p>
              <p className="text-[13px] text-slate-600 font-medium">
                {band >= 7.5 ? "Strong performance!" : band >= 6 ? "Good effort." : "Keep practicing."}
              </p>

              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <Link href="/speaking" className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold text-center hover:bg-slate-50 transition-colors">Practice Again</Link>
                <Link href="/dashboard" className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-semibold text-center hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg">Dashboard</Link>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Quick Assessment */}
            {generalFeedback && (
              <div className="rounded-2xl bg-white/60 border border-slate-100/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">lightbulb</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-800">Quick Assessment</h3>
                </div>
                <p className="text-[14px] text-slate-600 leading-relaxed">{generalFeedback}</p>
              </div>
            )}

            {/* Criteria */}
            {!hasCriteria && !locked ? (
              <div className="rounded-2xl bg-white/60 border border-slate-100/60 p-6 text-center">
                <span className="material-symbols-outlined text-[32px] text-slate-300 mb-2">hourglass_empty</span>
                <p className="text-[14px] text-slate-500">Criteria data is being evaluated...</p>
              </div>
            ) : locked && !hasCriteria ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
                {SPEAKING_CRITERIA.map((c) => (
                  <div key={c.key} className="rounded-2xl bg-white/40 border border-dashed border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] text-slate-500">{c.label}</span>
                      <span className="text-[12px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">--</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2"><div className="bg-slate-200 h-full rounded-full w-1/3" /></div>
                    <span className="material-symbols-outlined text-[14px] text-slate-300">lock</span>
                  </div>
                ))}
              </div>
            ) : locked ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SPEAKING_CRITERIA.map((c) => {
                    const data = criteria[c.key] as CriterionScore | undefined;
                    const score = data?.score;
                    const comment = data?.comment;
                    const colors = score != null ? scoreColor(score) : { badge: "bg-slate-100 text-slate-500", bar: "bg-slate-200" };
                    return (
                      <div key={c.key} className="rounded-2xl bg-white/60 border border-slate-100/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[18px] text-blue-500">{c.icon}</span>
                          <h4 className="text-[13px] font-semibold text-slate-800">{c.label}</h4>
                          {score != null ? (
                            <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto ${colors.badge}`}>{score.toFixed(1)}</span>
                          ) : (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full ml-auto bg-slate-100 text-slate-500">--</span>
                          )}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div className={`${colors.bar} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: score != null ? `${(score / 9) * 100}%` : "0%" }} />
                        </div>
                        {comment ? (
                          <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-1">{comment}</p>
                        ) : (
                          <p className="text-[13px] text-slate-400 italic">{c.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Premium upsell */}
                <div className="rounded-2xl bg-white/60 border border-slate-100/60 p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center gap-2 rounded-2xl">
                    <span className="material-symbols-outlined text-[28px] text-slate-300">lock</span>
                    <span className="text-[14px] font-semibold text-slate-600">Detailed Scoring (Pro)</span>
                    <p className="text-[13px] text-slate-400 text-center max-w-[280px]">Get detailed scoring for all sub-criteria: fluency, coherence, vocabulary, grammar, and pronunciation.</p>
                    <button onClick={() => redirectToCheckout("premium")} className="mt-2 bg-slate-900 text-white font-semibold px-5 py-2 rounded-xl text-[13px] hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md">
                      Unlock Pro · $14.99/mo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-30 select-none pointer-events-none">
                    {SPEAKING_CRITERIA.map((c) => {
                      const subs = SPEAKING_SUB_CRITERIA[c.key] || [];
                      return (
                        <div key={c.key} className="space-y-2">
                          <p className="text-[13px] font-semibold text-slate-600">{c.label}</p>
                          {subs.map((sub) => (
                            <div key={sub.key} className="flex items-center gap-2 pl-3 border-l-2 border-slate-200">
                              <span className="material-symbols-outlined text-[14px] text-slate-300">{sub.icon}</span>
                              <span className="text-[13px] text-slate-500">{sub.label}</span>
                              <span className="font-mono text-[11px] text-slate-400 ml-auto bg-slate-100 px-1.5 py-0.5 rounded">--</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                {SPEAKING_CRITERIA.map((c) => {
                  const data = criteria[c.key] as CriterionScore | undefined;
                  const score = data?.score;
                  const comment = data?.comment;
                  const colors = score != null ? scoreColor(score) : { badge: "bg-slate-100 text-slate-500", bar: "bg-slate-200" };
                  const subs = SPEAKING_SUB_CRITERIA[c.key] || [];
                  const isExpanded = expandedCriterion === c.key;
                  const hasSubData = subs.some((s) => criteria[s.key] != null);

                  const barGradient = score != null && score >= 7
                    ? "bg-gradient-to-r from-blue-500 to-emerald-400"
                    : score != null && score >= 6
                    ? "bg-gradient-to-r from-blue-500 to-blue-400"
                    : "bg-gradient-to-r from-amber-400 to-amber-300";

                  return (
                    <div key={c.key} className="rounded-2xl bg-white/60 border border-slate-100/60 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[18px] text-blue-500">{c.icon}</span>
                          <h4 className="text-[13px] font-semibold text-slate-800">{c.label}</h4>
                          {score != null ? (
                            <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto ${colors.badge}`}>{score.toFixed(1)}</span>
                          ) : (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full ml-auto bg-slate-100 text-slate-500">--</span>
                          )}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ease-out ${barGradient}`} style={{ width: score != null ? `${(score / 9) * 100}%` : "0%" }} />
                        </div>
                        {comment ? (
                          <p className="text-[13px] text-slate-500 leading-relaxed">{comment}</p>
                        ) : (
                          <p className="text-[13px] text-slate-400 italic">{c.description}</p>
                        )}
                      </div>

                      {/* Sub-criteria toggle */}
                      {subs.length > 0 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedCriterion(isExpanded ? null : c.key); }}
                            className="w-full flex items-center gap-1.5 px-4 py-2.5 border-t border-slate-100 text-[12px] text-blue-600 hover:bg-blue-50/50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">{hasSubData ? "analytics" : "visibility"}</span>
                            <span className="font-medium">Detailed Breakdown</span>
                            <span className="material-symbols-outlined text-[14px] ml-auto transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                              expand_more
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2.5 border-t border-slate-100 pt-3">
                              {subs.map((sub) => {
                                const subData = criteria[sub.key] as CriterionScore | undefined;
                                const subScore = subData?.score;
                                const subComment = subData?.comment;
                                const subColors = subScore != null ? scoreColor(subScore) : { badge: "bg-slate-100 text-slate-500", bar: "bg-slate-200" };
                                const subGradient = subScore != null && subScore >= 7
                                  ? "bg-gradient-to-r from-blue-500 to-emerald-400"
                                  : subScore != null && subScore >= 6
                                  ? "bg-gradient-to-r from-blue-500 to-blue-400"
                                  : "bg-gradient-to-r from-amber-400 to-amber-300";
                                return (
                                  <div key={sub.key} className="flex items-start gap-2 pl-2 border-l-2 border-slate-100">
                                    <span className="material-symbols-outlined text-[15px] text-slate-400 mt-0.5 shrink-0">{sub.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[13px] text-slate-700">{sub.label}</span>
                                        {subScore != null ? (
                                          <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${subColors.badge} ml-auto shrink-0`}>{subScore.toFixed(1)}</span>
                                        ) : (
                                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 ml-auto shrink-0">--</span>
                                        )}
                                      </div>
                                      <div className="w-full bg-slate-100 rounded-full h-1 mb-1.5 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${subGradient}`} style={{ width: subScore != null ? `${(subScore / 9) * 100}%` : "0%" }} />
                                      </div>
                                      {subComment ? (
                                        <p className="text-[12px] text-slate-500 leading-relaxed">{subComment}</p>
                                      ) : (
                                        <p className="text-[12px] text-slate-400 italic">{sub.description}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Feedback Sections */}
            {locked && !detailedFeedback ? null : locked ? (
              <div className="rounded-2xl bg-white/60 border border-slate-100/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">lightbulb</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-800">Detailed Feedback</h3>
                </div>
                <LockedPeek text={detailedFeedback || generalFeedback || ""} />
              </div>
            ) : (
              <div className="space-y-4">
                {detailedFeedback && (
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-50/40 border border-emerald-200/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] text-emerald-600">emoji_objects</span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-emerald-800">Detailed Feedback</h3>
                    </div>
                    <p className="text-[14px] text-emerald-700 leading-relaxed whitespace-pre-wrap">{detailedFeedback}</p>
                  </div>
                )}
              </div>
            )}

            {/* Transcription */}
            {transcription && (
              <div className="rounded-2xl bg-white/60 border border-slate-100/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <button
                  onClick={() => setShowTranscription(!showTranscription)}
                  className="w-full flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-slate-500">closed_caption</span>
                  </div>
                  <span className="font-semibold text-slate-800">Transcription</span>
                  <span className="material-symbols-outlined text-[14px] ml-auto transition-transform duration-200" style={{ transform: showTranscription ? "rotate(180deg)" : "rotate(0deg)" }}>
                    expand_more
                  </span>
                </button>
                {showTranscription && (
                  <p className="text-[13px] text-slate-500 leading-relaxed mt-3 pl-10 border-l-2 border-slate-100 whitespace-pre-wrap">{transcription}</p>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link href="/speaking"
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-[13px] font-semibold text-center hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Practice Again
              </Link>
              <Link href="/history"
                className="flex-[1.5] py-3 rounded-xl bg-slate-900 text-white text-[13px] font-bold text-center hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-slate-900/20 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                Review Detailed Analytics
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
