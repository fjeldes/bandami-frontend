"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { CheckoutButton } from "@/components/ui/CheckoutButton";
import { Navbar } from "@/components/landing/Navbar";

const plans = [
  {
    slug: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    badge: "",
    features: ["3 evaluations/day", "Writing (all tasks)", "Speaking Part 1 only", "Instant band score", "Basic AI (Gemini)"],
    featured: false,
  },
  {
    slug: "exam_week_pass",
    name: "Week Pass",
    price: "$2.99",
    period: "7 days",
    badge: "Best Value",
    features: ["10 evaluations/day", "All modules included", "Advanced AI (OpenAI)", "Instant score + feedback", "Grammar corrections", "No commitment — cancel anytime"],
    featured: true,
  },
  {
    slug: "premium",
    name: "Premium",
    price: "$14.99",
    period: "month",
    badge: "",
    features: ["30 evaluations/day", "All modules included", "Advanced AI (OpenAI)", "Full detailed feedback", "Grammar corrections with explanations", "History & progress tracking", "Unlimited Full Speaking Tests", "Cancel anytime"],
    featured: false,
  },
];

function PricingContent() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();
  const tier = user?.subscription_tier || "free";
  const hasDiscount = (user?.referral_discounts || 0) > 0;
  const isPremium = tier === "premium";

  let visiblePlans = plans;
  if (user) {
    visiblePlans = plans
      .filter((p) => p.slug !== "free")
      .map((p) => {
        if (isPremium && p.slug === "premium") {
          return { ...p, price: "Active", period: "", badge: "Your Plan ✓", featured: true };
        }
        if (isPremium && p.slug === "exam_week_pass") {
          return null;
        }
        if (hasDiscount && p.slug === "exam_week_pass" && !isPremium) {
          return { ...p, price: "$1.50", badge: "50% Off", featured: true, discountLabel: "Referral discount · 50% off" };
        }
        return p;
      })
      .filter(Boolean) as typeof plans;
  }

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-headline-lg font-bold text-on-surface mb-4">Try Premium for $2.99</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Start with the Week Pass for just $2.99. After 7 days, upgrade to Premium at $14.99/month or continue with Free. Cancel anytime.
          </p>
          {isPremium && (
            <p className="text-label-sm text-primary font-semibold mt-3">You're currently on the {tier === "premium" ? "Premium" : "Free"} plan</p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-surface-container-high rounded-lg w-2/3" />
                  <div className="h-10 bg-surface-container-high rounded-lg w-1/2" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (<div key={j} className="h-4 bg-surface-container-high rounded w-full" />))}
                  </div>
                  <div className="h-12 bg-surface-container-high rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 items-start">
            {visiblePlans.map((plan, idx) => (
              <div
                key={plan.slug}
                className={`relative bg-surface-container-lowest border rounded-2xl p-6 flex flex-col h-full hover:shadow-lg animate-fade-in-up ${
                  plan.featured ? "border-primary shadow-md md:-translate-y-2" : "border-outline-variant/30"
                }`}
                style={{
                  width: visiblePlans.length <= 2 ? "min(340px, 100%)" : "min(280px, 100%)",
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider ${
                    plan.slug === "premium" && isPremium ? "bg-primary text-on-primary" : plan.featured ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-headline-md font-bold text-on-surface mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    {(plan as any).discountLabel ? (
                      <>
                        <span className="font-mono text-display-md font-extrabold text-primary">{plan.price}</span>
                        <span className="text-label-sm text-on-surface-variant line-through">$2.99</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-display-md font-extrabold text-primary">{plan.price}</span>
                        {plan.period && <span className="text-label-sm text-on-surface-variant">/{plan.period}</span>}
                      </>
                    )}
                  </div>
                  {(plan as any).discountLabel && (
                    <p className="text-label-sm text-primary font-semibold mt-1">{(plan as any).discountLabel}</p>
                  )}
                </div>

                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">check</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isPremium && plan.slug === "premium" ? (
                  <div className="w-full text-center py-2.5 rounded-full bg-primary-fixed/30 text-primary text-label-sm font-semibold">Your current plan</div>
                ) : (
                  <CheckoutButton
                    planSlug={plan.slug}
                    label={plan.slug === "exam_week_pass" && (plan as any).discountLabel ? "Get Week Pass — $1.50" : plan.slug === "exam_week_pass" ? "Start with $2.99" : "Subscribe"}
                    featured={plan.featured}
                    href="/register"
                    discountPercent={plan.slug === "exam_week_pass" && (plan as any).discountLabel ? 50 : undefined}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>}><PricingContent /></Suspense>;
}
