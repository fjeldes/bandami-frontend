import Link from "next/link";
import { FeedbackPreview } from "./FeedbackPreview";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-8 text-center animate-fade-in-up">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-medium mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-blue-400" />
          </span>
          Trusted by thousands of students
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white max-w-4xl mx-auto mb-6 text-balance leading-tight">
          Prepare for Your IELTS Exam.
          <br />
          <span className="text-blue-600 dark:text-blue-400">Real results, no waiting.</span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
          Practice with real IELTS
          tasks and get instant band scores with feedback on your strengths and
          areas for improvement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:scale-[0.98] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            Start for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#pricing"
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.97] transition-all text-center"
          >
            View Plans
          </a>
        </div>

        <div className="mt-16 relative w-full max-w-4xl mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
          <div className="h-10 sm:h-11 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          </div>
          <div className="flex-1 min-h-0">
            <FeedbackPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
