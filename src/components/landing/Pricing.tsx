import { CheckoutButton } from "@/components/ui/CheckoutButton";

const plans = [
  {
    slug: "free", name: "Free", price: "$0", period: "/forever",
    description: "Perfect for trying out our AI accuracy. Band score only.",
    featured: false, badge: null,
    features: [
      { text: "4 daily evaluations", included: true },
      { text: "Overall band score only", included: true },
      { text: "Basic AI Feedback", included: true },
      { text: "IELTS question bank", included: true },
      { text: "Criterion breakdown", included: false },
      { text: "Grammar corrections", included: false },
    ],
    cta: "Get Started Free", href: "/register",
  },
  {
    slug: "exam_week_pass", name: "Exam Week Pass", price: "$4.99", period: "/7 days",
    description: "Full access for one week. Perfect if your exam is around the corner.",
    featured: false, badge: "GOOD DEAL",
    features: [
      { text: "30 daily evaluations", included: true },
      { text: "Advanced AI Feedback", included: true },
      { text: "Instant detailed feedback", included: true },
      { text: "7-day unlimited access", included: true },
      { text: "Grammar corrections", included: true },
    ],
    cta: "Get 7-Day Pass", href: "/register?plan=exam_week_pass",
  },
  {
    slug: "premium", name: "Premium", price: "$14.99", period: "/month",
    description: "Intensive preparation to reach your target score.",
    featured: true, badge: "MOST POPULAR",
    features: [
      { text: "30 daily evaluations", included: true },
      { text: "Advanced AI Feedback", included: true },
      { text: "Full criterion breakdown", included: true },
      { text: "Detailed grammar corrections", included: true },
      { text: "History & progress tracking", included: true },
    ],
    cta: "Subscribe", href: "/register?plan=premium",
  },
  {
    slug: "packs", name: "Credit Packs", price: "From $7.99", period: "",
    description: "Pay as you go. Credits never expire. No monthly subscription.",
    featured: false, badge: null,
    features: [
      { text: "10 evaluations \u00b7 $7.99", included: true },
      { text: "25 evaluations \u00b7 $14.99", included: true },
      { text: "Advanced AI Feedback", included: true },
      { text: "No daily limit", included: true },
      { text: "Instant feedback", included: true },
    ],
    cta: "Buy Credits", href: "/register?plan=packs",
  },
];

export function Pricing() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter bg-surface-container-low" id="pricing">
      <div className="section-container">
        <div className="text-center mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Simple, Transparent Pricing</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Plans designed to fit your study pace and exam date. Significantly more affordable than alternatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-start">
          {plans.map((plan) => (
            <div key={plan.slug}
              className={`bg-surface-container-lowest p-card-padding ghost-shadow flex flex-col h-full relative border ${
                plan.featured ? "border-primary/20" : "border-outline-variant/30"
              } ${plan.featured ? "xl:-translate-y-4" : ""}`}>
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
