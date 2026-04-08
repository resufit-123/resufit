import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { getSystemPrompt, runOptimization } from "@/lib/anthropic";
import { estimateTokenCount, TOKEN_LIMITS, truncateToTokenLimit } from "@/lib/token-counter";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { Redis } from "@upstash/redis";
import type { OptimizeRequest } from "@/types";

// POST /api/optimize
// Two entitlement paths:
//   A. Authenticated user (Pro/Annual) — checks subscriptions table via RPC.
//   B. Guest one-time — validates Stripe session ID directly; Redis prevents session reuse.

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const ip = getClientIp(request);
  const { success: rateLimitOk } = await checkRateLimit(`optimize:${ip}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  // 2. Parse body
  let body: OptimizeRequest & { stripeSessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { resumeText, jobDescription, template, stripeSessionId } = body;

  if (!resumeText?.trim() || !jobDescription?.trim()) {
    return NextResponse.json({ error: "Resume text and job description are required." }, { status: 400 });
  }

  const validTemplates = ["executive", "modern", "minimal", "classic"];
  if (!validTemplates.includes(template)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }

  // 3. Token limits
  const resumeTokens = estimateTokenCount(resumeText);
  if (resumeTokens > TOKEN_LIMITS.resume) {
    return NextResponse.json(
      { error: "Resume is too long. Please upload a 1–3 page resume." },
      { status: 422 }
    );
  }
  const trimmedJd = truncateToTokenLimit(jobDescription, TOKEN_LIMITS.jobDescription);

  // 4. Entitlement check — two paths
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // ── Path A: Authenticated Pro/Annual user ──
    const admin = createAdminClient();
    const { data: subscription, error: subError } = await admin
      .rpc("get_active_subscription", { p_user_id: user.id })
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "No active plan found. Please complete your purchase first." },
        { status: 403 }
      );
    }

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

    const systemPrompt = await getSystemPrompt(supabase);
    let result;
    try {
      result = await runOptimization({ systemPrompt, resumeText, jobDescription: trimmedJd });
    } catch (err) {
      console.error("Optimization AI error:", err);
      return NextResponse.json({ error: "The AI optimization failed. Please try again." }, { status: 500 });
    }

    const { data: optimizationRecord } = await admin
      .from("optimizations")
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        job_title: result.jobTitle,
        company: result.company,
        template,
        score_before: result.scoreBefore,
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

  } else if (stripeSessionId) {
    // ── Path B: Guest one-time payment ──

    // Check Redis: has this Stripe session already been used?
    try {
      const redis = getRedis();
      const alreadyUsed = await redis.get(`used_session:${stripeSessionId}`);
      if (alreadyUsed) {
        return NextResponse.json(
          { error: "This purchase has already been used. Please buy a new optimisation." },
          { status: 403 }
        );
      }
    } catch (err) {
      console.error("Redis session check failed:", err);
      // Fail open if Redis is unavailable
    }

    // Validate with Stripe directly
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
    } catch (err) {
      console.error("Stripe session retrieval failed:", err);
      return NextResponse.json(
        { error: "Could not verify your payment. Please contact support at hello@resufit.co" },
        { status: 403 }
      );
    }

    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed. Please try again." }, { status: 403 });
    }

    if (stripeSession.metadata?.plan !== "one_time") {
      return NextResponse.json({ error: "Invalid session type." }, { status: 403 });
    }

    // Run optimization
    const admin = createAdminClient();
    const systemPrompt = await getSystemPrompt(admin);
    let result;
    try {
      result = await runOptimization({ systemPrompt, resumeText, jobDescription: trimmedJd });
    } catch (err) {
      console.error("Optimization AI error:", err);
      return NextResponse.json({ error: "The AI optimization failed. Please try again." }, { status: 500 });
    }

    // Mark session as used (48h TTL — well beyond any legitimate retry window)
    try {
      const redis = getRedis();
      await redis.set(`used_session:${stripeSessionId}`, "1", { ex: 60 * 60 * 48 });
    } catch (err) {
      console.error("Failed to mark session as used:", err);
    }

    return NextResponse.json({
      ...result,
      optimizationId: null,
      tokensUsed: resumeTokens,
    });

  } else {
    return NextResponse.json(
      { error: "Payment required. Please purchase a plan to optimise your resume." },
      { status: 403 }
    );
  }
}
