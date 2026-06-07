import { CheckoutButton } from "@/components/ui/CheckoutButton";

const plans = [
  {
    slug: "free", name: "Free",
    featured: false, badge: null,
    features: [
      { text: "3 daily evaluations", included: true },
      { text: "Writing (all tasks)", included: true },
      { text: "Speaking Part 1 only", included: true },
      { text: "Instant band score", included: true },
      { text: "Basic AI (Gemini)", included: true },
      { text: "Full criteria breakdown", included: false },
      { text: "Grammar corrections", included: false },
    ],
    cta: "Get Started Free", href: "/register",
  },
  {
    slug: "premium", name: "Premium",
    featured: true, badge: "MOST POPULAR",
    features: [
      { text: "30 evaluations/day", included: true },
      { text: "Advanced AI (OpenAI)", included: true },
      { text: "Full detailed feedback", included: true },
      { text: "Grammar with explanations", included: true },
      { text: "History & progress tracking", included: true },
      { text: "Unlimited Full Speaking Tests", included: true },
    ],
    cta: "Start with $2.99", href: "/register?plan=premium",
  },
];

export function Pricing() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter bg-surface-container-low" id="pricing">
      <div className="section-container">
        <div className="text-center mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Try Premium for $2.99</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Your first week is just $2.99. Then $14.99/month. Cancel anytime.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto items-stretch justify-center">
          {plans.map((plan, idx) => (
            <div key={plan.slug}
              className={`animate-fade-in-up flex flex-col relative ${
                plan.featured ? "flex-[3]" : "flex-[2]"
              }`}
              style={{ animationDelay: `${0.4 + idx * 0.12}s` }}>

              {plan.slug === "free" && (
                <div className="h-full bg-surface-container-lowest ghost-shadow border border-outline-variant/30 rounded-2xl p-6 flex flex-col">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-display-md text-display-md text-on-surface font-bold">$0</span>
                    <span className="font-body-md text-body-md text-on-surface-variant">/forever</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] shrink-0" style={f.included ? { color: "#2563eb" } : { color: "#c3c6d7" }}>
                          {f.included ? "check_circle" : "cancel"}
                        </span>
                        <span className={`font-body-md text-body-md ${f.included ? "text-on-surface" : "text-on-surface-variant"}`}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <CheckoutButton planSlug={plan.slug} label={plan.cta} featured={false} href={plan.href} />
                </div>
              )}

              {plan.slug === "premium" && (
                <div className="h-full bg-gradient-to-b from-primary/5 to-surface-container-lowest border-2 border-primary rounded-2xl p-7 shadow-xl flex flex-col relative">
                  {/* Decorative accent */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-md text-label-md px-5 py-1 rounded-full font-bold uppercase tracking-wider shadow-md z-10">
                    {plan.badge}
                  </div>

                  <h3 className="font-headline-md text-headline-md text-on-surface mb-1 mt-2">{plan.name}</h3>

                  {/* Price: $2.99 first week + $14.99 struck */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display-lg text-display-lg text-primary font-extrabold">$2.99</span>
                      <span className="font-body-md text-body-md text-on-surface font-semibold">first week</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-display-sm text-display-sm text-on-surface-variant line-through">$14.99</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">/month after</span>
                    </div>
                  </div>

                  {/* Saving badge */}
                  <div className="inline-flex self-start items-center gap-1.5 bg-primary/10 text-primary font-label-md text-label-sm font-semibold px-3 py-1 rounded-full mb-5">
                    <span className="material-symbols-outlined text-[16px]">local_offer</span>
                    Save 80% this week
                  </div>

                  <p className="font-body-md text-body-md text-on-surface-variant mb-6 pb-6 border-b border-outline-variant/20">
                    Cancel anytime. You'll be charged $2.99 today, then $14.99/month after 7 days.
                  </p>

                  <ul className="space-y-3.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] shrink-0 text-primary">
                          check_circle
                        </span>
                        <span className="font-body-md text-body-md text-on-surface font-medium">{f.text}</span>
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
