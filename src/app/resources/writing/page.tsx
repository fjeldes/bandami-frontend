"use client";

import Link from "next/link";
import { getCategoryBySlug } from "@/data/tips";
import { ChevronRight } from "lucide-react";
import WritingResources from "@/components/resources/WritingResources";

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
      <WritingResources />
    </div>
  );
}
