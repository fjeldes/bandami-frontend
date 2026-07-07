import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipBySlug } from "@/data/tips";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import { ChevronRight, ArrowLeft, PenTool } from "lucide-react";

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = getTipBySlug("writing", slug);

  if (!tip) {
    notFound();
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Resources
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/resources/writing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Writing
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-white font-medium">{tip.title}</span>
      </nav>

      <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-5 border-b border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Writing Tip</p>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{tip.title}</h1>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <RichTextRenderer content={tip.content} className="prose prose-lg max-w-none" />

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <Link
              href="/resources/writing"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Writing Tips
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
