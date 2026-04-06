import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSystemPrompt, runSkillGapRevision } from "@/lib/anthropic";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { SkillGapRequest, SkillGapQuestion } from "@/types";

// POST /api/skill-gap
// Accepts user answers to skill gap questions and runs a single revision.
// Requires auth + valid entitlement.
// Maximum one revision per optimization_id — enforced by DB flag.

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const ip = getClientIp(request);
  const { success: rateLimitOk } = await checkRateLimit(`skillgap:${ip}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // 2. Authentication
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // 3. Parse body
  let body: SkillGapRequest & {
    optimizedResume: string;
    questions: SkillGapQuestion[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { optimizationId, answers, optimizedResume, questions } = body;

  if (!optimizationId || !optimizedResume || !questions?.length) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // 4. Verify optimization belongs to this user + hasn't already been revised
  const admin = createAdminClient();
  const { data: optimization, error: optError } = await admin
    .from("optimizations")
    .select("id, user_id, skill_gap_answered")
    .eq("id", optimizationId)
    .single();

  if (optError || !optimization) {
    return NextResponse.json({ error: "Optimization not found." }, { status: 404 });
  }

  if (optimization.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (optimization.skill_gap_answered) {
    return NextResponse.json(
      { error: "This optimization has already been revised. One revision per optimization." },
      { status: 409 }
    );
  }

  // 5. Run the revision (single AI call, no loops)
  const systemPrompt = await getSystemPrompt(supabase);
  let revisedResume: string;

  try {
    revisedResume = await runSkillGapRevision({
      systemPrompt,
      optimizedResume,
      skillGapAnswers: answers,
      questions,
    });
  } catch (err) {
    console.error("Skill gap revision error:", err);
    return NextResponse.json({ error: "Revision failed. Please try again." }, { status: 500 });
  }

  // 6. Mark revision as complete — prevents a second revision call
  await admin
    .from("optimizations")
    .update({ skill_gap_answered: true })
    .eq("id", optimizationId);

  return NextResponse.json({ revisedResume });
}
