"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipBySlug } from "@/data/tips";
import RichTextRenderer from "@/components/ui/RichTextRenderer";

export default function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const tip = getTipBySlug("writing", slug);

  if (!tip) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
        <Link href="/resources" className="hover:text-primary transition-colors">
          Resources
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/resources/writing" className="hover:text-primary transition-colors">
          Writing
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface">{tip.title}</span>
      </nav>

      <article className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="bg-primary-container/20 px-6 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">{tip.icon}</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Writing Tip</p>
              <h1 className="font-heading text-headline-md text-on-surface">{tip.title}</h1>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <RichTextRenderer content={tip.content} className="prose prose-lg max-w-none" />

          <div className="mt-8 pt-6 border-t border-outline-variant/30">
            <Link
              href="/resources/writing"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-label-md"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Writing Tips
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
