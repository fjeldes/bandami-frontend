import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipBySlug } from "@/data/tips";
import { ChevronRight } from "lucide-react";
import WritingTipDetail from "@/components/resources/WritingTipDetail";

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = getTipBySlug("writing", slug);

  if (!tip) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Resources
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/resources/writing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Writing Tips
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">{tip.title}</span>
      </nav>
      <WritingTipDetail slug={slug} basePath="/resources" />
    </div>
  );
}
