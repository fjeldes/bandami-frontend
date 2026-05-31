const faqs = [
  { q: "How does the AI evaluation compare to a real IELTS examiner?", a: "Our AI has been trained on a vast dataset of IELTS responses to provide accurate scoring aligned with the official band descriptors. While it's not a replacement for a human examiner, it offers reliable guidance for your preparation." },
  { q: "What do I get on the Free plan?", a: "The Free plan gives you 4 evaluations per day with your overall band score. To unlock detailed criterion breakdowns, grammar corrections, and personalized feedback, upgrade to Premium or purchase a credit pack." },
  { q: "How does the free daily evaluation limit work?", a: "The free plan includes 4 evaluations daily that reset every 24 hours. You can use them for any combination of Writing and Speaking tasks. No credit card is required." },
  { q: "What is the Exam Week Pass?", a: "The Exam Week Pass gives you 7 days of full Premium access for a one-time payment of $4.99. It's perfect if your exam is coming up and you want to practice intensively without a monthly subscription." },
  { q: "Can I track my progress over time?", a: "Yes. Premium subscribers get access to full history and progress tracking. Your exam history, band scores, and performance trends are stored in your dashboard." },
  { q: "Are credit packs better than a subscription?", a: "It depends on your needs. Credit packs never expire and have no daily limit, making them ideal if you study sporadically. A Premium subscription is better if you practice regularly." },
];

export function FAQ() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter bg-surface" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-card-padding cursor-pointer ghost-shadow [&_summary::-webkit-details-marker]:hidden">
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
