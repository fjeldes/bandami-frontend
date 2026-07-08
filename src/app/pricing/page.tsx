"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import { CheckoutButton } from "@/components/ui/CheckoutButton";
import { Navbar } from "@/components/landing/Navbar";

const featureMeta: Record<string, { icon: string; color: string }> = {
  "Writing (all tasks)": { icon: "edit_note", color: "text-blue-500" },
  "Unlimited practice": { icon: "edit_note", color: "text-blue-500" },
  "Speaking Part 1": { icon: "record_voice_over", color: "text-violet-500" },
  "All Speaking Parts (1, 2 & 3)": { icon: "record_voice_over", color: "text-violet-500" },
  "Instant band score": { icon: "speed", color: "text-emerald-500" },
  "Detailed IELTS analysis": { icon: "analytics", color: "text-emerald-500" },
  "Basic feedback & strengths": { icon: "lightbulb", color: "text-amber-500" },
  "Full criteria breakdown": { icon: "lightbulb", color: "text-amber-500" },
  "Personalized study plans": { icon: "book", color: "text-rose-500" },
  "Personalized recommendations": { icon: "book", color: "text-rose-500" },
  "Progress tracking & history": { icon: "trending_up", color: "text-cyan-500" },
  "Grammar corrections with explanations": { icon: "spellcheck", color: "text-orange-500" },
};

const plans = [
  {
    slug: "free",
    name: "Free",
    price: "$0",
    period: "",
    badge: "",
    tagline: "Get started with essential practice tools",
    features: ["Writing (all tasks)", "Speaking Part 1", "Instant band score", "Basic feedback & strengths"],
    featured: false,
  },
  {
    slug: "premium",
    name: "Pro",
    price: "$14.99",
    period: "month",
    badge: "",
    tagline: "The complete IELTS preparation toolkit",
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
    visiblePlans = plans.map((p) => {
      if (isPremium && p.slug === "premium") {
        return { ...p, price: "Active", period: "", badge: "Your Plan ✓", featured: true };
      }
      if (p.slug === "free") {
        return { ...p, badge: "Current Plan" };
      }
      return p;
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[13px] text-slate-400 font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Start with a 3-day free trial
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            Choose your path to <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Band 7+</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            No charge today. Then $14.99/month + tax. Cancel anytime — your progress is always saved.
          </p>
          {isPremium && (
            <div className="inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[14px] font-semibold backdrop-blur-sm">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              You&apos;re on the Pro plan
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 w-[380px]">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-white/10 rounded-lg w-2/3" />
                  <div className="h-10 bg-white/10 rounded-lg w-1/2" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (<div key={j} className="h-4 bg-white/10 rounded w-full" />))}
                  </div>
                  <div className="h-12 bg-white/10 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto items-stretch justify-center">
            {visiblePlans.map((plan, idx) => (
              <div
                key={plan.slug}
                className={`animate-fade-in-up flex flex-col ${
                  plan.slug === "premium" ? "flex-[4]" : "flex-[3]"
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {plan.slug === "free" && (
                  <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-7 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-all duration-500" />

                    {plan.badge && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-4 w-fit border border-white/5">
                        {plan.badge}
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">{plan.tagline}</p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="font-mono text-4xl font-extrabold text-white tracking-tight">$0</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f, i) => {
                        const meta = featureMeta[f] || { icon: "check", color: "text-slate-400" };
                        return (
                          <li key={i} className="flex items-start gap-2.5 text-[14px] text-slate-400">
                            <span className={`material-symbols-outlined text-[18px] ${meta.color} mt-0.5 shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
                              {meta.icon}
                            </span>
                            {f}
                          </li>
                        );
                      })}
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
                      <div className="h-full bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-7 flex flex-col shadow-[0_8px_40px_rgba(16,185,129,0.1)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-14 -mt-14" />

                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-4 w-fit shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          {plan.badge || "Active"}
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                        <p className="text-[13px] text-slate-400 mb-6 leading-relaxed">{plan.tagline}</p>

                        <div className="font-mono text-4xl font-extrabold text-emerald-400 mb-2 tracking-tight">Active</div>

                        <ul className="space-y-3 mb-8 flex-1">
                          {plan.features.map((f, i) => {
                            const meta = featureMeta[f] || { icon: "check", color: "text-slate-400" };
                            return (
                              <li key={i} className="flex items-start gap-2.5 text-[14px] text-slate-300">
                                <span className={`material-symbols-outlined text-[18px] ${meta.color} mt-0.5 shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {meta.icon}
                                </span>
                                {f}
                              </li>
                            );
                          })}
                        </ul>

                        <div className="w-full text-center py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-semibold">
                          Your current plan
                        </div>
                      </div>
                    ) : (
                      <div className="h-full bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-500/30 rounded-3xl p-7 flex flex-col shadow-[0_8px_40px_rgba(59,130,246,0.15)] relative overflow-hidden group hover:shadow-[0_8px_50px_rgba(59,130,246,0.25)] hover:-translate-y-1 transition-all duration-300">
                        {/* Glow accents */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400" />
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-500" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -ml-12 -mb-12" />

                        {/* MOST POPULAR badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-violet-500 text-white px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10 whitespace-nowrap">
                          MOST POPULAR
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-1 mt-2">{plan.name}</h3>
                        <p className="text-[13px] text-slate-400 mb-6 leading-relaxed">{plan.tagline}</p>

                        {/* Pricing */}
                        <div className="mb-2">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 tracking-tight">Free</span>
                            <span className="text-[15px] text-slate-300 font-semibold">for 3 days</span>
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="font-mono text-2xl text-white font-bold">$14.99</span>
                            <span className="text-[14px] text-slate-500">/month + tax after</span>
                          </div>
                        </div>

                        <p className="text-[13px] text-slate-500 mb-6 pb-6 border-b border-white/5">
                          No charge during trial. Cancel anytime.
                        </p>

                        <ul className="space-y-3 mb-8 flex-1">
                          {plan.features.map((f, i) => {
                            const meta = featureMeta[f] || { icon: "check_circle", color: "text-blue-400" };
                            return (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className={`material-symbols-outlined text-[18px] ${meta.color} mt-0.5 shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {meta.icon}
                                </span>
                                <span className="text-[14px] text-slate-300 font-medium">{f}</span>
                              </li>
                            );
                          })}
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
          <div className="mt-14 text-center">
            <div className="max-w-lg mx-auto p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-[14px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200">No charge today.</span> Start your 3-day free trial. Then $14.99/month + tax. Cancel anytime — your progress is always saved.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><span className="material-symbols-outlined text-[40px] text-blue-400 animate-spin">progress_activity</span></div>}><PricingContent /></Suspense>;
}
