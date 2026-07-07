import Link from "next/link";
import { PenTool, BookOpen, FileText, MessageSquare, ArrowRight, Link2, LayoutList, BarChart3, Sparkles } from "lucide-react";

const writingTypes = [
  {
    title: "Academic Writing",
    description: "Describe graphs, charts, tables, and diagrams. Demonstrate your ability to interpret and present data clearly.",
    icon: BarChart3,
    color: "blue",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-500/10",
    borderLight: "border-blue-200",
    borderDark: "dark:border-blue-500/20",
    iconLight: "text-blue-600",
    iconDark: "dark:text-blue-400",
    hoverBorderLight: "hover:border-blue-300",
    hoverBorderDark: "dark:hover:border-blue-500/30",
  },
  {
    title: "General Training",
    description: "Write formal or informal letters for real-life situations. Practice expressing ideas clearly in everyday contexts.",
    icon: MessageSquare,
    color: "emerald",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-500/10",
    borderLight: "border-emerald-200",
    borderDark: "dark:border-emerald-500/20",
    iconLight: "text-emerald-600",
    iconDark: "dark:text-emerald-400",
    hoverBorderLight: "hover:border-emerald-300",
    hoverBorderDark: "dark:hover:border-emerald-500/30",
  },
];

const taskCards = [
  {
    title: "Task 1",
    subtitle: "150 words",
    description: "Academic: describe visuals. General: write a letter.",
    color: "violet",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-500/10",
    borderLight: "border-violet-200",
    borderDark: "dark:border-violet-500/20",
    iconLight: "text-violet-600",
    iconDark: "dark:text-violet-400",
    icon: FileText,
  },
  {
    title: "Task 2",
    subtitle: "250 words",
    description: "Essay: present an argument, discuss a problem, or propose a solution. Worth double Task 1.",
    color: "amber",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-500/10",
    borderLight: "border-amber-200",
    borderDark: "dark:border-amber-500/20",
    iconLight: "text-amber-600",
    iconDark: "dark:text-amber-400",
    icon: BookOpen,
  },
];

const tips = [
  {
    title: "Connectors & Linking Words",
    description: "Master the essential connecting words to improve cohesion and flow in your writing.",
    slug: "connectors",
    icon: Link2,
    color: "blue",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-500/10",
    borderLight: "border-blue-200",
    borderDark: "dark:border-blue-500/20",
    hoverBorderLight: "hover:border-blue-300",
    hoverBorderDark: "dark:hover:border-blue-500/30",
    iconLight: "text-blue-600",
    iconDark: "dark:text-blue-400",
  },
  {
    title: "Essay Structure",
    description: "Learn the ideal 4-paragraph structure for IELTS Writing Task 2 essays.",
    slug: "essay-structure",
    icon: LayoutList,
    color: "indigo",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-500/10",
    borderLight: "border-indigo-200",
    borderDark: "dark:border-indigo-500/20",
    hoverBorderLight: "hover:border-indigo-300",
    hoverBorderDark: "dark:hover:border-indigo-500/30",
    iconLight: "text-indigo-600",
    iconDark: "dark:text-indigo-400",
  },
  {
    title: "Task 1 Academic Tips",
    description: "Key strategies for describing graphs, charts, and diagrams effectively.",
    slug: "task-1-tips",
    icon: BarChart3,
    color: "emerald",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-500/10",
    borderLight: "border-emerald-200",
    borderDark: "dark:border-emerald-500/20",
    hoverBorderLight: "hover:border-emerald-300",
    hoverBorderDark: "dark:hover:border-emerald-500/30",
    iconLight: "text-emerald-600",
    iconDark: "dark:text-emerald-400",
  },
  {
    title: "Band 7+ Strategies",
    description: "Proven techniques to achieve a Band 7 or higher in IELTS Writing.",
    slug: "band-7-strategies",
    icon: Sparkles,
    color: "amber",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-500/10",
    borderLight: "border-amber-200",
    borderDark: "dark:border-amber-500/20",
    hoverBorderLight: "hover:border-amber-300",
    hoverBorderDark: "dark:hover:border-amber-500/30",
    iconLight: "text-amber-600",
    iconDark: "dark:text-amber-400",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
};

export function WritingTips() {
  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-white dark:bg-slate-900" id="writing-tips">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            <PenTool className="w-4 h-4" />
            Writing
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Master IELTS Writing
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Understand the two Writing types — Academic and General Training — and learn proven strategies to improve your band score.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {writingTypes.map((type) => (
            <div
              key={type.title}
              className={`rounded-2xl border ${type.borderLight} ${type.borderDark} ${type.bgLight} ${type.bgDark} p-6 ${type.hoverBorderLight} ${type.hoverBorderDark} transition-all duration-200`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${type.bgLight} ${type.bgDark} flex items-center justify-center shrink-0`}>
                  <type.icon className={`w-6 h-6 ${type.iconLight} ${type.iconDark}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{type.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-10">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">Task Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {taskCards.map((task) => (
              <div
                key={task.title}
                className={`flex items-center gap-4 rounded-xl border ${task.borderLight} ${task.borderDark} ${task.bgLight} ${task.bgDark} p-4`}
              >
                <div className={`w-10 h-10 rounded-lg ${task.bgLight} ${task.bgDark} flex items-center justify-center shrink-0`}>
                  <task.icon className={`w-5 h-5 ${task.iconLight} ${task.iconDark}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-900 dark:text-white">{task.title}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${task.bgLight} ${task.bgDark} ${task.iconLight} ${task.iconDark}`}>
                      {task.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <Link
            href="/resources/writing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View all writing tips
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((tip, idx) => (
            <Link
              key={tip.slug}
              href={`/resources/writing/${tip.slug}`}
              className={`group rounded-xl border ${tip.borderLight} ${tip.borderDark} ${tip.bgLight} ${tip.bgDark} p-5 ${tip.hoverBorderLight} ${tip.hoverBorderDark} hover:shadow-md transition-all duration-200 animate-fade-in-up`}
              style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
            >
              <div className={`w-10 h-10 rounded-lg ${tip.bgLight} ${tip.bgDark} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <tip.icon className={`w-5 h-5 ${tip.iconLight} ${tip.iconDark}`} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tip.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {tip.description}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Read more</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
