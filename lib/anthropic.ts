import Anthropic from "@anthropic-ai/sdk";
import type { OptimizationResult, SkillGapQuestion } from "@/types";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-haiku-4-5-20251001";
const MAX_OUTPUT_TOKENS = 4096;

// ── AI-powered skill extraction & matching ───────────────────
// Replaces the brittle keyword list approach. Claude reads both
// the JD and resume and returns a classified skill list in one pass.
// ~0.1 cent per call at Haiku pricing, ~1–2s latency.

export interface SkillMatch {
  name: string;
  status: "matched" | "inferred" | "unknown";
}

export async function extractAndMatchSkills(
  jobDescription: string,
  resumeText: string
): Promise<SkillMatch[]> {
  // Truncate to keep cost/latency tight while preserving signal
  const jd = jobDescription.slice(0, 4000);
  const resume = resumeText.slice(0, 6000);

  const prompt = `You are analyzing a resume against a job description.

Extract the 15–20 most important skills, tools, technologies, and domain-specific competencies the job requires. Skip vague phrases like "team player", "good communicator", or "strong work ethic" — focus on concrete, specific, testable skills.

For each extracted skill, classify it as one of:
- "matched": explicitly present in the resume (verbatim or near-verbatim)
- "inferred": not explicit but resume shows clearly related experience that transfers (e.g. Vue.js → React; Azure → AWS; MySQL → PostgreSQL; P&L management → financial modelling; managed a team → leadership)
- "unknown": no evidence in the resume at all — the job wants this but we can't tell if the candidate has it

Rules:
- Use the exact skill name as it appears in the job description
- Return 5–10 matched, 3–6 inferred, 3–6 unknown (adjust based on the actual resume fit)
- Shorter skill names are better: "Python" not "Python programming language"

Respond ONLY with valid JSON — no prose, no markdown fences:
{"skills": [{"name": "Python", "status": "matched"}, ...]}

<job_description>
${jd}
</job_description>

<resume>
${resume}
</resume>`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as { skills: SkillMatch[] };

  return Array.isArray(parsed.skills) ? parsed.skills : [];
}

// ── System prompt loader ──────────────────────────────────────
// Fetches the active system prompt from Supabase ai_prompts table.
// Falls back to the inline prompt if DB fetch fails.
// This allows prompt editing without code deploys.

export async function getSystemPrompt(supabase: import("@supabase/supabase-js").SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("ai_prompts")
    .select("content")
    .eq("name", "optimization_system_prompt")
    .single();

  if (error || !data) {
    console.error("Failed to load system prompt from DB, using fallback:", error);
    return FALLBACK_SYSTEM_PROMPT;
  }

  return data.content as string;
}

// ── Core optimization call ────────────────────────────────────

export interface OptimizeInput {
  systemPrompt: string;
  resumeText: string;
  jobDescription: string;
}

export async function runOptimization(input: OptimizeInput): Promise<OptimizationResult> {
  const userMessage = `
<resume>
${input.resumeText}
</resume>

<job_description>
${input.jobDescription}
</job_description>

Analyze this resume against the job description and return a JSON object with this exact structure:
{
  "optimizedResume": "<full plain text of the rebuilt resume>",
  "scoreBefor": <number 0-100>,
  "scoreAfter": <number 0-100>,
  "jobTitle": "<extracted job title or null>",
  "company": "<extracted company name or null>",
  "skills": [
    { "name": "<skill name>", "status": "matched|added|missing" }
  ],
  "atsIssues": [
    { "type": "<issue type>", "description": "<what was wrong and what was fixed>", "fixed": true|false }
  ],
  "skillGapQuestions": [
    {
      "id": "<unique id e.g. sgq_1>",
      "skill": "<skill name>",
      "question": "<specific question to ask the user>",
      "occurrences": <number of times skill appeared in JD>
    }
  ]
}

Return ONLY valid JSON. No prose before or after.
`.trim();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: input.systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    // Strip any accidental markdown code fences
    const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    return JSON.parse(cleaned) as OptimizationResult;
  } catch {
    throw new Error("AI returned invalid JSON: " + text.slice(0, 200));
  }
}

// ── Skill gap revision call ───────────────────────────────────

export interface SkillGapRevisionInput {
  systemPrompt: string;
  optimizedResume: string;
  skillGapAnswers: Record<string, string>;   // questionId -> answer
  questions: SkillGapQuestion[];
}

export async function runSkillGapRevision(input: SkillGapRevisionInput): Promise<string> {
  const answeredQuestions = input.questions
    .filter((q) => input.skillGapAnswers[q.id]?.trim())
    .map((q) => `Skill: ${q.skill}\nUser's answer: ${input.skillGapAnswers[q.id]}`)
    .join("\n\n");

  if (!answeredQuestions) return input.optimizedResume; // Nothing to revise

  const userMessage = `
Here is the current optimized resume:

<optimized_resume>
${input.optimizedResume}
</optimized_resume>

The user provided additional context about skills that were missing or unclear:

<skill_gap_answers>
${answeredQuestions}
</skill_gap_answers>

Incorporate this context naturally into the resume. Rules:
- Only add information the user explicitly confirmed — do not invent details
- Weave skills into existing bullet points where they fit naturally; create new bullets only if necessary
- Preserve the same structure, tone, and format as the current resume
- Return ONLY the complete revised resume as plain text — no commentary, no JSON
`.trim();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: input.systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  return response.content[0].type === "text" ? response.content[0].text : input.optimizedResume;
}

// ── Fallback system prompt (used if DB unavailable) ──────────
const FALLBACK_SYSTEM_PROMPT = `You are ResuFit's AI optimization engine. Your job is to rebuild resumes to pass ATS (Applicant Tracking System) filters while preserving the candidate's authentic voice and experience.

Core rules:
- Never fabricate work experience, credentials, metrics, or skills the user does not have
- Never alter employment dates, education, or certifications
- Rewrite real experience using stronger action verbs and the X-Y-Z impact formula
- Match the candidate's original tone and formality level
- Use UK or US English consistently — detect from the original resume and never mix
- Extract 15–25 keywords from the job description; weave them naturally into the resume
- Use standard ATS-safe section headers: Professional Summary, Work Experience, Education, Skills, Certifications
- Single-column layout only; no tables, graphics, or text boxes
- Maximum 3 pages output — never exceed this
- Do not use: "results-driven", "passionate", "hardworking", "team player", "dynamic"
- Identify up to 3 skill gaps (skills prominent in the JD but absent from the resume) for follow-up questions`;
