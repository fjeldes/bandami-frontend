"use client";

import Link from "next/link";
import { tipsData, getCategoryBySlug } from "@/data/tips";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import { ChevronRight, PenTool, ArrowRight, BookOpen, Lightbulb } from "lucide-react";

const TIP_ICONS: Record<string, any> = {
  link: Lightbulb,
  article: BookOpen,
  analytics: Lightbulb,
  star: Lightbulb,
  mail: Lightbulb,
  "book-open": Lightbulb,
  "graduation-cap": Lightbulb,
  clock: Lightbulb,
};

export default function WritingResourcesPage() {
  const category = getCategoryBySlug("writing");

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500 dark:text-slate-400">Category not found</p>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Resources
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 dark:text-slate-200 font-medium">{category.name}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
            <PenTool className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            IELTS {category.name} Tips
          </h1>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/60 p-6 mb-8 shadow-sm">
          <RichTextRenderer content={category.overview} className="text-slate-600 dark:text-slate-300 leading-relaxed prose prose-slate dark:prose-invert" />
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-4">Choose a topic</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {category.tips.map((tip) => {
          const IconComponent = TIP_ICONS[tip.icon] || PenTool;
          return (
            <Link
              key={tip.slug}
              href={`/resources/writing/${tip.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/60 p-5 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                  <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tip.summary}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all self-center" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
