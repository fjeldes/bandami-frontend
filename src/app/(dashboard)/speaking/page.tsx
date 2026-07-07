"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, MessageCircle, Brain, Zap, RotateCcw, Play, Lock, BarChart3 } from "lucide-react";
import { getQuestions, getUserExams } from "@/lib/api";
import type { Question } from "@/lib/types";
import { useAuthStore } from "@/hooks/useAuth";

const PART_CONFIG = {
  part1: {
    color: "blue",
    bgLight: "bg-blue-50",
    bgContainer: "bg-blue-100/50",
    textDark: "text-blue-700",
    textLight: "text-blue-600",
    ring: "ring-blue-200",
    border: "border-blue-200",
    icon: MessageCircle,
    label: "Part 1",
    sublabel: "Interview",
  },
  part2: {
    color: "indigo",
    bgLight: "bg-indigo-50",
    bgContainer: "bg-indigo-100/50",
    textDark: "text-indigo-700",
    textLight: "text-indigo-600",
    ring: "ring-indigo-200",
    border: "border-indigo-200",
    icon: Brain,
    label: "Part 2",
    sublabel: "Long Turn",
  },
  part3: {
    color: "amber",
    bgLight: "bg-amber-50",
    bgContainer: "bg-amber-100/50",
    textDark: "text-amber-700",
    textLight: "text-amber-600",
    ring: "ring-amber-200",
    border: "border-amber-200",
    icon: Zap,
    label: "Part 3",
    sublabel: "Discussion",
  },
  general: {
    color: "emerald",
    bgLight: "bg-emerald-50",
    bgContainer: "bg-emerald-100/50",
    textDark: "text-emerald-700",
    textLight: "text-emerald-600",
    ring: "ring-emerald-200",
    border: "border-emerald-200",
    icon: Mic,
    label: "General",
    sublabel: "Practice",
  },
} as const;

type PartKey = keyof typeof PART_CONFIG;

function getPartKey(module: string | undefined): PartKey {
  const key = (module || "part2") as PartKey;
  return PART_CONFIG[key] ? key : "part2";
}

function BandBadge({ score }: { score: number }) {
  const getBandColor = (band: number) => {
    if (band >= 8) return { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" };
    if (band >= 6.5) return { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" };
    if (band >= 5.5) return { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" };
    return { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-200" };
  };
  const colors = getBandColor(score);
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-sm font-bold ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
      <BarChart3 className="w-3.5 h-3.5" />
      {score.toFixed(1)}
    </div>
  );
}

function PartBadge({ config }: { config: (typeof PART_CONFIG)[keyof typeof PART_CONFIG] }) {
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-7 h-7 rounded-lg ${config.bgLight} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${config.textDark}`} />
      </div>
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.bgLight} ${config.textDark} ring-1 ${config.ring}`}>
        {config.label}
      </span>
      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${config.bgContainer} ${config.textLight}`}>
        {config.sublabel}
      </span>
    </div>
  );
}

function SpeakingCard({ question, isTaken, bestScore, index }: { question: Question; isTaken: boolean; bestScore?: number; index: number }) {
  const partKey = getPartKey(question.module);
  const config = PART_CONFIG[partKey];

  return (
    <div
      className="group relative flex flex-col dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
    >
      {/* Color accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${config.color}-500`} />

      <div className="p-5 pl-6 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <PartBadge config={config} />
          {isTaken && bestScore != null && <BandBadge score={bestScore} />}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold dark:text-white mb-3 group-hover:dark:text-white transition-colors flex-grow line-clamp-2">
          {question.title || "Speaking Practice Topic"}
        </h3>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          {isTaken ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Previous best</span>
              <Link
                href={`/speaking/test?id=${question.id}`}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${config.bgLight} ${config.textDark} hover:shadow-md active:scale-95 hover:-translate-y-0.5`}
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </Link>
            </div>
          ) : (
            <Link
              href={`/speaking/test?id=${question.id}`}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-200 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 group`}
            >
              <Mic className="w-4 h-4 group-hover:animate-pulse transition-transform" />
              Start Test
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SpeakingListPage() {
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.subscription_tier === "premium";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isFree = !isPremium && user?.role !== "admin";
  const [filter, setFilter] = useState<"all" | "part1" | "part2" | "part3">(isFree ? "part1" : "all");

  useEffect(() => {
    Promise.all([getQuestions({ exam_type: "speaking" }), getUserExams({ limit: 100 })])
      .then(([qs, result]) => {
        setQuestions(qs);
        const taken = new Set<string>();
        const scoreMap: Record<string, number> = {};
        for (const exam of result.exams) {
          if (exam.question_id) {
            taken.add(exam.question_id);
            const ev = exam.evaluations?.[0];
            if (ev?.overall_band != null) {
              const cur = scoreMap[exam.question_id];
              if (cur == null || ev.overall_band > cur) scoreMap[exam.question_id] = ev.overall_band;
            }
          }
        }
        setTakenIds(taken);
        setScores(scoreMap);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? questions : questions.filter((q) => (q.module || "part2") === filter);

  const filterTabs = [
    { key: "all" as const, label: "All Parts", icon: Mic },
    { key: "part1" as const, label: "Part 1", icon: MessageCircle },
    { key: "part2" as const, label: "Part 2", icon: Brain },
    { key: "part3" as const, label: "Part 3", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Speaking Practice</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Master IELTS Speaking with timed practice. Build confidence across all three parts of the exam.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-1.5 mb-6 inline-flex">
          {filterTabs
            .filter((tab) => !(isFree && tab.key !== "part1"))
            .map((tab) => {
              const isActive = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 dark:bg-slate-800 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
        </div>

        {/* Premium lock banner */}
        {isFree && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Unlock Speaking Part 2 & 3</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get unlimited access with{" "}
                <a href="/pricing" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Pro (3-day free trial — then $14.99/month + tax)</a>
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        {!loading && !error && (
          <div className="flex items-center gap-4 mb-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Part 1
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Part 2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Part 3
            </span>
            <span className="ml-auto">{filtered.length} topics</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-1.5 mb-6 inline-flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
            <div className="mb-6 h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="p-5 pl-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                          <div className="w-16 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="w-2/3 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="w-full h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-red-500">!</span>
            </div>
            <p className="text-body-md text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-900 dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <Mic className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-body-md text-slate-500 dark:text-slate-400">No topics found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((q, idx) => (
              <SpeakingCard
                key={q.id}
                question={q}
                isTaken={takenIds.has(q.id)}
                bestScore={scores[q.id]}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
