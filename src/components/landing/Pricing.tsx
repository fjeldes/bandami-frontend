import { CheckoutButton } from "@/components/ui/CheckoutButton";
import { CheckCircle, XCircle } from "lucide-react";

const plans = [
  {
    slug: "free",
    name: "Free",
    featured: false,
    badge: null,
    features: [
      { text: "Writing (all tasks)", included: true },
      { text: "Speaking Part 1", included: true },
      { text: "Instant band score", included: true },
      { text: "Basic feedback & strengths", included: true },
      { text: "Full criteria breakdown", included: false },
      { text: "Grammar corrections", included: false },
    ],
    cta: "Get Started Free",
    href: "/register",
  },
  {
    slug: "weekly_pro_pass",
    name: "Weekly Pro",
    featured: false,
    badge: null,
    features: [
      { text: "Unlimited practice", included: true },
      { text: "Detailed IELTS analysis", included: true },
      { text: "Personalized study plans", included: true },
      { text: "Progress tracking & history", included: true },
      { text: "Full criteria breakdown", included: true },
      { text: "Grammar corrections with explanations", included: true },
      { text: "All Speaking Parts (1, 2 & 3)", included: true },
      { text: "7-day full premium access", included: true },
    ],
    cta: "Get Weekly Pass",
    href: "/register?plan=weekly_pro_pass",
  },
  {
    slug: "premium",
    name: "Pro",
    featured: true,
    badge: "MOST POPULAR",
    features: [
      { text: "Unlimited practice", included: true },
      { text: "Detailed IELTS analysis", included: true },
      { text: "Personalized study plans", included: true },
      { text: "Progress tracking & history", included: true },
      { text: "Full criteria breakdown", included: true },
      { text: "Grammar corrections with explanations", included: true },
      { text: "All Speaking Parts (1, 2 & 3)", included: true },
      { text: "Personalized recommendations", included: true },
    ],
    cta: "Start your free trial",
    href: "/register?plan=premium",
  },
];

export function Pricing() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-slate-100 dark:bg-slate-900/50" id="pricing">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Start your 3-day free trial</h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            No charge today. Then $14.99/month + tax. Cancel anytime.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto items-stretch justify-center">
          {plans.map((plan, idx) => (
            <div
              key={plan.slug}
              className={`animate-fade-in-up flex flex-col relative ${plan.featured ? "flex-[3]" : "flex-[2]"}`}
              style={{ animationDelay: `${0.4 + idx * 0.12}s` }}
            >
              {plan.slug === "free" && (
                <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">$0</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-3">
                        {f.included ? (
                          <CheckCircle className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <XCircle className="w-5 h-5 shrink-0 text-slate-300 dark:text-slate-600" />
                        )}
                        <span className={`text-sm ${f.included ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <CheckoutButton planSlug={plan.slug} label={plan.cta} featured={false} href={plan.href} />
                </div>
              )}

              {plan.slug === "weekly_pro_pass" && (
                <div className="h-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 flex flex-col shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 mt-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">$4.99</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">one-time</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <CheckoutButton planSlug={plan.slug} label={plan.cta} featured={false} href={plan.href} />
                </div>
              )}

              {plan.slug === "premium" && (
                <div className="h-full bg-gradient-to-b from-blue-50 dark:from-indigo-500/10 to-white dark:to-slate-900 border-2 border-blue-500 dark:border-indigo-500 rounded-2xl p-7 shadow-xl flex flex-col relative">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl" />

                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 dark:bg-indigo-600 text-white text-xs font-bold px-5 py-1 rounded-full uppercase tracking-wider shadow-md z-10">
                    {plan.badge}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 mt-2">{plan.name}</h3>

                  <div className="mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">Free</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">for 3 days</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">$14.99</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">/month + tax after</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    No charge during trial. Cancel anytime.
                  </p>

                  <ul className="space-y-3.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 shrink-0 text-blue-600 dark:text-indigo-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <CheckoutButton planSlug={plan.slug} label={plan.cta} featured={true} href={plan.href} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
