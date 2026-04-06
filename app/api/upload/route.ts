import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, ExtractionError } from "@/lib/extract-text";
import { estimateTokenCount, assertResumeTokenLimit } from "@/lib/token-counter";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/upload
// Accepts a multipart/form-data upload with a "resume" field.
// Returns extracted text and token count.
// Does NOT require authentication — extraction is free/local.
// Rate-limited per IP to prevent abuse.

export async function POST(request: NextRequest) {
  // 1. Rate limit check (before anything else)
  const ip = getClientIp(request);
  const { success, remaining } = await checkRateLimit(`upload:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  // 2. Parse the multipart form
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
  }

  const file = formData.get("resume");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No resume file provided." }, { status: 400 });
  }

  // 3. Extract text (validates MIME, size, encryption)
  let result;
  try {
    result = await extractTextFromFile(file);
  } catch (err) {
    if (err instanceof ExtractionError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 422 });
    }
    console.error("Unexpected extraction error:", err);
    return NextResponse.json({ error: "Failed to read the file." }, { status: 500 });
  }

  // 4. Token limit check (local, no API call)
  try {
    assertResumeTokenLimit(result.text);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Document too long.",
        code: "TOKEN_LIMIT_EXCEEDED",
      },
      { status: 422 }
    );
  }

  const tokenCount = estimateTokenCount(result.text);

  return NextResponse.json({
    resumeText: result.text,
    tokenCount,
    fileName: result.fileName,
  });
}
