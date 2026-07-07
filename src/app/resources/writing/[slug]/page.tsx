import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipBySlug, Tip } from "@/data/tips";
import { ChevronRight, ArrowLeft, PenTool, Sparkles, AlertCircle, CheckCircle2, BookOpen, ArrowRight, Lightbulb } from "lucide-react";

type Criterion = "grammar" | "vocabulary" | "coherence" | "task_achievement" | "general";

interface CriterionConfig {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: any;
}

const CRITERION_CONFIG: Record<Criterion, CriterionConfig> = {
  grammar: {
    label: "Grammar",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-400",
    icon: AlertCircle,
  },
  vocabulary: {
    label: "Vocabulary",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-400",
    icon: BookOpen,
  },
  coherence: {
    label: "Coherence & Cohesion",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-400",
    icon: Sparkles,
  },
  task_achievement: {
    label: "Task Achievement",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-400",
    icon: CheckCircle2,
  },
  general: {
    label: "General",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    textColor: "text-slate-400",
    icon: Lightbulb,
  },
};

interface Section {
  title: string;
  content: string;
  criterion?: Criterion;
  examples?: { before?: string; after?: string; explanation?: string };
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
  const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
  const h3Matches = content.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [];

  const parts = content.split(/<h[23][^>]*>/gi);

  parts.forEach((part, index) => {
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
    if (title.toLowerCase().includes("band 7") || title.toLowerCase().includes("key") || title.toLowerCase().includes("essential")) {
      impact = "high";
    } else if (title.toLowerCase().includes("mistake") || title.toLowerCase().includes("avoid") || title.toLowerCase().includes("common")) {
      impact = "high";
    }

    sections.push({
      title: title || "Overview",
      content: cleanPart,
      criterion,
      examples,
      impact,
    });
  });

  return sections.filter(s => s.title !== "Overview" || sections.length === 1);
}

function TipCard({ section }: { section: Section }) {
  const config = CRITERION_CONFIG[section.criterion || "general"];
  const Icon = config.icon;

  const impactColors = {
    high: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/20 group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.textColor}`} />
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
              {config.label}
            </span>
          </div>
        </div>
        {section.impact && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${impactColors[section.impact]}`}>
            <Sparkles className="w-3 h-3" />
            {section.impact === "high" ? "High Impact" : section.impact === "medium" ? "Medium Impact" : "Review"}
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-3 group-hover:text-white transition-colors">
        {section.title}
      </h3>

      <div className="text-slate-400 text-sm leading-relaxed mb-4">
        {section.content.split("\n").filter(Boolean).map((line, i) => (
          <p key={i} className="mb-2 last:mb-0">{line}</p>
        ))}
      </div>

      {section.examples && (
        <div className="mt-5 pt-5 border-t border-slate-800/60 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Practical Example</p>
          {section.examples.before && (
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Before (Weak)</span>
              </div>
              <p className="text-sm font-mono text-rose-300 leading-relaxed">{section.examples.before}</p>
            </div>
          )}
          {section.examples.after && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">After (Optimized)</span>
              </div>
              <p className="text-sm font-mono text-emerald-300 leading-relaxed">{section.examples.after}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = getTipBySlug("writing", slug);

  if (!tip) {
    notFound();
  }

  const sections = parseContent(tip.content);
  const plainText = getPlainText(tip.content);

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/resources" className="hover:text-blue-400 transition-colors">
          Resources
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/resources/writing" className="hover:text-blue-400 transition-colors">
          Writing Tips
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-300 font-medium">{tip.title}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <PenTool className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Writing Tip</p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{tip.title}</h1>
          </div>
        </div>
        <p className="text-slate-400 text-base leading-relaxed max-w-3xl">{tip.summary}</p>
      </div>

      <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Impact Indicator</span>
        </div>
        <p className="text-sm text-slate-400">
          Each section below is tagged by IELTS criterion. Sections marked <span className="text-emerald-400 font-semibold">High Impact</span> have the greatest potential to improve your band score. Look for the <span className="text-rose-400">Before/After</span> examples to see exactly what to change.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {sections.map((section, index) => (
          <TipCard key={index} section={section} />
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800/50 p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          Full Guide
        </h3>
        <div
          className="prose prose-invert prose-sm max-w-none text-slate-400"
          dangerouslySetInnerHTML={{ __html: tip.content }}
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
        <Link
          href="/resources/writing"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Writing Tips
        </Link>
        <Link
          href="/resources/writing/band-7-strategies"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all font-semibold text-sm"
        >
          Next: Band 7+ Strategies
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
