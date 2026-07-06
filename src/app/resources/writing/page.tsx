"use client";

import Link from "next/link";
import { tipsData, getCategoryBySlug } from "@/data/tips";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import { ChevronRight, PenTool, ArrowRight } from "lucide-react";

export default function WritingResourcesPage() {
  const category = getCategoryBySlug("writing");

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Category not found</p>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/resources" className="hover:text-blue-600 transition-colors">
          Resources
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{category.name}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <PenTool className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            IELTS {category.name} Tips
          </h1>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <RichTextRenderer content={category.overview} className="text-slate-600 leading-relaxed" />
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-4">Choose a topic</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {category.tips.map((tip) => (
          <Link
            key={tip.slug}
            href={`/resources/writing/${tip.slug}`}
            className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <PenTool className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {tip.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {tip.summary}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-center" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
