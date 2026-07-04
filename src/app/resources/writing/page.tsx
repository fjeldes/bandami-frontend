"use client";

import Link from "next/link";
import { tipsData, getCategoryBySlug } from "@/data/tips";
import RichTextRenderer from "@/components/ui/RichTextRenderer";

export default function WritingResourcesPage() {
  const category = getCategoryBySlug("writing");

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant">Category not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
        <Link href="/resources" className="hover:text-primary transition-colors">
          Resources
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-heading text-headline-xl text-on-surface mb-4">
          IELTS {category.name} Tips
        </h1>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 mb-8">
          <RichTextRenderer content={category.overview} className="text-body-md text-on-surface-variant leading-relaxed" />
        </div>
      </div>

      <h2 className="font-heading text-title-large text-on-surface mb-4">Choose a topic</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {category.tips.map((tip) => (
          <Link
            key={tip.slug}
            href={`/resources/writing/${tip.slug}`}
            className="group bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 group-hover:bg-primary-container/50 transition-colors">
                <span className="material-symbols-outlined text-primary text-[24px]">{tip.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-title-medium text-title-medium text-on-surface mb-1 group-hover:text-primary transition-colors">
                  {tip.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {tip.summary}
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all self-center">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
