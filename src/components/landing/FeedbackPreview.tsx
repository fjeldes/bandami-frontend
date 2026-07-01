"use client";

import { useState } from "react";

const WRITING_PREVIEW = {
  band: 7.0,
  cefr: "C1",
  quickFeedback:
    "Good structure and clear arguments. Work on using more sophisticated linking devices and varying sentence structures to achieve a higher band.",
  criteria: [
    { label: "Task Response", score: 7.0, comment: "Addresses all parts, clear position stated" },
    { label: "Coherence & Cohesion", score: 6.5, comment: "Logical flow, some linking issues" },
    { label: "Lexical Resource", score: 7.0, comment: "Good vocabulary range, occasional imprecise word choice" },
    { label: "Grammatical Range", score: 7.0, comment: "Mix of complex structures, minor errors" },
  ],
  proFeatures: [
    "Paragraph-by-paragraph analysis",
    "Grammar corrections with explanations",
    "Full detailed feedback (5+ pages)",
  ],
};

const SPEAKING_PREVIEW = {
  band: 6.5,
  cefr: "B2",
  quickFeedback:
    "Good fluency and coherence for Band 6.5. Focus on expanding vocabulary range and improving pronunciation clarity to reach Band 7.",
  criteria: [
    { label: "Fluency & Coherence", score: 6.5, comment: "Smooth speech, occasional hesitations" },
    { label: "Lexical Resource", score: 6.5, comment: "Adequate vocabulary, some repetition" },
    { label: "Grammatical Range", score: 6.0, comment: "Simple and complex structures, some errors" },
    { label: "Pronunciation", score: 6.5, comment: "Generally clear, minor stress issues" },
  ],
  proFeatures: [
    "Audio recording playback",
    "Full transcription analysis",
    "Detailed pronunciation feedback",
  ],
};

function BandScore({ band, cefr }: { band: number; cefr: string }) {
  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <div className="relative w-14 h-14 mb-1">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <g transform="rotate(-90 18 18)">
            <path
              className="fill-none stroke-surface-variant"
              strokeWidth="2.5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="fill-none stroke-primary"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${(band / 9) * 77.7}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </g>
          <text
            className="fill-primary font-mono font-bold"
            x="18"
            y="20"
            textAnchor="middle"
            fontSize="0.5em"
          >
            {band.toFixed(1)}
          </text>
        </svg>
      </div>
      <span className="text-label-sm font-semibold text-primary bg-primary-container/30 px-1.5 py-0.5 rounded">
        {cefr}
      </span>
    </div>
  );
}

function CriterionRow({
  label,
  score,
  comment,
}: {
  label: string;
  score: number;
  comment: string;
}) {
  const barColor =
    score >= 7.5
      ? "bg-band-excellent"
      : score >= 6.5
        ? "bg-primary"
        : "bg-band-average";
  const badgeClass =
    score >= 7.5
      ? "bg-primary-container text-on-primary-container"
      : score >= 6.5
        ? "bg-primary text-on-primary"
        : "bg-tertiary-container text-on-tertiary-container";

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-label-sm font-medium text-on-surface-variant truncate">
            {label}
          </span>
          <span
            className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${badgeClass}`}
          >
            {score.toFixed(1)}
          </span>
        </div>
        <div className="h-1 bg-surface-variant rounded-full overflow-hidden mb-1">
          <div
            className={`h-full ${barColor} rounded-full`}
            style={{ width: `${(score / 9) * 100}%` }}
          />
        </div>
        <span className="text-label-sm text-on-surface-variant/60 leading-snug">
          {comment}
        </span>
      </div>
    </div>
  );
}

export function FeedbackPreview() {
  const [activeTab, setActiveTab] = useState<"writing" | "speaking">("writing");
  const data = activeTab === "writing" ? WRITING_PREVIEW : SPEAKING_PREVIEW;

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-outline-variant/30 shrink-0">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab("writing")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-label-sm font-medium transition-all ${
              activeTab === "writing"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high/80"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">edit_note</span>
            Writing
          </button>
          <button
            onClick={() => setActiveTab("speaking")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-label-sm font-medium transition-all ${
              activeTab === "speaking"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high/80"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">mic</span>
            Speaking
          </button>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full">
          <span className="material-symbols-outlined text-[12px] text-on-surface-variant">
            info
          </span>
          <span className="text-label-sm text-on-surface-variant font-medium">
            Sample Preview
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 flex flex-col gap-2.5">
        <div className="flex items-start gap-3">
          <BandScore band={data.band} cefr={data.cefr} />
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-label-sm text-on-surface-variant leading-relaxed line-clamp-3">
              {data.quickFeedback}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-lg p-2.5 border border-outline-variant/20 grid grid-cols-2 gap-x-4 gap-y-2">
          {data.criteria.map((c) => (
            <CriterionRow
              key={c.label}
              label={c.label}
              score={c.score}
              comment={c.comment}
            />
          ))}
        </div>

        <div className="bg-primary-container/20 rounded-lg px-2.5 py-2 border border-primary/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="material-symbols-outlined text-[12px] text-primary">
              stars
            </span>
            <span className="text-label-sm font-semibold text-primary">
              Pro Features
            </span>
            <span className="bg-primary text-on-primary text-[10px] font-bold px-1 py-0.5 rounded-full ml-auto">
              PRO
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {data.proFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-1 text-label-sm text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[12px] text-primary">
                  check_circle
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
