"use client";

import Link from "next/link";
import { tipsData } from "@/data/tips";

const categoryIcons: Record<string, string> = {
  writing: "edit_note",
  speaking: "record_voice_over",
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  writing: { bg: "bg-blue-500/10", text: "text-blue-500" },
  speaking: { bg: "bg-purple-500/10", text: "text-purple-500" },
};

export default function ResourcesPage() {
  const activeCategories = tipsData.filter((c) => c.tips.length > 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-headline-xl text-on-surface mb-4">Resources</h1>
        <p className="text-body-lg text-on-surface-variant">
          Boost your IELTS preparation with tips, strategies, and vocabulary guides for each skill.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeCategories.map((category) => {
          const icon = categoryIcons[category.slug] || "school";
          const colors = categoryColors[category.slug] || { bg: "bg-primary/10", text: "text-primary" };

          return (
            <Link
              key={category.slug}
              href={`/resources/${category.slug}`}
              className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <span className={`material-symbols-outlined ${colors.text} text-[28px]`}>{icon}</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-title-large text-title-large text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {category.name} Tips
                  </h2>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-2">
                    {category.overview.replace(/<[^>]*>/g, "").slice(0, 120)}...
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-label-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {activeCategories.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">school</span>
          <p className="text-on-surface-variant">Resources coming soon</p>
        </div>
      )}
    </div>
  );
}
