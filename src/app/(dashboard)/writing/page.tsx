"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, BarChart3, RotateCcw, Play, BookOpen, MessageSquare } from "lucide-react";
import { getQuestions, getUserExams } from "@/lib/api";
import type { Question } from "@/lib/types";

const CATEGORY_CONFIG = {
  task1_academic: {
    color: "blue",
    bgLight: "bg-blue-50",
    bgContainer: "bg-blue-100/50",
    textDark: "text-blue-700",
    textLight: "text-blue-600",
    ring: "ring-blue-200",
    border: "border-blue-200",
    icon: FileText,
    label: "Task 1",
    sublabel: "Report",
  },
  task1_general: {
    color: "emerald",
    bgLight: "bg-emerald-50",
    bgContainer: "bg-emerald-100/50",
    textDark: "text-emerald-700",
    textLight: "text-emerald-600",
    ring: "ring-emerald-200",
    border: "border-emerald-200",
    icon: MessageSquare,
    label: "Task 1",
    sublabel: "Letter",
  },
  task2: {
    color: "violet",
    bgLight: "bg-violet-50",
    bgContainer: "bg-violet-100/50",
    textDark: "text-violet-700",
    textLight: "text-violet-600",
    ring: "ring-violet-200",
    border: "border-violet-200",
    icon: BookOpen,
    label: "Task 2",
    sublabel: "Essay",
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

function getCategoryKey(taskType: string | undefined, module: string | undefined): CategoryKey {
  if (taskType === "task2") return "task2";
  if (module === "academic") return "task1_academic";
  return "task1_general";
}

function BandScore({ score }: { score: number }) {
  const getBandColor = (band: number) => {
    if (band >= 8) return "text-emerald-600 bg-emerald-50";
    if (band >= 6.5) return "text-blue-600 bg-blue-50";
    if (band >= 5.5) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-sm font-bold ${getBandColor(score)}`}>
      <BarChart3 className="w-3.5 h-3.5" />
      {score.toFixed(1)}
    </div>
  );
}

function TaskCard({ question, isTaken, bestScore, index }: { question: Question; isTaken: boolean; bestScore?: number; index: number }) {
  const categoryKey = getCategoryKey(question.task_type, question.module);
  const config = CATEGORY_CONFIG[categoryKey];
  const Icon = config.icon;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
    >
      {/* Color accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${config.color}-500`} />

      {/* Card content */}
      <div className="p-5 pl-6 flex flex-col flex-grow">
        {/* Header: Icon + Category badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.bgLight} flex items-center justify-center shadow-sm`}>
              <Icon className={`w-5 h-5 ${config.textDark}`} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.bgLight} ${config.textDark} ring-1 ${config.ring}`}>
                  {config.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgContainer} ${config.textLight}`}>
                  {config.sublabel}
                </span>
              </div>
            </div>
          </div>
          {isTaken && bestScore != null && <BandScore score={bestScore} />}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors line-clamp-2 flex-grow">
          {question.title || "Writing Practice Task"}
        </h3>

        {/* Footer: Action */}
        <div className="pt-4 border-t border-slate-100 mt-auto">
          {isTaken ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Best score</span>
              </div>
              <Link
                href={`/writing/test?id=${question.id}`}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${config.bgLight} ${config.textDark} hover:shadow-md active:scale-95 hover:-translate-y-0.5`}
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </Link>
            </div>
          ) : (
            <Link
              href={`/writing/test?id=${question.id}`}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-200 bg-slate-800 hover:bg-slate-900 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5`}
            >
              <Play className="w-4 h-4" />
              Start Test
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WritingListPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "task1" | "task2">("all");
  const [moduleFilter, setModuleFilter] = useState<"all" | "general" | "academic">("all");

  useEffect(() => {
    Promise.all([getQuestions({ exam_type: "writing" }), getUserExams({ limit: 100 })])
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

  const filtered = questions.filter((q) => {
    if (filter !== "all" && q.task_type !== filter) return false;
    if (moduleFilter !== "all" && q.module !== moduleFilter) return false;
    return true;
  });

  const filterTabs = [
    { key: "all" as const, label: "All Tasks", icon: BookOpen },
    { key: "task1" as const, label: "Task 1", icon: FileText },
    { key: "task2" as const, label: "Task 2", icon: MessageSquare },
  ];

  const moduleTabs = [
    { key: "all" as const, label: "All Modules" },
    { key: "academic" as const, label: "Academic" },
    { key: "general" as const, label: "General Training" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Writing Practice</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Master IELTS Writing with timed practice. Get instant feedback on Task 1 reports and Task 2 essays.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-1.5 mb-6 inline-flex">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Module Pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {moduleTabs.map((tab) => {
            const isActive = moduleFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setModuleFilter(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Stats bar */}
        {!loading && !error && (
          <div className="flex items-center gap-4 mb-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Task 1 Academic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Task 1 General
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              Task 2
            </span>
            <span className="ml-auto">{filtered.length} tasks</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">!</span>
            </div>
            <p className="text-body-md text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-body-md text-slate-500">No tasks found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((q, idx) => (
              <TaskCard
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
