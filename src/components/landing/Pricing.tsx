import { CheckoutButton } from "@/components/ui/CheckoutButton";

const plans = [
  {
    slug: "free", name: "Free", price: "$0", period: "/forever",
    description: "3 evaluations/day. Writing all tasks + Speaking Part 1.",
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
    slug: "exam_week_pass", name: "Week Pass", price: "$2.99", period: "/7 days",
    description: "10 evaluations/day with advanced AI. All modules included.",
    featured: false, badge: "GOOD DEAL",
    features: [
      { text: "10 evaluations/day", included: true },
      { text: "Advanced AI (OpenAI)", included: true },
      { text: "All modules included", included: true },
      { text: "Instant score + feedback", included: true },
      { text: "Grammar corrections", included: true },
      { text: "Cancel anytime", included: true },
    ],
    cta: "Get Week Pass — $2.99", href: "/register?plan=exam_week_pass",
  },
  {
    slug: "premium", name: "Premium", price: "$14.99", period: "/month",
    description: "30 evaluations/day. Full detailed feedback. History & progress.",
    featured: true, badge: "MOST POPULAR",
    features: [
      { text: "30 evaluations/day", included: true },
      { text: "Advanced AI (OpenAI)", included: true },
      { text: "Full detailed feedback", included: true },
      { text: "Grammar with explanations", included: true },
      { text: "History & progress tracking", included: true },
      { text: "Unlimited Full Speaking Tests", included: true },
    ],
    cta: "Subscribe", href: "/register?plan=premium",
  },
];

export function Pricing() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter bg-surface-container-low" id="pricing">
      <div className="section-container">
        <div className="text-center mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Try Premium for $2.99</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Start with the Week Pass for just $2.99. After 7 days, upgrade to Premium at $14.99/month or continue with Free. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, idx) => (
            <div key={plan.slug}
              className={`bg-surface-container-lowest p-card-padding ghost-shadow flex flex-col h-full relative border animate-fade-in-up ${
                plan.featured ? "border-primary/20" : "border-outline-variant/30"
              } ${plan.featured ? "xl:-translate-y-4" : ""}`}
              style={{ animationDelay: `${0.4 + idx * 0.12}s` }}>
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary-container font-label-md text-label-md px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display-md text-display-md text-on-surface">{plan.price}</span>
                {plan.period && <span className="font-body-md text-body-md text-on-surface-variant">{plan.period}</span>}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8 pb-8 border-b border-outline-variant/30 flex-1">{plan.description}</p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] shrink-0" style={f.included ? { color: "#2563eb" } : { color: "#c3c6d7" }}>
                      {f.included ? "check_circle" : "cancel"}
                    </span>
                    <span className={`font-body-md text-body-md ${f.included ? "text-on-surface" : "text-on-surface-variant"}`}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton planSlug={plan.slug} label={plan.cta} featured={plan.featured} href={plan.href} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
