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
    slug: "premium",
    name: "Premium",
    price: "$14.99",
    period: "month",
    badge: "",
    features: ["30 evaluations/day", "All modules included", "Advanced AI (OpenAI)", "Full detailed feedback", "Grammar corrections with explanations", "History & progress tracking", "Unlimited Full Speaking Tests", "Cancel anytime"],
    trialPrice: "$2.99",
    trialPeriod: "first week",
    featured: true,
  },
];

function PricingContent() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const tier = user?.subscription_tier || "free";
  const isPremium = tier === "premium";

  let visiblePlans = plans;
  if (user) {
    visiblePlans = plans
      .filter((p) => p.slug !== "free")
      .map((p) => {
        if (isPremium && p.slug === "premium") {
          return { ...p, price: "Active", period: "", badge: "Your Plan ✓", featured: true };
        }
        return p;
      });
  }

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-headline-lg font-bold text-on-surface mb-4">Try Premium for $2.99</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Your first week of Premium is just $2.99. After 7 days, it's $14.99/month. Cancel anytime.
          </p>
          {isPremium && (
            <p className="text-label-sm text-primary font-semibold mt-3">You're currently on the Premium plan</p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 w-[340px]">
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
                  width: "min(340px, 100%)",
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                {plan.slug === "premium" && !(plan as any).badge?.includes("Your Plan") && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider bg-primary text-on-primary">
                    MOST POPULAR
                  </div>
                )}
                {(plan as any).badge?.includes("Your Plan") && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider bg-primary text-on-primary">
                    {(plan as any).badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-headline-md font-bold text-on-surface mb-1">{plan.name}</h3>

                  {plan.slug === "premium" && isPremium ? (
                    <div className="font-mono text-display-md font-extrabold text-primary">Active</div>
                  ) : plan.slug === "premium" ? (
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-mono text-display-md font-extrabold text-primary line-through">$14.99</span>
                        <span className="font-mono text-display-md font-extrabold text-primary">$2.99</span>
                      </div>
                      <p className="text-label-sm text-on-surface-variant">first week · then $14.99/month</p>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-display-md font-extrabold text-primary">{plan.price}</span>
                      {plan.period && <span className="text-label-sm text-on-surface-variant">/{plan.period}</span>}
                    </div>
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
                    label={plan.slug === "premium" ? "Start with $2.99" : "Get Started Free"}
                    featured={plan.featured}
                    href="/register"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {!isPremium && (
          <div className="mt-12 text-center">
            <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
              <span className="font-semibold text-on-surface">Cancel anytime.</span> You'll be charged $2.99 today for your first week. After 7 days, $14.99/month. No commitment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>}><PricingContent /></Suspense>;
}
