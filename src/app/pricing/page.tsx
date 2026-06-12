"use client";

import { Suspense } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { CheckoutButton } from "@/components/ui/CheckoutButton";
import { Navbar } from "@/components/landing/Navbar";

const plans = [
  {
    slug: "free",
    name: "Free",
    price: "$0",
    period: "",
    badge: "",
    features: ["Writing (all tasks)", "Speaking Part 1", "Instant band score", "Basic feedback & strengths"],
    featured: false,
  },
  {
    slug: "premium",
    name: "Pro",
    price: "$14.99",
    period: "month",
    badge: "",
    features: ["Unlimited practice", "Detailed IELTS analysis", "Personalized study plans", "Progress tracking & history", "Full criteria breakdown", "Grammar corrections with explanations", "All Speaking Parts (1, 2 & 3)", "Personalized recommendations"],
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
          <h1 className="text-headline-lg font-bold text-on-surface mb-4">Start your 3-day free trial</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            No charge today. Then $14.99/month + tax. Cancel anytime.
          </p>
          {isPremium && (
            <p className="text-label-sm text-primary font-semibold mt-3">You're currently on the Pro plan</p>
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
          <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto items-stretch justify-center">
            {visiblePlans.map((plan, idx) => (
              <div
                key={plan.slug}
                className={`animate-fade-in-up flex flex-col ${
                  plan.slug === "premium" ? "flex-[3]" : "flex-[2]"
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {plan.slug === "free" && (
                  <div className="h-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 flex flex-col shadow-sm">
                    <h3 className="text-headline-md font-bold text-on-surface mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-mono text-display-md font-extrabold text-primary">$0</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">check</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <CheckoutButton
                      planSlug={plan.slug}
                      label="Get Started Free"
                      featured={false}
                      href="/register"
                    />
                  </div>
                )}

                {plan.slug === "premium" && (
                  <>
                    {isPremium ? (
                      <div className="h-full bg-surface-container-lowest border border-primary rounded-2xl p-6 flex flex-col shadow-md">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider bg-primary text-on-primary shadow-md z-10">
                          Your Plan ✓
                        </div>
                        <h3 className="text-headline-md font-bold text-on-surface mb-1 mt-2">{plan.name}</h3>
                        <div className="font-mono text-display-md font-extrabold text-primary mb-6">Active</div>
                        <ul className="space-y-3 mb-8 flex-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">check</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="w-full text-center py-2.5 rounded-full bg-primary-fixed/30 text-primary text-label-sm font-semibold">Your current plan</div>
                      </div>
                    ) : (
                      <div className="h-full bg-gradient-to-b from-primary/5 to-surface-container-lowest border-2 border-primary rounded-2xl p-7 shadow-xl flex flex-col relative">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-5 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider shadow-md z-10">
                          MOST POPULAR
                        </div>

                        <h3 className="text-headline-md font-bold text-on-surface mb-1 mt-2">{plan.name}</h3>

                        <div className="mb-2">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-display-lg font-extrabold text-primary">Free</span>
                            <span className="text-body-md text-on-surface font-semibold">for 3 days</span>
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="font-mono text-display-sm text-on-surface font-bold">$14.99</span>
                            <span className="text-body-md text-on-surface-variant">/month + tax after</span>
                          </div>
                        </div>

                        <p className="text-body-md text-on-surface-variant mb-6 pb-6 border-b border-outline-variant/20">
                          No charge during trial. Cancel anytime.
                        </p>

                        <ul className="space-y-3 mb-8 flex-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">check_circle</span>
                              <span className="text-body-md text-on-surface font-medium">{f}</span>
                            </li>
                          ))}
                        </ul>

                        <CheckoutButton
                          planSlug={plan.slug}
                          label="Start your free trial"
                          featured={true}
                          href="/register"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {!isPremium && (
          <div className="mt-12 text-center">
            <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
              <span className="font-semibold text-on-surface">No charge today.</span> Start your 3-day free trial. Then $14.99/month + tax. Cancel anytime.
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
