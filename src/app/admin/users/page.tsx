"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Search,
  Crown,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

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

function UserAvatar({ name, email }: { name: string | null; email: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || email.charAt(0).toUpperCase();
  const colors = [
    "from-blue-500 to-blue-600",
    "from-violet-500 to-violet-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
    "from-rose-500 to-rose-600",
  ];
  const colorIndex = email.charCodeAt(0) % colors.length;

  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
      {initial}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  if (tier === "premium") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full dark:bg-amber-900/30 bg-amber-50 dark:text-amber-400 text-amber-700 text-xs font-semibold ring-1 dark:ring-amber-900/50 ring-amber-200">
        <Crown className="w-3 h-3" />
        Pro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-600 text-xs font-medium">
      Free
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full dark:bg-indigo-900/30 bg-indigo-50 dark:text-indigo-400 text-indigo-700 text-[10px] font-bold uppercase tracking-wider ring-1 dark:ring-indigo-900/50 ring-indigo-200">
        <Shield className="w-3 h-3" />
        Admin
      </span>
    );
  }
  return (
    <span className="text-xs dark:text-slate-500 text-slate-400 font-medium capitalize">{role || "user"}</span>
  );
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
    <div className="min-h-screen dark:bg-slate-950 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold dark:text-white text-slate-900 tracking-tight mb-1">Users</h1>
          <p className="text-sm dark:text-slate-400 text-slate-500">{total} total users</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-slate-400 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 bg-white rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl dark:bg-red-900/20 bg-red-50 border dark:border-red-900/30 border-red-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl dark:bg-red-900/30 bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <p className="text-sm dark:text-red-400 text-red-700">{error}</p>
            <button onClick={() => fetchUsers(page, search)} className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700">
              Retry
            </button>
          </div>
        )}

        <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 dark:border-slate-700 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="dark:bg-slate-800/50 bg-slate-50 border-b dark:border-slate-800 border-slate-100">
                      <th className="py-4 px-6 text-[11px] font-bold dark:text-slate-400 text-slate-400 uppercase tracking-wider">User</th>
                      <th className="py-4 px-6 text-[11px] font-bold dark:text-slate-400 text-slate-400 uppercase tracking-wider">Tier</th>
                      <th className="py-4 px-6 text-[11px] font-bold dark:text-slate-400 text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="py-4 px-6 text-[11px] font-bold dark:text-slate-400 text-slate-400 uppercase tracking-wider">Joined</th>
                      <th className="py-4 px-6 text-[11px] font-bold dark:text-slate-400 text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800 divide-slate-100">
                    {users.length === 0 && !error ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <User className="w-12 h-12 dark:text-slate-600 text-slate-200 mx-auto mb-3" />
                          <p className="text-sm dark:text-slate-400 text-slate-500">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <UserAvatar name={u.full_name} email={u.email} />
                              <div>
                                <p className="text-sm font-medium dark:text-white text-slate-900">{u.full_name || "Anonymous"}</p>
                                <p className="text-xs dark:text-slate-400 text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <TierBadge tier={u.subscription_tier} />
                          </td>
                          <td className="py-4 px-6">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm dark:text-slate-400 text-slate-600">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/admin/users/${u.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium dark:text-slate-400 text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t dark:border-slate-800 border-slate-100 flex items-center justify-between">
                  <span className="text-sm dark:text-slate-400 text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 rounded-xl dark:bg-slate-800 bg-slate-100 flex items-center justify-center dark:text-slate-400 text-slate-600 hover:dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="w-9 h-9 rounded-xl dark:bg-slate-800 bg-slate-100 flex items-center justify-center dark:text-slate-400 text-slate-600 hover:dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
