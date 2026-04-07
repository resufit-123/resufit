// ─────────────────────────────────────────────────────────────
// ResuFit — Shared TypeScript types
// ─────────────────────────────────────────────────────────────

export type Plan = "one_time" | "pro" | "annual";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";
export type Currency = "usd" | "gbp" | "eur";
export type Template = "executive" | "modern" | "minimal" | "classic";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  optimizations_used_this_period: number;
  optimizations_limit: number; // 1 for one_time, 30 for pro, 50 for annual
  created_at: string;
}

export interface Optimization {
  id: string;
  user_id: string;
  job_title: string | null;
  company: string | null;
  template: Template;
  score_before: number;
  score_after: number;
  ai_model_used: string;
  tokens_used: number;
  skill_gap_answered: boolean;
  resume_stored: boolean;
  resume_url: string | null;
  resume_expires_at: string | null;
  created_at: string;
}

// ── AI output types ──────────────────────────────

export type SkillStatus = "matched" | "added" | "confirmed" | "missing";

export interface SkillResult {
  name: string;
  status: SkillStatus;
}

export interface AtsIssue {
  type: string;
  description: string;
  fixed: boolean;
}

export interface OptimizationResult {
  optimizedResume: string;      // Markdown/plain text of the rebuilt resume
  scoreBefor: number;           // 0–100
  scoreAfter: number;           // 0–100
  skills: SkillResult[];
  atsIssues: AtsIssue[];
  skillGapQuestions: SkillGapQuestion[];  // Up to 3 targeted questions
  jobTitle: string | null;
  company: string | null;
  optimizationId: string | null;
}

export interface SkillGapQuestion {
  id: string;
  skill: string;       // e.g. "SQL"
  question: string;    // Full question text shown to user
  occurrences: number; // How many times skill appeared in JD
}

// ── API request/response types ───────────────────

export interface UploadResponse {
  resumeText: string;
  tokenCount: number;
  fileName: string;
}

export interface OptimizeRequest {
  resumeText: string;
  jobDescription: string;
  template: Template;
}

export interface SkillGapRequest {
  optimizationId: string;
  answers: Record<string, string>; // questionId -> answer text
}

export interface CheckoutRequest {
  priceId: string;
  currency: Currency;
  plan: Plan;
  optimizationId?: string;  // Pre-link payment to an optimization session
  email?: string;
  marketingOptIn: boolean;
}
