import Link from "next/link";

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
          3 free evaluations daily. No credit card required. Practice with real IELTS
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

        <div className="mt-section-gap relative w-full max-w-4xl mx-auto h-[280px] sm:h-[400px] rounded-xl border border-outline-variant/50 bg-surface-container-lowest ghost-shadow overflow-hidden flex flex-col">
          <div className="h-10 sm:h-12 border-b border-outline-variant/50 bg-surface-container-low flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-error/30" />
            <div className="w-3 h-3 rounded-full bg-secondary/30" />
            <div className="w-3 h-3 rounded-full bg-primary/30" />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6">
            <div className="sm:w-2/3 h-full rounded border border-outline-variant/50 bg-surface-container-lowest p-4 sm:p-6">
              <div className="h-3 sm:h-4 bg-surface-container rounded w-3/4 mb-3 sm:mb-4" />
              <div className="h-3 sm:h-4 bg-surface-container rounded w-full mb-2" />
              <div className="h-3 sm:h-4 bg-surface-container rounded w-5/6 mb-2" />
              <div className="h-3 sm:h-4 bg-surface-container rounded w-full mb-2" />
              <div className="h-3 sm:h-4 bg-surface-container rounded w-4/5" />
            </div>
            <div className="sm:w-1/3 h-full rounded border border-primary/10 bg-primary-fixed/10 p-3 sm:p-4 flex flex-row sm:flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
                <span className="font-mono text-data-md text-primary">Band 7.5</span>
              </div>
              <div className="h-2 bg-primary-fixed rounded-full w-full hidden sm:block">
                <div className="h-full bg-primary rounded-full w-[75%]" />
              </div>
              <div className="space-y-2 mt-auto hidden sm:block">
                <div className="h-3 bg-surface-container rounded w-full" />
                <div className="h-3 bg-surface-container rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
