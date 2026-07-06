"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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
    <div>
      <h1 className="text-headline-md font-bold text-on-surface mb-1">Exams</h1>
      <p className="text-body-md text-on-surface-variant mb-6">{total} total exams</p>

      {error && (
        <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-md text-on-error-container">{error}</p>
          <button onClick={() => fetchExams(page)} className="ml-auto text-on-error-container font-semibold text-label-sm hover:underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
        </div>
      ) : (
        <>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Band</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-body-md text-on-surface-variant">No exams found.</td>
                  </tr>
                ) : (
                  exams.map((e) => {
                    const eval_ = e.evaluations;
                    const user = e.user_profiles;
                    return (
                      <tr key={e.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-4">
                          <p className="text-body-md text-on-surface">{user?.full_name || "—"}</p>
                          <p className="text-label-sm text-on-surface-variant">{user?.email || "—"}</p>
                        </td>
                        <td className="py-3 px-4 text-body-md text-on-surface capitalize">{e.exam_type}</td>
                        <td className="py-3 px-4">
                          <span className={`text-label-sm px-2 py-0.5 rounded-full capitalize ${
                            e.status === "completed" ? "bg-emerald-100 text-emerald-700"
                              : e.status === "processing" ? "bg-amber-100 text-amber-700"
                              : e.status === "failed" ? "bg-red-100 text-red-700"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {eval_?.overall_band != null ? (
                            <span className="font-mono text-data-md font-bold text-primary">Band {eval_.overall_band.toFixed(1)}</span>
                          ) : (
                            <span className="text-label-sm text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-label-sm text-on-surface-variant">
                          {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/exams/${e.id}`} className="text-label-sm text-primary font-semibold hover:underline">View</Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-label-sm font-semibold ${page === i + 1 ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
