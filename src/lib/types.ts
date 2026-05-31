// ============================================================
// IELTS SaaS - TypeScript Interfaces v2
// Compatible con schemas Pydantic del backend
// ============================================================

export type ExamType = "writing" | "speaking";
export type ExamStatus = "pending" | "processing" | "completed" | "failed";
export type WritingTask = "task1" | "task2";
export type AIProvider = "gemini" | "openai";
export type SubscriptionTier = "free" | "premium";
export type EvalSource = "daily" | "credit_pack";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "expired" | "trialing";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id?: string;
  created_at: string;
}

export interface Question {
  id: string;
  exam_type: ExamType;
  task_type?: WritingTask;
  difficulty: number;
  prompt_text: string;
  title?: string;
  module?: string;
}

export interface Exam {
  id: string;
  user_id: string;
  question_id?: string;
  exam_type: ExamType;
  task_type?: WritingTask;
  status: ExamStatus;
  attempt_number: number;
  time_taken_seconds?: number;
  eval_source: EvalSource;
  created_at: string;
  completed_at?: string;
}

export interface ExamWithEvaluation extends Exam {
  evaluations: Evaluation[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface CriterionScore {
  score: number;
  comment: string;
}

export interface Evaluation {
  id: string;
  exam_id: string;
  user_submission: string;
  overall_band: number;
  criteria_scores: Record<string, CriterionScore>;
  general_feedback: string | null;
  detailed_feedback: string | null;
  grammar_corrections: GrammarCorrection[];
  provider_used: AIProvider;
  ai_model_used?: string;
  tokens_used?: number;
  processing_time_ms?: number;
  feedback_unlocks_at: string;
  is_feedback_visible: boolean;
  created_at: string;
}

export interface DashboardStats {
  subscription_tier: SubscriptionTier;
  daily_eval_limit: number;
  daily_evals_used: number;
  daily_evals_remaining: number;
  total_exams: number;
  average_band?: number;
  highest_band?: number;
  writing_exams: number;
  speaking_exams: number;
  completed_exams: number;
  extra_credits_available: number;
}

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price_cents: number;
  currency: string;
  interval: string;
  daily_eval_limit: number;
  provider: AIProvider;
  feedback_delay_hours: number;
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
}

export interface UserCreditPack {
  id: string;
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  purchased_at: string;
  expires_at?: string;
}

// ---- Payloads ----
export interface WritingSubmissionPayload {
  exam_id: string;
  text: string;
}

export interface ApiError {
  detail: string;
  error_code?: string;
}
