// Local token estimation — no API call, no cost.
// Uses the standard rough approximation: 1 token ≈ 4 characters.
// This is conservative (real tokenization varies) but good enough
// for enforcing upload limits before sending anything to the AI.

const CHARS_PER_TOKEN = 4;

export const TOKEN_LIMITS = {
  resume: 3000,       // Hard cap on extracted resume text
  jobDescription: 2000, // Recommended limit for JD
} as const;

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function assertResumeTokenLimit(text: string): void {
  const count = estimateTokenCount(text);
  if (count > TOKEN_LIMITS.resume) {
    throw new Error(
      `This document is too long to be a resume (estimated ${count} tokens). ` +
        `Please upload a 1–3 page resume (maximum ${TOKEN_LIMITS.resume} tokens).`
    );
  }
}

export function truncateToTokenLimit(text: string, limit: number): string {
  const maxChars = limit * CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}
