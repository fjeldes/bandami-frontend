import Link from "next/link";
import { FeedbackPreview } from "./FeedbackPreview";

export function Hero() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter text-center animate-fade-in-up">
      <div className="section-container flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed/30 border border-primary/10 text-primary font-label-md text-label-md mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Trusted by thousands of students
        </div>

        <h1 className="font-display-lg text-3xl sm:text-4xl md:text-display-lg text-on-surface max-w-4xl mx-auto mb-6 text-balance leading-tight">
          Prepare for Your IELTS Exam.
          <br />
          <span className="text-primary">Real results, no waiting.</span>
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
          Practice with real IELTS
          tasks and get instant band scores with feedback on your strengths and
          areas for improvement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-xl hover:scale-[0.98] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            Start for Free
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
          <a
            href="#pricing"
            className="bg-surface text-on-surface border border-outline-variant font-label-md text-label-md px-8 py-3.5 rounded-xl hover:bg-surface-container-high active:scale-[0.97] transition-all text-center"
          >
            View Plans
          </a>
        </div>

        <div className="mt-section-gap relative w-full max-w-4xl mx-auto h-[320px] sm:h-[380px] rounded-xl border border-outline-variant/50 bg-surface-container-lowest ghost-shadow overflow-hidden flex flex-col">
          <div className="h-9 sm:h-10 border-b border-outline-variant/50 bg-surface-container-low flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-secondary/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
          </div>
          <div className="flex-1 min-h-0">
            <FeedbackPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
