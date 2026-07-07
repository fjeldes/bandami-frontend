import { API_ORIGIN as API_BASE } from "@/lib/config";

import type {
  Evaluation, DashboardStats, WritingSubmissionPayload,
  ExamWithEvaluation, Exam, Question, SubscriptionPlan,
  UserSubscription, UserCreditPack, ApiError,
} from "./types";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token");
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = getAccessToken();
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 120_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let authHeaders = await getAuthHeaders();
  const userHeaders = options.headers || {};

  const resolvedHeaders: Record<string, string> = {
    ...(authHeaders as Record<string, string>),
    ...(userHeaders as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    resolvedHeaders["Content-Type"] = "application/json";
  }

  let res = await fetchWithTimeout(`${API_BASE}${endpoint}`, {
    ...options,
    headers: resolvedHeaders,
  });

  if (res.status === 401) {
    const { useAuthStore } = await import("@/stores/authStore");
    const newToken = await useAuthStore.getState().refreshSession();

    if (newToken) {
      resolvedHeaders["Authorization"] = `Bearer ${newToken}`;
      res = await fetchWithTimeout(`${API_BASE}${endpoint}`, {
        ...options,
        headers: resolvedHeaders,
      });

      if (res.ok) return res.json();
    }

    throw new Error("auth_required");
  }

  if (!res.ok) {
    const errorBody: ApiError = await res.json().catch(() => ({
      detail: `Request failed with status ${res.status}`,
    }));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export function setAccessToken(token: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("access_token", token);
  }
}

export function clearAccessToken() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/users/me/stats");
}

export async function createWritingExam(payload?: {
  exam_type?: string;
  task_type?: string;
  question_id?: string;
  attempt_number?: number;
}): Promise<Exam> {
  return apiFetch<Exam>("/evaluate/writing/exam", {
    method: "POST",
    body: JSON.stringify(payload || { exam_type: "writing" }),
  });
}

export async function submitWritingEvaluation(payload: WritingSubmissionPayload): Promise<Evaluation> {
  return apiFetch<Evaluation>("/evaluate/writing/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getWritingEvaluation(examId: string): Promise<Evaluation> {
  return apiFetch<Evaluation>(`/evaluate/writing/${examId}/evaluation`);
}

export async function createSpeakingExam(payload?: {
  exam_type?: string;
  question_id?: string;
  attempt_number?: number;
}): Promise<Exam> {
  return apiFetch<Exam>("/evaluate/speaking/exam", {
    method: "POST",
    body: JSON.stringify(payload || { exam_type: "speaking" }),
  });
}

export async function submitSpeakingEvaluation(examId: string, audioBlob: Blob): Promise<Evaluation> {
  const formData = new FormData();
  formData.append("exam_id", examId);
  formData.append("audio", audioBlob, "recording.webm");
  return apiFetch<Evaluation>("/evaluate/speaking/", {
    method: "POST",
    body: formData,
  });
}

export async function getSpeakingEvaluation(examId: string): Promise<Evaluation> {
  return apiFetch<Evaluation>(`/evaluate/speaking/${examId}/evaluation`);
}

export async function createExam(payload: { exam_type: string; question_id?: string; task_type?: string }): Promise<Exam> {
  const type = payload.exam_type;
  return apiFetch<Exam>(`/evaluate/${type}/exam`, { method: "POST", body: JSON.stringify(payload) });
}

export async function submitReading(payload: { exam_id: string; answers: Record<string, string> }): Promise<Evaluation> {
  return apiFetch<Evaluation>("/evaluate/reading/", { method: "POST", body: JSON.stringify(payload) });
}

export async function getReadingEvaluation(examId: string): Promise<Evaluation> {
  return apiFetch<Evaluation>(`/evaluate/reading/${examId}/evaluation`);
}

export async function getUserExams(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ exams: ExamWithEvaluation[]; total: number; limit: number; offset: number }> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  return apiFetch<{ exams: ExamWithEvaluation[]; total: number; limit: number; offset: number }>(`/users/me/exams${qs ? `?${qs}` : ""}`);
}

export async function getQuestions(params?: {
  exam_type?: string;
  difficulty?: number;
  limit?: number;
  module?: string;
}): Promise<Question[]> {
  const searchParams = new URLSearchParams();
  if (params?.exam_type) searchParams.set("exam_type", params.exam_type);
  if (params?.difficulty) searchParams.set("difficulty", String(params.difficulty));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.module) searchParams.set("module", params.module);
  const qs = searchParams.toString();
  return apiFetch<Question[]>(`/users/questions${qs ? `?${qs}` : ""}`);
}

export async function getUserCreditPacks(): Promise<UserCreditPack[]> {
  return apiFetch<UserCreditPack[]>("/users/me/credit-packs");
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return apiFetch<SubscriptionPlan[]>("/users/plans");
}

export async function getUserSubscription(): Promise<UserSubscription | null> {
  return apiFetch<UserSubscription | null>("/users/me/subscription");
}
