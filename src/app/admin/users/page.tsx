"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string;
  role: string;
  created_at: string | null;
}

interface UserListResponse {
  users: UserRow[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = (p: number, q: string) => {
    setLoading(true);
    setError("");
    apiFetch<UserListResponse>(`/admin/users?page=${p}&limit=20&search=${encodeURIComponent(q)}`)
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total || 0);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(page, search); }, [page, search]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h1 className="text-headline-md font-bold text-on-surface mb-1">Users</h1>
      <p className="text-body-md text-on-surface-variant mb-6">{total} total users</p>

      {error && (
        <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-body-md text-on-error-container">{error}</p>
          <button onClick={() => fetchUsers(page, search)} className="ml-auto text-on-error-container font-semibold text-label-sm hover:underline">Retry</button>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md bg-surface-container rounded-lg border border-outline-variant py-2.5 px-4 text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary"
        />
      </div>

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
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && !error ? (
                  <tr><td colSpan={6} className="py-10 text-center text-body-md text-on-surface-variant">No users found.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 text-body-md text-on-surface">{u.full_name || "—"}</td>
                      <td className="py-3 px-4 text-body-md text-on-surface-variant">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-label-sm px-2 py-0.5 rounded-full ${u.subscription_tier === "premium" ? "bg-secondary-container/30 text-secondary-container" : "bg-surface-container-high text-on-surface-variant"}`}>
                          {u.subscription_tier || "free"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-label-sm px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-primary-container/30 text-primary" : "text-on-surface-variant"}`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-body-md text-on-surface-variant">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/users/${u.id}`} className="text-label-sm text-primary font-semibold hover:underline">View</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-label-sm font-semibold transition-colors ${page === i + 1 ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high"}`}
                >
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
