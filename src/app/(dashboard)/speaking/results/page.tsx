"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSpeakingEvaluation } from "@/lib/api";
import type { Evaluation } from "@/lib/types";
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
  const [showTranscription, setShowTranscription] = useState(false);
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
  const isPremium = user?.subscription_tier === "premium" || user?.role === "admin";

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
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[16px]">print</span> Print
          </button>
          <div className="flex items-center gap-1.5 text-label-sm bg-surface/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-outline-variant/40 shadow-sm">
          <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
          <span className="text-on-surface-variant">AI Evaluated</span>
        </div>
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
              <Link href="/speaking" className="w-full bg-primary-container text-on-primary-container py-2 rounded-lg text-label-sm font-semibold text-center hover:scale-[0.98] active:scale-[0.97] transition-all">Try Another</Link>
              <Link href="/dashboard" className="w-full bg-primary text-on-primary py-2 rounded-lg text-label-sm font-semibold text-center hover:scale-[0.98] active:scale-[0.97] transition-all">Dashboard</Link>
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
                {SPEAKING_CRITERIA.map((c) => (
                  <div key={c.key} className="bg-surface-container-lowest rounded-xl p-3 border border-dashed border-outline-variant/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-label-sm text-on-surface-variant">{c.label}</span>
                      <span className="text-label-sm text-outline bg-surface-variant px-2 py-0.5 rounded">--</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 mb-2"><div className="bg-surface-variant h-full rounded-full w-1/3" /></div>
                    <span className="material-symbols-outlined text-[14px] text-outline">lock</span>
                  </div>
                ))}
              </div>
              {/* Premium Detailed Scoring upsell — blurred */}
              <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[28px] text-outline">lock</span>
                  <span className="text-label-md font-semibold text-on-surface-variant">Detailed Scoring (Premium)</span>
                  <p className="text-label-sm text-on-surface-variant/70 text-center max-w-[280px]">Unlock detailed scoring for all 8 sub-criteria: fluency, coherence, vocabulary range, precision, paraphrasing, grammar range & accuracy, and pronunciation clarity.</p>
                  <button onClick={() => redirectToCheckout("premium")} className="mt-2 bg-primary text-on-primary font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                    Unlock · $14.99/mo
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-30 select-none pointer-events-none">
                  {SPEAKING_CRITERIA.map((c) => {
                    const subs = SPEAKING_SUB_CRITERIA[c.key] || [];
                    return (
                      <div key={c.key} className="space-y-2">
                        <p className="text-label-sm font-semibold text-on-surface">{c.label}</p>
                        {subs.map((sub) => (
                          <div key={sub.key} className="flex items-center gap-2 pl-3 border-l-2 border-outline-variant/40">
                            <span className="material-symbols-outlined text-[14px] text-outline">{sub.icon}</span>
                            <span className="text-label-sm text-on-surface-variant">{sub.label}</span>
                            <span className="font-mono text-xs text-outline ml-auto bg-surface-variant px-1.5 py-0.5 rounded">--</span>
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
                const data = criteria[c.key] as { score: number; comment: string } | undefined;
                const score = data?.score;
                const comment = data?.comment;
                const colors = score != null ? scoreColor(score) : { badge: "bg-surface-variant text-on-surface-variant", bar: "bg-surface-variant" };
                const subs = SPEAKING_SUB_CRITERIA[c.key] || [];
                const isExpanded = expandedCriterion === c.key;
                const hasSubData = subs.some((s) => criteria[s.key] != null);

                return (
                  <div key={c.key} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 hover:shadow-md transition-shadow overflow-hidden">
                    {/* Main criterion header */}
                    <div className="p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[18px] text-primary-tint">{c.icon}</span>
                        <h4 className="text-label-sm font-semibold text-on-surface">{c.label}</h4>
                        {score != null ? (
                          <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ml-auto ${colors.badge}`}>{score.toFixed(1)}</span>
                        ) : (
                          <span className="font-mono text-xs px-2 py-0.5 rounded-full ml-auto bg-surface-variant text-on-surface-variant">--</span>
                        )}
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 mb-2 overflow-hidden">
                        <div className={`${colors.bar} h-full rounded-full transition-all duration-700`} style={{ width: score != null ? `${(score / 9) * 100}%` : "0%" }} />
                      </div>
                      {comment ? (
                        <p className="text-label-sm text-on-surface-variant leading-relaxed">{comment}</p>
                      ) : (
                        <p className="text-label-sm text-on-surface-variant/60 italic">{c.description}</p>
                      )}
                    </div>

                    {/* Sub-criteria toggle */}
                    {subs.length > 0 && (
                      <>
                        <button
                          onClick={() => setExpandedCriterion(isExpanded ? null : c.key)}
                          className="w-full flex items-center gap-1.5 px-3.5 py-2 border-t border-outline-variant/30 text-label-sm text-primary-tint hover:bg-primary/5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">{hasSubData ? "analytics" : "visibility"}</span>
                          <span>Detailed Breakdown</span>
                          <span className="material-symbols-outlined text-[14px] ml-auto transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                            expand_more
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 space-y-2 border-t border-outline-variant/30 pt-2">
                            {subs.map((sub) => {
                              const subData = criteria[sub.key] as { score: number; comment: string } | undefined;
                              const subScore = subData?.score;
                              const subComment = subData?.comment;
                              const subColors = subScore != null ? scoreColor(subScore) : { badge: "bg-surface-variant text-on-surface-variant", bar: "bg-surface-variant/60" };
                              return (
                                <div key={sub.key} className="flex items-start gap-2 pl-2 border-l-2 border-outline-variant/30">
                                  <span className="material-symbols-outlined text-[15px] text-outline mt-0.5 shrink-0">{sub.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="text-label-sm text-on-surface">{sub.label}</span>
                                      {subScore != null ? (
                                        <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${subColors.badge} ml-auto shrink-0`}>{subScore.toFixed(1)}</span>
                                      ) : (
                                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-variant text-on-surface-variant ml-auto shrink-0">--</span>
                                      )}
                                    </div>
                                    <div className="w-full bg-surface-container rounded-full h-1 mb-1 overflow-hidden">
                                      <div className={`${subColors.bar} h-full rounded-full transition-all duration-500`} style={{ width: subScore != null ? `${(subScore / 9) * 100}%` : "0%" }} />
                                    </div>
                                    {subComment ? (
                                      <p className="text-label-sm text-on-surface-variant/80 leading-relaxed">{subComment}</p>
                                    ) : (
                                      <p className="text-label-sm text-on-surface-variant/50 italic">{sub.description}</p>
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

          {/* Detailed Feedback + Transcription */}
          {!transcription && !detailedFeedback && !locked ? null : locked ? (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40">
              {transcription && (
                <div className="mb-5 pb-5 border-b border-outline-variant/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-surface-variant p-2 rounded-lg text-on-surface-variant shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">closed_caption</span>
                    </div>
                    <h3 className="text-body-md font-semibold text-on-surface">Transcription</h3>
                  </div>
                  <p className="text-body-md text-on-surface leading-relaxed line-clamp-3">{transcription}</p>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-tint text-[20px]">lightbulb</span>
                <h3 className="text-body-md font-semibold text-on-surface">Detailed Feedback</h3>
              </div>
              <LockedPeek text={detailedFeedback || generalFeedback || ""} />
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40">
              {detailedFeedback && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 relative overflow-hidden mb-4">
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
              {examId && isPremium && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-surface-variant p-1.5 rounded-lg text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">headphones</span>
                    </div>
                    <span className="text-label-sm font-semibold text-on-surface">Your Recording</span>
                  </div>
                  <audio controls className="w-full h-8" src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/evaluate/speaking/${examId}/audio`}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}
              {transcription && (
                <div>
                  <button
                    onClick={() => setShowTranscription(!showTranscription)}
                    className="w-full flex items-center gap-2 text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <div className="bg-surface-variant p-1.5 rounded-lg text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">closed_caption</span>
                    </div>
                    <span className="font-semibold">Transcription</span>
                    <span className="material-symbols-outlined text-[16px] ml-auto transition-transform duration-200" style={{ transform: showTranscription ? "rotate(180deg)" : "rotate(0deg)" }}>
                      expand_more
                    </span>
                  </button>
                  {showTranscription && (
                    <p className="text-body-sm text-on-surface-variant leading-relaxed mt-3 pl-9 border-l-2 border-outline-variant/30 ml-1.5">{transcription}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
