import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting via Upstash Redis — runs at Vercel Edge.
// Applied before auth checks to block bots early.

let ratelimit: Ratelimit | null = null;

function getRatelimiter() {
  if (ratelimit) return ratelimit;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // 10 requests per minute per IP, with a sliding window
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "resufit_rl",
  });

  return ratelimit;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  try {
    const limiter = getRatelimiter();
    const { success, remaining, reset } = await limiter.limit(identifier);
    return { success, remaining, reset };
  } catch (err) {
    // If Redis is unavailable, fail open so users aren't blocked by an infra issue.
    console.error("Rate limit check failed (Redis unavailable?):", err);
    return { success: true, remaining: 1, reset: 0 };
  }
}

// Helper: extract IP from Next.js request
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
