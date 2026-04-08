import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/fetch-job
// Accepts { url: string }, fetches the page server-side, extracts job description text.
// Rate-limited. No auth required.

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const PRIVATE_IP_RE = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/;

function isUrlSafe(url: URL): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return false;
  if (PRIVATE_IP_RE.test(host)) return false;
  return true;
}

function extractJobText(html: string): string {
  // Remove scripts, styles, nav, footer, header boilerplate
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
    // Convert block-level elements to newlines for readability
    .replace(/<\/?(p|div|section|article|li|br|h[1-6])[^>]*>/gi, "\n")
    // Strip remaining tags
    .replace(/<[^>]+>/g, " ")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    // Collapse whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Trim to ~5000 chars to stay within token budget
  if (text.length > 5000) {
    text = text.slice(0, 5000) + "\n\n[Truncated — paste the full description if needed]";
  }

  return text;
}

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = getClientIp(request);
  const { success } = await checkRateLimit(`fetch-job:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // Parse body
  let url: string;
  try {
    const body = await request.json();
    url = body?.url?.trim();
    if (!url) throw new Error("missing url");
  } catch {
    return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
  }

  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "That doesn't look like a valid URL. Try pasting the job description directly." },
      { status: 400 }
    );
  }

  if (!isUrlSafe(parsed)) {
    return NextResponse.json({ error: "URL not allowed." }, { status: 400 });
  }

  // Fetch the page with a timeout
  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        // Mimic a real browser to avoid basic bot detection
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      // LinkedIn and Glassdoor return 999/403 for bots
      if (res.status === 999 || res.status === 403 || res.status === 401) {
        return NextResponse.json(
          {
            error:
              "This site blocks automated access (LinkedIn and Glassdoor do this). Please copy and paste the job description directly.",
          },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: `Could not load that page (status ${res.status}). Try pasting the job description directly.` },
        { status: 422 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) {
      return NextResponse.json(
        { error: "That URL doesn't point to a web page. Try pasting the job description directly." },
        { status: 422 }
      );
    }

    html = await res.text();
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        error: isAbort
          ? "The page took too long to load. Try pasting the job description directly."
          : "Could not reach that URL. Try pasting the job description directly.",
      },
      { status: 422 }
    );
  }

  // Extract text
  const text = extractJobText(html);

  if (text.length < 100) {
    return NextResponse.json(
      {
        error:
          "Couldn't extract enough text from that page. The site may require sign-in — try pasting the job description directly.",
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ text });
}
