const faqs = [
  { q: "How does the AI evaluation compare to a real IELTS examiner?", a: "Our AI has been trained on a vast dataset of IELTS responses to provide accurate scoring aligned with the official band descriptors. While it's not a replacement for a human examiner, it offers reliable guidance for your preparation." },
  { q: "What do I get on the Free plan?", a: "The Free plan gives you 3 evaluations per day with instant band scores. You get full access to Writing and Speaking Part 1. To unlock Speaking Part 2 & 3, grammar corrections, and detailed feedback, try the Week Pass ($2.99) or subscribe to Premium ($14.99/month)." },
  { q: "How does the free daily evaluation limit work?", a: "The free plan includes 3 evaluations daily that reset every 24 hours. You can use them for Writing or Speaking tasks. No credit card is required." },
  { q: "How does the Premium trial work?", a: "Your first week of Premium costs just $2.99. You get full access to everything — 30 evaluations/day, OpenAI, detailed feedback, and all modules. After 7 days, it's $14.99/month. Cancel anytime before day 8 to avoid being charged." },
  { q: "Can I track my progress over time?", a: "Yes. Premium subscribers get access to full history and progress tracking. Your exam history, band scores, and performance trends are stored in your dashboard." },
  { q: "Which payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe. Payments are secure and encrypted. You can cancel your subscription anytime from your account settings." },
];

export function FAQ() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter bg-surface" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={faq.q} className="group bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-card-padding cursor-pointer ghost-shadow [&_summary::-webkit-details-marker]:hidden animate-fade-in-up" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
              <summary className="flex items-center justify-between font-body-lg text-body-lg text-on-surface font-medium">
                <span>{faq.q}</span>
                <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
              </summary>
              <div className="mt-4 font-body-md text-body-md text-on-surface-variant">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
