import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How accurate is the evaluation?", a: "Our scoring system is calibrated against official IELTS band descriptors to provide reliable feedback aligned with what examiners look for. It's designed to give you a clear understanding of your current level and what to improve." },
  { q: "What do I get on the Free plan?", a: "The Free plan gives you instant band scores, basic feedback, and identification of your main strengths and weaknesses. You get full access to Writing and Speaking Part 1. To unlock Speaking Part 2 & 3, grammar corrections, and detailed feedback, try Pro ($14.99/month — 3-day free trial)." },
  { q: "How does the Pro trial work?", a: "Your first 3 days are free. You get full access to everything — unlimited practice, detailed analysis, personalized recommendations, study plans, and all exam modules. After 3 days, it's $14.99/month + tax. Cancel anytime. No charge if you cancel during the trial." },
  { q: "Can I track my progress over time?", a: "Yes. Pro subscribers get access to full history and progress tracking. Your exam history, band scores, and performance trends are stored in your dashboard so you can see your improvement over time." },
  { q: "Which payment methods do you accept?", a: "We accept all major credit and debit cards. Payments are secure and encrypted. You can cancel your subscription anytime from your account settings." },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function FAQ() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-slate-50 dark:bg-slate-950" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={faq.q}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 cursor-pointer animate-fade-in-up hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
            >
              <summary className="flex items-center justify-between font-medium text-slate-900 dark:text-white cursor-pointer list-none">
                <span>{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
