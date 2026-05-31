"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { CheckoutButton } from "@/components/ui/CheckoutButton";

const plans = [
  {
    slug: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    badge: "",
    features: ["4 evaluations/day", "Overall band score", "General feedback", "Basic AI (Gemini)"],
    featured: false,
  },
  {
    slug: "exam_week_pass",
    name: "Exam Week Pass",
    price: "$4.99",
    period: "7 days",
    badge: "Good Deal",
    features: ["30 evaluations/day", "Full criteria breakdown", "Instant detailed feedback", "Advanced AI (GPT-4o)", "Grammar corrections", "No commitment"],
    featured: false,
  },
  {
    slug: "premium",
    name: "Premium",
    price: "$14.99",
    period: "month",
    badge: "Most Popular",
    features: ["30 evaluations/day", "Full criteria breakdown", "Instant detailed feedback", "Advanced AI (GPT-4o)", "Grammar corrections", "Progress tracking", "Full Speaking Test"],
    featured: true,
  },
  {
    slug: "packs",
    name: "Credit Packs",
    price: "From $7.99",
    period: "",
    badge: "",
    features: ["10 or 25 evaluations", "No daily limit", "Never expire", "Advanced AI (GPT-4o)", "Full feedback included"],
    featured: false,
  },
];

function PricingContent() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-headline-lg font-bold text-on-surface mb-4">Choose Your Plan</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Start free or upgrade for unlimited practice with instant, detailed AI feedback.
          </p>
          {user && (
            <p className="text-label-sm text-on-surface-variant mt-3">
              Current plan: <span className="font-semibold text-primary capitalize">{user.subscription_tier}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`relative bg-surface-container-lowest border rounded-2xl p-6 flex flex-col h-full transition-shadow hover:shadow-lg ${
                plan.featured ? "border-primary shadow-md -translate-y-2" : "border-outline-variant/30"
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider ${
                  plan.featured ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container"
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-headline-md font-bold text-on-surface mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-display-md font-extrabold text-primary">{plan.price}</span>
                  {plan.period && <span className="text-label-sm text-on-surface-variant">/{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">check</span>
                    {f}
                  </li>
                ))}
              </ul>

              <CheckoutButton
                planSlug={plan.slug}
                label={plan.slug === "free" ? "Get Started Free" : plan.slug === "exam_week_pass" ? "Get 7-Day Pass" : plan.slug === "premium" ? "Subscribe" : "Buy Credits"}
                featured={plan.featured}
                href="/register"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span></div>}><PricingContent /></Suspense>;
}
