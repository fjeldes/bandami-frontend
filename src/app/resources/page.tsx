"use client";

import Link from "next/link";
import { tipsData } from "@/data/tips";
import { PenTool, Mic, BookOpen, ArrowRight } from "lucide-react";

const categoryIcons: Record<string, any> = {
  writing: PenTool,
  speaking: Mic,
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  writing: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  speaking: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
};

export default function ResourcesPage() {
  const activeCategories = tipsData.filter((c) => c.tips.length > 0);

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">Resources</h1>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl">
          Boost your IELTS preparation with tips, strategies, and vocabulary guides for each skill.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeCategories.map((category) => {
          const Icon = categoryIcons[category.slug] || BookOpen;
          const colors = categoryColors[category.slug] || { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" };

          return (
            <Link
              key={category.slug}
              href={`/resources/${category.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name} Tips
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {category.overview.replace(/<[^>]*>/g, "").slice(0, 120)}...
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {activeCategories.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Resources coming soon</p>
        </div>
      )}
    </div>
  );
}
