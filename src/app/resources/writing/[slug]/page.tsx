import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipBySlug } from "@/data/tips";
import { ChevronRight, ArrowLeft, PenTool, Sparkles, AlertCircle, CheckCircle2, BookOpen, ArrowRight, Lightbulb } from "lucide-react";

type Criterion = "grammar" | "vocabulary" | "coherence" | "task_achievement" | "general";

interface CriterionConfig {
  label: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
  lightText: string;
  darkText: string;
  icon: any;
}

const CRITERION_CONFIG: Record<Criterion, CriterionConfig> = {
  grammar: {
    label: "Grammar",
    lightBg: "bg-amber-50",
    darkBg: "dark:bg-amber-500/10",
    lightBorder: "border-amber-200",
    darkBorder: "dark:border-amber-500/20",
    lightText: "text-amber-700",
    darkText: "dark:text-amber-400",
    icon: AlertCircle,
  },
  vocabulary: {
    label: "Vocabulary",
    lightBg: "bg-blue-50",
    darkBg: "dark:bg-blue-500/10",
    lightBorder: "border-blue-200",
    darkBorder: "dark:border-blue-500/20",
    lightText: "text-blue-700",
    darkText: "dark:text-blue-400",
    icon: BookOpen,
  },
  coherence: {
    label: "Coherence & Cohesion",
    lightBg: "bg-purple-50",
    darkBg: "dark:bg-purple-500/10",
    lightBorder: "border-purple-200",
    darkBorder: "dark:border-purple-500/20",
    lightText: "text-purple-700",
    darkText: "dark:text-purple-400",
    icon: Sparkles,
  },
  task_achievement: {
    label: "Task Achievement",
    lightBg: "bg-emerald-50",
    darkBg: "dark:bg-emerald-500/10",
    lightBorder: "border-emerald-200",
    darkBorder: "dark:border-emerald-500/20",
    lightText: "text-emerald-700",
    darkText: "dark:text-emerald-400",
    icon: CheckCircle2,
  },
  general: {
    label: "General",
    lightBg: "bg-slate-100",
    darkBg: "dark:bg-slate-500/10",
    lightBorder: "border-slate-200",
    darkBorder: "dark:border-slate-500/20",
    lightText: "text-slate-600",
    darkText: "dark:text-slate-400",
    icon: Lightbulb,
  },
};

interface Section {
  title: string;
  content: string;
  criterion?: Criterion;
  examples?: { before?: string; after?: string };
  impact?: "high" | "medium" | "low";
}

function detectCriterion(title: string): Criterion {
  const lower = title.toLowerCase();
  if (lower.includes("grammar") || lower.includes("grammatical") || lower.includes("verb") || lower.includes("tense") || lower.includes("article") || lower.includes("preposition")) return "grammar";
  if (lower.includes("vocab") || lower.includes("word") || lower.includes("lexical") || lower.includes("spelling") || lower.includes("collocation")) return "vocabulary";
  if (lower.includes("coherence") || lower.includes("cohesion") || lower.includes("connector") || lower.includes("link") || lower.includes("paragraph") || lower.includes("structure")) return "coherence";
  if (lower.includes("task") || lower.includes("achievement") || lower.includes("word count") || lower.includes("example") || lower.includes("argument")) return "task_achievement";
  return "general";
}

function parseContent(content: string): Section[] {
  const sections: Section[] = [];
  const parts = content.split(/<h[23][^>]*>/gi);

  parts.forEach((part) => {
    if (!part.trim()) return;
    const cleanPart = part.replace(/<[^>]+>/g, "").trim();
    if (!cleanPart) return;

    const titleMatch = part.match(/<h[23][^>]*>(.*?)<\/h[23]>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    const criterion = detectCriterion(title);

    const beforeMatch = part.match(/<strong>(?:Incorrect|Debil|Weak|Bad|Wrong)[^<]*<\/strong>:\s*"?([^"<]+)"?/gi);
    const afterMatch = part.match(/<strong>(?:Correct|Mejor|Suggested|Optimized|Good|Better)[^<]*<\/strong>:\s*"?([^"<]+)"?/gi);

    let examples: Section["examples"] = undefined;
    if (beforeMatch || afterMatch) {
      examples = {
        before: beforeMatch?.map(m => m.replace(/<[^>]+>/g, "").replace(/.*?:\s*/, "")).join("\n"),
        after: afterMatch?.map(m => m.replace(/<[^>]+>/g, "").replace(/.*?:\s*/, "")).join("\n"),
      };
    }

    let impact: Section["impact"] = "medium";
    if (title.toLowerCase().includes("band 7") || title.toLowerCase().includes("key") || title.toLowerCase().includes("essential") || title.toLowerCase().includes("high impact")) {
      impact = "high";
    } else if (title.toLowerCase().includes("mistake") || title.toLowerCase().includes("avoid") || title.toLowerCase().includes("common")) {
      impact = "high";
    }

    sections.push({ title: title || "Overview", content: cleanPart, criterion, examples, impact });
  });

  return sections.filter(s => s.title !== "Overview" || sections.length === 1);
}

function TipCard({ section }: { section: Section }) {
  const config = CRITERION_CONFIG[section.criterion || "general"];
  const Icon = config.icon;

  const impactColors = {
    light: {
      high: "bg-emerald-100 text-emerald-700 border-emerald-200",
      medium: "bg-blue-100 text-blue-700 border-blue-200",
      low: "bg-slate-100 text-slate-600 border-slate-200",
    },
    dark: {
      high: "dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
      medium: "dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
      low: "dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30",
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 hover:border-blue-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-black/20">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.lightBg} ${config.darkBg} border ${config.lightBorder} ${config.darkBorder} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.lightText} ${config.darkText}`} />
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.lightBg} ${config.darkBg} ${config.lightBorder} ${config.darkBorder} ${config.lightText} ${config.darkText}`}>
              {config.label}
            </span>
          </div>
        </div>
        {section.impact && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${impactColors.light[section.impact]} ${impactColors.dark[section.impact]}`}>
            <Sparkles className="w-3 h-3" />
            {section.impact === "high" ? "High Impact" : section.impact === "medium" ? "Medium Impact" : "Review"}
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
        {section.title}
      </h3>

      <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
        {section.content.split("\n").filter(Boolean).map((line, i) => (
          <p key={i} className="mb-2 last:mb-0">{line}</p>
        ))}
      </div>

      {section.examples && (
        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700/60 space-y-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Practical Example</p>
          {section.examples.before && (
            <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Before (Weak)</span>
              </div>
              <p className="text-sm font-mono text-rose-800 dark:text-rose-300 leading-relaxed">{section.examples.before}</p>
            </div>
          )}
          {section.examples.after && (
            <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">After (Optimized)</span>
              </div>
              <p className="text-sm font-mono text-emerald-800 dark:text-emerald-300 leading-relaxed">{section.examples.after}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = getTipBySlug("writing", slug);

  if (!tip) {
    notFound();
  }

  const sections = parseContent(tip.content);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Resources
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/resources/writing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Writing Tips
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">{tip.title}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
            <PenTool className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Writing Tip</p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{tip.title}</h1>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed max-w-3xl">{tip.summary}</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800/50 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Impact Indicator</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Each section is tagged by IELTS criterion. Sections marked <span className="text-emerald-600 dark:text-emerald-400 font-semibold">High Impact</span> have the greatest potential to improve your band score. Look for the <span className="text-rose-600 dark:text-rose-400">Before/After</span> examples to see exactly what to change.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {sections.map((section, index) => (
          <TipCard key={index} section={section} />
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/50 p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Full Guide
        </h3>
        <div
          className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-400"
          dangerouslySetInnerHTML={{ __html: tip.content }}
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800/50">
        <Link
          href="/resources/writing"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Writing Tips
        </Link>
        <Link
          href="/resources/writing/band-7-strategies"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-all font-semibold text-sm"
        >
          Next: Band 7+ Strategies
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
