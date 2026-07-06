const steps = [
  { icon: "library_books", title: "1. Choose Task", description: "Select from a wide range of Writing and Speaking prompts based on recent exams." },
  { icon: "keyboard", title: "2. Practice", description: "Complete the exercise under real-time conditions using our distraction-free interface." },
  { icon: "insights", title: "3. Receive Feedback", description: "Get an instant Band Score, grammar corrections, and personalized suggestions to improve your vocabulary." },
];

export function HowItWorks() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-gutter bg-surface" id="how-it-works">
      <div className="section-container">
        <div className="text-center mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">How It Works</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Our 3-step process simulates the real IELTS exam environment to build your confidence and accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-[1px] bg-outline-variant/50 z-0" />
          {steps.map((step, idx) => (
            <div key={step.icon} className="relative z-10 flex flex-col items-center text-center group animate-fade-in-up" style={{ animationDelay: `${0.2 + idx * 0.15}s` }}>
              <div className="w-24 h-24 rounded-full bg-surface-container-lowest shadow-card hover:shadow-card-float transition-all duration-300 border border-transparent hover:border-outline-variant/50 flex items-center justify-center mb-8 group-hover:border-primary/30 transition-colors duration-300">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant group-hover:text-primary transition-colors">{step.icon}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{step.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
