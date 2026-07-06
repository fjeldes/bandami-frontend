"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Crown,
  ClipboardList,
  TrendingUp,
  UserPlus,
  Activity,
  Clock,
  ArrowRight,
  GraduationCap,
  BarChart3,
  ChevronRight,
} from "lucide-react";

interface AdminStats {
  total_users: number;
  admin_count: number;
  premium_count: number;
  active_subscriptions: number;
  total_exams: number;
  completed_exams: number;
  average_band: number;
  active_questions: number;
  new_users_this_month: number;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string;
  created_at: string;
}

interface RecentExam {
  id: string;
  user_email: string;
  exam_type: string;
  status: string;
  created_at: string;
}

function KPICard({ label, value, sub, icon: Icon, color, bgColor }: { label: string; value: string | number; sub: string; icon: any; color: string; bgColor: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-slate-100 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
        <Clock className="w-3 h-3" />
        {sub}
      </span>
    </div>
  );
}

function RecentUsersTable({ users }: { users: RecentUser[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Users</h3>
            <p className="text-xs text-slate-500">Latest registrations</p>
          </div>
        </div>
        <Link href="/admin/users" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {users.slice(0, 5).map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{user.full_name || "Anonymous"}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.subscription_tier === "premium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {user.subscription_tier === "premium" ? (
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Pro
                  </span>
                ) : "Free"}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveActivityFeed({ exams }: { exams: RecentExam[] }) {
  const getExamIcon = (type: string) => {
    return type === "writing" ? (
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
        <ClipboardList className="w-4 h-4 text-emerald-600" />
      </div>
    ) : (
      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
        <GraduationCap className="w-4 h-4 text-violet-600" />
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">Done</span>;
    }
    if (status === "in_progress") {
      return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase animate-pulse">Active</span>;
    }
    return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">Pending</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Live Activity</h3>
            <p className="text-xs text-slate-500">Recent exam submissions</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {exams.slice(0, 8).map((exam) => (
          <div key={exam.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            {getExamIcon(exam.exam_type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800 capitalize">{exam.exam_type}</p>
                {getStatusBadge(exam.status)}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{exam.user_email}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(exam.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {exams.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStatsRow({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Completion Rate</span>
        </div>
        <p className="text-2xl font-extrabold text-blue-900">
          {stats.total_exams > 0 ? Math.round((stats.completed_exams / stats.total_exams) * 100) : 0}%
        </p>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Avg Band</span>
        </div>
        <p className="text-2xl font-extrabold text-emerald-900">{stats.average_band.toFixed(1)}</p>
      </div>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Conversion</span>
        </div>
        <p className="text-2xl font-extrabold text-amber-900">
          {stats.total_users > 0 ? Math.round((stats.premium_count / stats.total_users) * 100) : 0}%
        </p>
      </div>
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Questions</span>
        </div>
        <p className="text-2xl font-extrabold text-violet-900">{stats.active_questions}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [exams, setExams] = useState<RecentExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<AdminStats>("/admin/stats"),
      apiFetch<{ users: RecentUser[] }>("/admin/users?limit=5").catch(() => ({ users: [] })),
      apiFetch<{ exams: RecentExam[] }>("/admin/exams?limit=10").catch(() => ({ exams: [] })),
    ])
      .then(([statsData, usersData, examsData]) => {
        setStats(statsData);
        setUsers(usersData.users || []);
        setExams(examsData.exams || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800 mb-2">Failed to load dashboard</p>
          <p className="text-sm text-slate-500">You may not have admin access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Admin Dashboard</h1>
          <p className="text-slate-500">Overview of your Bandami platform</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <KPICard
            label="Total Users"
            value={stats.total_users}
            sub={`${stats.new_users_this_month} this month`}
            icon={Users}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <KPICard
            label="Premium Users"
            value={stats.premium_count}
            sub={`${stats.active_subscriptions} active`}
            icon={Crown}
            color="text-amber-600"
            bgColor="bg-amber-100"
          />
          <KPICard
            label="Total Exams"
            value={stats.total_exams}
            sub={`${stats.completed_exams} completed`}
            icon={ClipboardList}
            color="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <KPICard
            label="Avg Band Score"
            value={stats.average_band.toFixed(1)}
            sub={`${stats.active_questions} questions`}
            icon={TrendingUp}
            color="text-violet-600"
            bgColor="bg-violet-100"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="mb-8">
          <QuickStatsRow stats={stats} />
        </div>

        {/* Main Grid: Users Table + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentUsersTable users={users} />
          </div>
          <div>
            <LiveActivityFeed exams={exams} />
          </div>
        </div>
      </div>
    </div>
  );
}
