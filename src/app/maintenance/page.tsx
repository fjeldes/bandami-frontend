import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Under Maintenance",
  description:
    "Bandami is temporarily unavailable while we perform scheduled maintenance. We'll be back soon.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-surface px-4 py-12 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary opacity-10 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-secondary opacity-10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary opacity-5 blur-3xl" />
      </div>

      <section className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-card sm:p-12">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-white p-3 shadow-sm ring-1 ring-outline-variant">
          <Image
            src="/bandami.png"
            alt="Bandami"
            width={160}
            height={160}
            priority
            className="h-full w-full object-contain"
          />
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent-container px-4 py-1.5 text-label-sm uppercase tracking-wider text-on-accent-container">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          Scheduled maintenance
        </span>

        <h1 className="mt-6 font-heading text-headline-lg text-on-surface sm:text-display-lg">
          We&apos;ll be back soon
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-body-lg text-on-surface-variant">
          We&apos;re making a few improvements to Bandami. The site is temporarily
          unavailable while we complete this maintenance. Thanks for your
          patience — we&apos;ll be back shortly.
        </p>

        <div className="mx-auto mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/maintenance"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            Check again
          </a>
          <a
            href="mailto:contacto@bandami.com"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant px-6 py-3 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-low sm:w-auto"
          >
            Contact support
          </a>
        </div>

        <p className="mt-8 text-label-sm text-on-surface-variant">
          Thank you for your understanding.
        </p>
      </section>
    </main>
  );
}
