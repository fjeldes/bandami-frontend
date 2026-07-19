import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardStats,
  getUserExams,
  getSubscriptionPlans,
  getUserSubscription,
  getUserCreditPacks,
  getWritingEvaluation,
  getSpeakingEvaluation,
  getReadingEvaluation,
  apiFetch,
} from "@/lib/api";
import type { DashboardStats, ExamWithEvaluation, SubscriptionPlan, UserSubscription, UserCreditPack, Evaluation } from "@/lib/types";

const STALE = 5 * 60 * 1000;
const DASHBOARD_STALE = 30 * 1000;

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    staleTime: DASHBOARD_STALE,
  });
}

export function useExams(limit = 30) {
  return useQuery<{ exams: ExamWithEvaluation[]; total: number; limit: number; offset: number }>({
    queryKey: ["exams", limit],
    queryFn: () => getUserExams({ limit }),
    staleTime: DASHBOARD_STALE,
  });
}

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["plans"],
    queryFn: getSubscriptionPlans,
    staleTime: 30 * 60 * 1000,
  });
}

export function useUserSubscription() {
  return useQuery<UserSubscription | null>({
    queryKey: ["userSubscription"],
    queryFn: getUserSubscription,
    staleTime: STALE,
  });
}

export function useCreditPacks() {
  return useQuery<UserCreditPack[]>({
    queryKey: ["creditPacks"],
    queryFn: getUserCreditPacks,
    staleTime: STALE,
  });
}

export function useEvaluation(type: string, examId: string | null) {
  const fetcher = type === "writing"
    ? getWritingEvaluation
    : type === "speaking"
    ? getSpeakingEvaluation
    : getReadingEvaluation;
  return useQuery<Evaluation>({
    queryKey: ["evaluation", type, examId],
    queryFn: () => fetcher(examId!),
    enabled: !!examId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useStudyPlan() {
  return useQuery<{ plan: any[] | null; message: string; can_generate: boolean; remaining_this_month: number; id?: string }>({
    queryKey: ["studyPlan"],
    queryFn: () => apiFetch("/users/me/study-plan"),
    staleTime: STALE,
  });
}

export function useGenerateStudyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ plan: any[]; message: string; id: string; can_generate: boolean; remaining_this_month: number }>("/users/me/study-plan", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studyPlan"] }),
  });
}

export function useToggleStudyPlanDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, day, completed }: { planId: string; day: number; completed: boolean }) =>
      apiFetch(`/users/me/study-plan/${planId}`, { method: "PATCH", body: JSON.stringify({ day, completed }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studyPlan"] }),
  });
}
