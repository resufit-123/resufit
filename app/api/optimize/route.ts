import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSystemPrompt, runOptimization } from "@/lib/anthropic";
import { estimateTokenCount, TOKEN_LIMITS, truncateToTokenLimit } from "@/lib/token-counter";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { OptimizeRequest } from "@/types";

// POST /api/optimize
// Requires authentication + valid entitlement (written by Stripe webhook).
// Enforces usage limits server-side before any AI call.
// Payment-before-AI principle: no AI call without confirmed entitlement.

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const ip = getClientIp(request);
  const { success: rateLimitOk } = await checkRateLimit(`optimize:${ip}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // 2. Authentication — verify JWT, extract real user_id
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // 3. Parse and validate request body
  let body: OptimizeRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { resumeText, jobDescription, template } = body;

  if (!resumeText?.trim() || !jobDescription?.trim()) {
    return NextResponse.json({ error: "Resume text and job description are required." }, { status: 400 });
  }

  const validTemplates = ["executive", "modern", "minimal", "classic"];
  if (!validTemplates.includes(template)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }

  // 4. Check token limits (server-side re-validation — don't trust client)
  const resumeTokens = estimateTokenCount(resumeText);
  if (resumeTokens > TOKEN_LIMITS.resume) {
    return NextResponse.json(
      { error: "Resume is too long. Please upload a 1–3 page resume." },
      { status: 422 }
    );
  }

  // Truncate JD if over limit (soft limit — we don't reject, just trim)
  const trimmedJd = truncateToTokenLimit(jobDescription, TOKEN_LIMITS.jobDescription);

  // 5. Entitlement check — uses service role to bypass RLS
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription, error: subError } = await (admin as any)
    .rpc("get_active_subscription", { p_user_id: user.id })
    .single();

  if (subError || !subscription) {
    return NextResponse.json(
      { error: "No active plan found. Please complete your purchase first." },
      { status: 403 }
    );
  }

  // 6. Usage limit check
  if (subscription.optimizations_used_this_period >= subscription.optimizations_limit) {
    return NextResponse.json(
      {
        error: "Monthly optimization limit reached.",
        code: "LIMIT_REACHED",
        plan: subscription.plan,
        used: subscription.optimizations_used_this_period,
        limit: subscription.optimizations_limit,
      },
      { status: 403 }
    );
  }

  // 7. Fetch active system prompt from DB
  const systemPrompt = await getSystemPrompt(supabase);

  // 8. Run the AI optimization
  let result;
  try {
    result = await runOptimization({
      systemPrompt,
      resumeText,
      jobDescription: trimmedJd,
    });
  } catch (err) {
    console.error("Optimization AI error:", err);
    return NextResponse.json(
      { error: "The AI optimization failed. Please try again." },
      { status: 500 }
    );
  }

  // 9. Log the optimization + increment usage counter (admin client to bypass RLS)
  const { data: optimizationRecord } = await admin
    .from("optimizations")
    .insert({
      user_id: user.id,
      subscription_id: subscription.id,
      job_title: result.jobTitle,
      company: result.company,
      template,
      score_before: result.scoreBefor,
      score_after: result.scoreAfter,
      ai_model_used: "claude-haiku-4-5-20251001",
      tokens_used: resumeTokens + estimateTokenCount(trimmedJd),
      skill_gap_answered: false,
    })
    .select("id")
    .single();

  await admin
    .from("subscriptions")
    .update({
      optimizations_used_this_period: subscription.optimizations_used_this_period + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscription.id);

  return NextResponse.json({
    ...result,
    optimizationId: optimizationRecord?.id ?? null,
    tokensUsed: resumeTokens,
  });
}
