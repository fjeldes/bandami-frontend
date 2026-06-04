"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getWritingEvaluation } from "@/lib/api";
import type { Evaluation } from "@/lib/types";
import { useAuthStore } from "@/hooks/useAuth";
import { redirectToCheckout } from "@/lib/payments";

const WRITING_CRITERIA = [
  { key: "task_response", label: "Task Response", icon: "task_alt", description: "How well the task is addressed" },
  { key: "coherence_and_cohesion", label: "Coherence & Cohesion", icon: "link", description: "Logical organization and flow" },
  { key: "lexical_resource", label: "Lexical Resource", icon: "book", description: "Range and accuracy of vocabulary" },
  { key: "grammatical_range_and_accuracy", label: "Grammatical Range & Accuracy", icon: "rule", description: "Variety and correctness of grammar" },
];

const WRITING_SUB_CRITERIA: Record<string, { key: string; label: string; icon: string; description: string }[]> = {
  task_response: [
    { key: "task_fulfillment", label: "Task Fulfillment", icon: "checklist", description: "Addresses all parts of the task, word count adequate" },
    { key: "position_clarity", label: "Position Clarity", icon: "flag", description: "Clear thesis/overview and position throughout" },
  ],
  coherence_and_cohesion: [
    { key: "paragraph_structure", label: "Paragraph Structure", icon: "view_agenda", description: "Logical paragraphing and topic sentences" },
    { key: "cohesion_devices", label: "Cohesion Devices", icon: "link", description: "Appropriate use of linking words and referencing" },
  ],
  lexical_resource: [
    { key: "vocabulary_range", label: "Vocabulary Range", icon: "dictionary", description: "Variety and sophistication of vocabulary" },
    { key: "vocabulary_precision", label: "Vocabulary Precision", icon: "target", description: "Word choice accuracy and collocations" },
  ],
  grammatical_range_and_accuracy: [
    { key: "grammar_range", label: "Grammatical Range", icon: "layers", description: "Variety of sentence structures" },
    { key: "grammar_accuracy", label: "Grammatical Accuracy", icon: "checklist", description: "Error frequency and punctuation" },
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
        <Link href="/pricing" className="bg-primary text-on-primary font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
          Unlock · $14.99/mo
        </Link>
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

export default function WritingResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = searchParams.get("examId");
  const user = useAuthStore((s) => s.user);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
  const isPremium = user?.subscription_tier === "premium" || user?.role === "admin";

  useEffect(() => {
    if (!examId) { setError("No exam ID provided"); setLoading(false); return; }
    const load = async () => {
      try {
        const evalData = await getWritingEvaluation(examId);
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
      <p className="text-body-md text-on-surface-variant">Evaluating your writing...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-body-md text-error mb-4">{error}</p>
      <button onClick={() => router.push("/writing")} className="text-primary font-semibold">Back to Writing</button>
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
  const corrections = evaluation.grammar_corrections || [];
  const paragraphFeedback = (evaluation as any).paragraph_feedback || [];

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-headline-md font-bold text-primary">Writing Results</h1>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[16px]">print</span> Print
          </button>
          <Link href="/dashboard" className="px-4 py-1.5 border border-outline rounded-lg text-label-sm text-primary hover:bg-surface-container transition-colors">Dashboard</Link>
          <Link href="/writing" className="px-4 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-label-sm font-semibold hover:opacity-90 transition-colors">Try Another</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Score Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center border border-outline-variant/40 relative">
          <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 border border-outline-variant/50 shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
            <span className="text-label-sm text-on-surface-variant">AI Evaluated</span>
          </div>
          <h2 className="text-body-md text-on-surface-variant mb-4 mt-4">Overall Band Score</h2>

          <div className="relative w-full max-w-[160px] mb-4">
            <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="bandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#004ac6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <path className="fill-none stroke-surface-variant" strokeWidth="2.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="fill-none" stroke="url(#bandGradient)" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${(band / 9) * 77.7}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text className="fill-primary font-mono font-extrabold" x="18" y="19.5" textAnchor="middle" fontSize="0.6em">{band.toFixed(1)}</text>
            </svg>
          </div>

          <span className="text-data-md font-semibold text-primary bg-primary-fixed px-2.5 py-1 rounded-md mb-3">{cefrLevel(band)}</span>

          <p className="text-label-sm text-center text-on-surface-variant max-w-[220px]">
            {band >= 7.5 ? "Strong performance!" : band >= 6 ? "Good effort." : "Keep practicing."}
          </p>
        </div>

        {/* General Feedback + Criteria + Detailed */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* General Feedback — always visible */}
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
              {["Task Response", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range"].map((label) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WRITING_CRITERIA.map((c) => {
                const data = criteria[c.key] as { score: number; comment: string } | undefined;
                const score = data?.score;
                const comment = data?.comment;
                const colors = score != null ? scoreColor(score) : { badge: "bg-surface-variant text-on-surface-variant", bar: "bg-surface-variant" };
                const subs = WRITING_SUB_CRITERIA[c.key] || [];
                const isExpanded = expandedCriterion === c.key;

                return (
                  <div key={c.key} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 hover:shadow-md transition-shadow overflow-hidden">
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
                    {subs.length > 0 && (
                      <>
                        <button
                          onClick={() => setExpandedCriterion(isExpanded ? null : c.key)}
                          className="w-full flex items-center gap-1.5 px-3.5 py-2 border-t border-outline-variant/30 text-label-sm text-primary-tint hover:bg-primary/5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">analytics</span>
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

          {/* Detailed Feedback */}
          {!detailedFeedback && locked ? null : locked && detailedFeedback ? (
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 border border-outline-variant/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-tint text-[20px]">article</span>
                <h3 className="text-body-md font-semibold text-on-surface">Detailed Feedback</h3>
              </div>
              <LockedPeek text={detailedFeedback} />
            </div>
          ) : detailedFeedback ? (
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/80 rounded-l-full" />
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary-container p-2 rounded-lg text-on-primary-container shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">article</span>
                </div>
                <h3 className="text-body-md font-semibold text-on-surface">Detailed Feedback</h3>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">{detailedFeedback}</p>
            </div>
           ) : null}
        </div>
      </div>

      {/* Paragraph Feedback (Premium) */}
      {paragraphFeedback.length > 0 && !locked && (
        <div className="mt-5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-5">
          <h3 className="text-body-md font-semibold text-on-surface mb-4">Paragraph-by-Paragraph Analysis</h3>
          <div className="space-y-3">
            {paragraphFeedback.map((p: any, i: number) => (
              <div key={i} className="flex gap-3 p-3 bg-surface-container rounded-lg">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{p.paragraph}</span>
                <div className="min-w-0">
                  <span className="text-label-sm font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">{p.role}</span>
                  <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">{p.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Corrections */}
      {corrections.length > 0 && !locked && (
        <div className="mt-section-gap">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="bg-error-container p-2 rounded-lg text-on-error-container shadow-sm">
              <span className="material-symbols-outlined text-[20px]">spellcheck</span>
            </div>
            <h2 className="text-headline-md font-bold text-on-surface">Grammar &amp; Vocabulary Corrections</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {corrections.map((c, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl shadow-sm p-4 border border-outline-variant/40 flex flex-col gap-4">
                <div className="bg-error/5 p-3 rounded-lg border border-error/10">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-error-container text-on-error-container mb-2 inline-block">Original</span>
                  <p className="text-body-md text-on-surface"><span className="line-through decoration-error decoration-2 text-error/80">{c.original}</span></p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-200 text-emerald-900 mb-2 inline-block">Corrected</span>
                  <p className="text-body-md text-emerald-900 font-semibold">{c.corrected}</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3">
                  <p className="text-label-sm text-on-surface-variant flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-surface-tint mt-0.5 shrink-0">info</span>
                    <span>{c.explanation}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
