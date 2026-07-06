"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  FileText,
  Mic,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ExamData {
  id: string;
  user_id: string;
  exam_type: string;
  task_type?: string;
  status: string;
  eval_source: string;
  attempt_number: number;
  created_at: string;
  completed_at?: string;
  user_profiles?: { full_name: string; email: string };
  evaluations?: {
    id: string;
    overall_band?: number;
    criteria_scores?: Record<string, any>;
    detailed_feedback?: string;
    grammar_corrections?: any[];
    provider_used?: string;
    ai_model_used?: string;
    tokens_used?: number;
  };
}

interface ExamListResponse {
  exams: ExamData[];
  total: number;
  page: number;
  limit: number;
}

function UserAvatar({ name, email }: { name: string | null; email: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || email.charAt(0).toUpperCase();
  const colors = [
    "from-blue-400 to-blue-500",
    "from-violet-400 to-violet-500",
    "from-emerald-400 to-emerald-500",
    "from-amber-400 to-amber-500",
    "from-rose-400 to-rose-500",
  ];
  const colorIndex = email.charCodeAt(0) % colors.length;

  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-medium shadow-sm`}>
      {initial}
    </div>
  );
}

function ExamTypeBadge({ type }: { type: string }) {
  if (type === "writing") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
        <FileText className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold capitalize">Writing</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700">
      <Mic className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold capitalize">Speaking</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold ring-1 ring-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        Completed
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-amber-200 animate-pulse">
        <Clock className="w-3.5 h-3.5" />
        Processing
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold ring-1 ring-red-200">
        <XCircle className="w-3.5 h-3.5" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
      <AlertCircle className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

function BandScore({ score }: { score: number | undefined }) {
  if (score == null) {
    return (
      <span className="text-xs text-slate-400 font-medium italic">Awaiting grade</span>
    );
  }
  const color = score >= 7.5 ? "bg-emerald-100 text-emerald-700" : score >= 6 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg ${color} text-xs font-bold`}>
      Band {score.toFixed(1)}
    </span>
  );
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExams = (p: number) => {
    setLoading(true);
    setError("");
    apiFetch<ExamListResponse>(`/admin/exams?page=${p}&limit=20`)
      .then((d) => {
        setExams(d.exams || []);
        setTotal(d.total || 0);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load exams"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExams(page); }, [page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Exams</h1>
          <p className="text-sm text-slate-500">{total} total exams</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => fetchExams(page)} className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700">
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Band Score</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">No exams found</p>
                        </td>
                      </tr>
                    ) : (
                      exams.map((e) => {
                        const eval_ = e.evaluations;
                        const user = e.user_profiles;
                        return (
                          <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <UserAvatar name={user?.full_name ?? null} email={user?.email || "?"} />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{user?.full_name || "Anonymous"}</p>
                                  <p className="text-xs text-slate-500">{user?.email || "—"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <ExamTypeBadge type={e.exam_type} />
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status={e.status} />
                            </td>
                            <td className="py-4 px-6">
                              <BandScore score={eval_?.overall_band} />
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-slate-600">
                                {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Link
                                href={`/admin/exams/${e.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
