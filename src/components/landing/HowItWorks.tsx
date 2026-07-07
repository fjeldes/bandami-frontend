import { BookOpen, Keyboard, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "1. Choose Task",
    description: "Select from a wide range of Writing and Speaking prompts based on recent exams.",
    color: "blue",
  },
  {
    icon: Keyboard,
    title: "2. Practice",
    description: "Complete the exercise under real-time conditions using our distraction-free interface.",
    color: "purple",
  },
  {
    icon: Lightbulb,
    title: "3. Receive Feedback",
    description: "Get an instant Band Score, grammar corrections, and personalized suggestions to improve your vocabulary.",
    color: "amber",
  },
];

const colorStyles = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
    icon: "text-blue-600 dark:text-blue-400",
    hover: "hover:border-blue-300 dark:hover:border-blue-400/30",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-500/20",
    icon: "text-purple-600 dark:text-purple-400",
    hover: "hover:border-purple-300 dark:hover:border-purple-400/30",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    icon: "text-amber-600 dark:text-amber-400",
    hover: "hover:border-amber-300 dark:hover:border-amber-400/30",
  },
};

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-slate-50 dark:bg-slate-950" id="how-it-works">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our 3-step process simulates the real IELTS exam environment to build your confidence and accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-[1px] bg-slate-200 dark:bg-slate-800 z-0" />
          {steps.map((step, idx) => {
            const colors = colorStyles[step.color as keyof typeof colorStyles];
            return (
              <div
                key={step.icon.name}
                className="relative z-10 flex flex-col items-center text-center group animate-fade-in-up"
                style={{ animationDelay: `${0.2 + idx * 0.15}s` }}
              >
                <div
                  className={`w-24 h-24 rounded-full ${colors.bg} border ${colors.border} ${colors.hover} flex items-center justify-center mb-8 transition-all duration-300 shadow-sm`}
                >
                  <step.icon className={`w-10 h-10 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
