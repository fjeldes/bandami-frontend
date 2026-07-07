"use client";

import Link from "next/link";
import { tipsData } from "@/data/tips";
import { PenTool, Mic, BookOpen, ArrowRight, Library } from "lucide-react";

const categoryIcons: Record<string, any> = {
  writing: PenTool,
  speaking: Mic,
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  writing: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  speaking: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
};

export default function AdminResourcesPage() {
  const activeCategories = tipsData.filter((c) => c.tips.length > 0);

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <Library className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Resources</h1>
        </div>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl">
          Manage IELTS tips and resources available to all users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeCategories.map((category) => {
          const Icon = categoryIcons[category.slug] || BookOpen;
          const colors = categoryColors[category.slug] || { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" };

          return (
            <div
              key={category.slug}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {category.name} Tips
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {category.tips.length} tip{category.tips.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {category.tips.map((tip) => (
                  <Link
                    key={tip.slug}
                    href={`/resources/${category.slug}/${tip.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{tip.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{tip.summary}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>

              <Link
                href={`/resources/${category.slug}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                View Public Page
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {activeCategories.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No resources available</p>
        </div>
      )}
    </div>
  );
}
