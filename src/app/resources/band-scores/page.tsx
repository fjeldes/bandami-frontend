"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";

const BAND_COLORS = {
  9: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300", text: "text-emerald-700 dark:text-emerald-300" },
  8: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300", text: "text-emerald-700 dark:text-emerald-300" },
  7: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", badge: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300", text: "text-green-700 dark:text-green-300" },
  6: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300", text: "text-amber-700 dark:text-amber-300" },
  5: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300", text: "text-orange-700 dark:text-orange-300" },
  4: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300", text: "text-red-700 dark:text-red-300" },
};

const WRITING_BANDS = [
  {
    band: 9,
    title: "Expert",
    summary: "Full flexibility, accuracy, and control",
    criteria: [
      "Fully addresses all parts of the task",
      "Presents a well-developed response with relevant, extended ideas",
      "Uses cohesion in a way that attracts no attention",
      "Skilfully uses a wide range of vocabulary",
      "Uses a wide range of structures with full flexibility and accuracy",
    ],
  },
  {
    band: 8,
    title: "Very Good",
    summary: "Generally effective, with occasional lapses",
    criteria: [
      "Covers all parts of the task (though may be uneven)",
      "Presents a well-developed response with relevant ideas",
      "Manages cohesion effectively (may have minor lapses)",
      "Uses a wide range of vocabulary fluently and flexibly",
      "Uses a wide range of structures (may have occasional errors)",
    ],
  },
  {
    band: 7,
    title: "Good",
    summary: "Clear argument, occasional errors that don't impede communication",
    criteria: [
      "Covers all parts of the task",
      "Presents a clear position throughout",
      "Presents relevant, extended ideas (some may be inadequately developed)",
      "Uses cohesion effectively (may have some lapses)",
      "Uses a sufficient range of vocabulary accurately",
      "Uses some complex structures (some errors but communication clear)",
    ],
  },
  {
    band: 6,
    title: "Competent",
    summary: "Meets expectations, but with notable limitations",
    criteria: [
      "Addresses all parts of the task (may be uneven)",
      "Presents a relevant position (conclusion may be unclear)",
      "Presents main ideas (some may be superficial)",
      "Uses cohesion (not always logical, some repetition)",
      "Uses adequate vocabulary for the task",
      "Uses some accurate complex sentences (some errors",
    ],
  },
  {
    band: 5,
    title: "Modest",
    summary: "Partially achieves the task, with significant weaknesses",
    criteria: [
      "Addresses the task only partially (may focus on one part)",
      "Expresses a position but development is limited",
      "Presents some main ideas but they are underdeveloped",
      "Attempts coherence but logic is unclear",
      "Uses limited vocabulary (may have errors in word choice)",
      "Uses only basic sentence forms (some errors cause confusion)",
    ],
  },
];

const SPEAKING_BANDS = [
  {
    band: 9,
    title: "Expert",
    summary: "Full flexibility, accuracy, and command",
    criteria: [
      "Speaks with full flexibility and precision at all times",
      "Handles all complex questions with ease",
      "Uses rich, varied vocabulary effortlessly",
      "Uses wide range of structures with complete flexibility",
      "Pronunciation is clear, natural, and effortless",
    ],
  },
  {
    band: 8,
    title: "Very Good",
    summary: "Generally effective, with minor slips",
    criteria: [
      "Speaks fluently and flexibly on most topics",
      "Handles complex situations well",
      "Uses vocabulary fluently and effectively (occasional slips)",
      "Uses wide range of structures (minor errors)",
      "Pronunciation is clear with occasional slips",
    ],
  },
  {
    band: 7,
    title: "Good",
    summary: "Effective communication, occasional inaccuracies",
    criteria: [
      "Speaks at length with good flow",
      "Uses vocabulary for most topics (some inaccuracies",
      "Uses range of structures (some complex sentences)",
      "Generally fluent but rephrasing occurs",
      "Pronunciation is clear with some lapses",
    ],
  },
  {
    band: 6,
    title: "Competent",
    summary: "Generally effective, but with notable limitations",
    criteria: [
      "Speaks with reasonable length and flow",
      "Uses vocabulary for familiar topics (some errors",
      "Uses basic complex structures (some errors",
      "Can be understood throughout despite some issues",
      "Pronunciation is generally clear but with some issues",
    ],
  },
  {
    band: 5,
    title: "Modest",
    summary: "Manages basic communication, with frequent issues",
    criteria: [
      "Keeps going but repeats and self-corrects",
      "Limited vocabulary for most topics",
      "Uses basic sentence forms (errors common)",
      "Sometimes pauses to search for words",
      "Pronunciation causes some difficulty for listener",
    ],
  },
];

const READING_CORRECT = [
  { min: 39, max: 40, band: 9 },
  { min: 37, max: 38, band: 8 },
  { min: 35, max: 36, band: 7 },
  { min: 33, max: 34, band: 6.5 },
  { min: 30, max: 32, band: 6 },
  { min: 27, max: 29, band: 5.5 },
  { min: 23, max: 26, band: 5 },
  { min: 19, max: 22, band: 4.5 },
  { min: 15, max: 18, band: 4 },
];

const LISTENING_CORRECT = [
  { min: 39, max: 40, band: 9 },
  { min: 37, max: 38, band: 8 },
  { min: 35, max: 36, band: 7 },
  { min: 32, max: 34, band: 6.5 },
  { min: 30, max: 31, band: 6 },
  { min: 26, max: 29, band: 5.5 },
  { min: 23, max: 25, band: 5 },
  { min: 18, max: 22, band: 4.5 },
  { min: 16, max: 17, band: 4 },
];

function BandCard({ band, title, summary, criteria }: { band: number; title: string; summary: string; criteria: string[] }) {
  const colors = BAND_COLORS[band as keyof typeof BAND_COLORS] || BAND_COLORS[5];

  return (
    <div className={`${colors.bg} rounded-2xl border ${colors.border} p-6`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`${colors.badge} w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0`}>
          {band}
        </div>
        <div>
          <h3 className="font-heading text-headline-sm text-on-surface">{title}</h3>
          <p className="text-body-sm text-on-surface-variant mt-0.5">{summary}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {criteria.map((c, i) => (
          <li key={i} className="flex items-start gap-2 text-body-sm text-on-surface">
            <span className="material-symbols-outlined text-[16px] mt-0.5 text-on-surface-variant shrink-0">check_circle</span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreTable({ data, title }: { data: { min: number; max: number; band: number }[]; title: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant">
        <h3 className="font-heading text-headline-sm text-on-surface">{title}</h3>
        <p className="text-body-sm text-on-surface-variant mt-1">40 questions total</p>
      </div>
      <div className="overflow-x-auto max-w-full">
        <table className="w-full min-w-max">
          <thead className="bg-surface-container-high">
            <tr>
              <th className="px-6 py-3 text-left text-label-sm font-semibold text-on-surface whitespace-nowrap">Correct Answers</th>
              <th className="px-6 py-3 text-left text-label-sm font-semibold text-on-surface whitespace-nowrap">Band Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {data.map((row) => {
              const colors = BAND_COLORS[row.band as keyof typeof BAND_COLORS] || BAND_COLORS[5];
              return (
                <tr key={row.band} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-3 text-body-sm text-on-surface whitespace-nowrap">
                    {row.min === row.max ? row.min : `${row.min} - ${row.max}`}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`${colors.badge} px-3 py-1 rounded-full text-label-sm font-semibold`}>
                      {row.band}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BandScoresPage() {
  const [activeTab, setActiveTab] = useState<"writing" | "speaking" | "reading-listening">("writing");

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="font-heading text-display-sm text-on-surface mb-3">IELTS Band Scores Explained</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Understand what each band score means and how your overall score is calculated.
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "writing", label: "Writing", icon: "edit_note" },
            { id: "speaking", label: "Speaking", icon: "record_voice_over" },
            { id: "reading-listening", label: "Reading & Listening", icon: "auto_stories" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-label-md font-medium transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "writing" && (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
                <div>
                  <p className="text-body-sm font-semibold text-on-surface">How Writing is scored</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Each essay is evaluated on 4 criteria: Task Achievement, Coherence & Cohesion, Vocabulary, and Grammar.
                    Your final score is the average of all four criteria, rounded to the nearest 0.5.
                  </p>
                </div>
              </div>
            </div>
            {WRITING_BANDS.map((b) => (
              <BandCard key={b.band} band={b.band} title={b.title} summary={b.summary} criteria={b.criteria} />
            ))}
          </div>
        )}

        {activeTab === "speaking" && (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
                <div>
                  <p className="text-body-sm font-semibold text-on-surface">How Speaking is scored</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    The Speaking test is evaluated on 4 criteria: Fluency & Coherence, Lexical Resource, Grammar, and Pronunciation.
                    Similar to Writing, your final score is the average of all four criteria.
                  </p>
                </div>
              </div>
            </div>
            {SPEAKING_BANDS.map((b) => (
              <BandCard key={b.band} band={b.band} title={b.title} summary={b.summary} criteria={b.criteria} />
            ))}
          </div>
        )}

        {activeTab === "reading-listening" && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
                <div>
                  <p className="text-body-sm font-semibold text-on-surface">How Reading & Listening are scored</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Both tests use only correct answers to calculate your band score. There are no partial marks.
                    Your score is converted to a band score using the tables below.
                  </p>
                </div>
              </div>
            </div>
            <ScoreTable data={READING_CORRECT} title="Reading (Academic & General Training)" />
            <ScoreTable data={LISTENING_CORRECT} title="Listening" />
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-outline-variant">
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 text-center">
            <h3 className="font-heading text-headline-sm text-on-surface mb-2">Ready to practice?</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Get instant feedback on your Writing and Speaking with our AI-powered evaluator.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 bg-primary text-on-primary font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              Start Free Trial
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
