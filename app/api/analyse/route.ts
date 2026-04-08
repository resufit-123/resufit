import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/analyse
// Fast keyword-based analysis — no AI, no cost.
// Runs immediately on submit so users see real data before paying.
// Returns: scoreBefore, skills (matched/missing), formattingIssues, resumeSnippet

// Common stop words to filter out of JD keyword extraction
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","is","are","was","were","be","been","being","have","has","had","do",
  "does","did","will","would","could","should","may","might","shall","can",
  "not","no","nor","so","yet","both","either","neither","as","if","then",
  "that","this","these","those","it","its","we","our","you","your","they",
  "their","he","she","him","her","us","them","what","which","who","whom",
  "how","when","where","why","all","any","each","every","more","most","other",
  "some","such","than","too","very","just","about","up","out","into","through",
  "during","before","after","above","below","between","same","i","my","me",
  "work","working","experience","role","position","team","company","job",
  "candidate","required","preferred","strong","excellent","good","ability",
  "skills","skill","years","year","plus","minimum","ideal","looking","seek",
  "join","help","make","create","build","ensure","support","develop","provide",
  "manage","lead","drive","responsible","responsibilities","opportunity","great",
]);

// Known tech/professional skills to specifically look for
const KNOWN_SKILLS = [
  // Languages
  "python","javascript","typescript","java","c++","c#","ruby","go","rust","swift",
  "kotlin","php","r","scala","perl","matlab","sql","html","css",
  // Frameworks/tools
  "react","next.js","vue","angular","node.js","express","django","flask","spring",
  "rails","laravel","fastapi","graphql","rest","api","git","docker","kubernetes",
  "terraform","aws","azure","gcp","figma","sketch","jira","confluence","salesforce",
  "tableau","powerbi","excel","word","powerpoint","photoshop","illustrator",
  // Concepts
  "agile","scrum","kanban","devops","ci/cd","machine learning","deep learning",
  "data science","data analysis","product management","ux","ui","seo","crm",
  "erp","saas","b2b","b2c","p&l","kpi","okr","a/b testing","analytics",
  "stakeholder","roadmap","sprint","backlog","user research","wireframing",
  // Soft skills (common JD requirements)
  "leadership","communication","collaboration","problem-solving","analytical",
  "strategic","creative","detail-oriented","self-starter","cross-functional",
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();

  // First: pick out known multi-word skills
  const found: Set<string> = new Set();
  for (const skill of KNOWN_SKILLS) {
    if (lower.includes(skill)) found.add(skill);
  }

  // Then: extract single meaningful words
  const words = lower
    .replace(/[^a-z0-9\s.#+]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  for (const w of words) {
    if (!STOP_WORDS.has(w)) found.add(w);
  }

  return Array.from(found).slice(0, 60); // cap at 60 keywords
}

function scoreResume(resumeText: string, keywords: string[]): {
  matched: string[];
  missing: string[];
  score: number;
} {
  const lower = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    if (lower.includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  // Score weighted: matched / total, capped and scaled to realistic range (20–75)
  const raw = keywords.length > 0 ? matched.length / keywords.length : 0;
  // Real resumes rarely score 0 or 100 — map to 20–75 range for "before"
  const score = Math.round(20 + raw * 55);

  return { matched, missing, score };
}

function detectFormattingIssues(resumeText: string): string[] {
  const issues: string[] = [];
  const lower = resumeText.toLowerCase();

  // Table-like content (lots of | or tab-aligned columns)
  if ((resumeText.match(/\|/g) ?? []).length > 4) {
    issues.push("Tables detected — most ATS systems can't parse them");
  }
  // Multiple columns implied by excessive whitespace/tab patterns
  if ((resumeText.match(/\t{2,}/g) ?? []).length > 3) {
    issues.push("Multi-column layout may confuse ATS parsers");
  }
  // Headers/footers (common patterns)
  if (/page \d of \d/i.test(resumeText)) {
    issues.push("Page numbers in header/footer can disrupt ATS reading");
  }
  // No clear sections
  const hasSections = /experience|education|skills|summary|objective/i.test(resumeText);
  if (!hasSections) {
    issues.push("No clear section headings found — add Experience, Skills, Education");
  }
  // Very short (thin content)
  if (resumeText.trim().split(/\s+/).length < 150) {
    issues.push("Resume appears thin — most roles expect 300–600 words");
  }
  // No dates
  if (!/20\d\d|19\d\d/.test(resumeText)) {
    issues.push("No dates found — employers expect employment period dates");
  }
  // Objective instead of summary (older style)
  if (lower.includes("objective") && !lower.includes("summary")) {
    issues.push("'Objective' statement is outdated — use a Professional Summary");
  }
  // Email/contact present
  if (!/@/.test(resumeText)) {
    issues.push("No email address detected — add contact details to the top");
  }

  return issues.slice(0, 5); // Show max 5 issues
}

export async function POST(request: NextRequest) {
  // Rate limit — more generous than optimize (5 per minute per IP)
  const ip = getClientIp(request);
  const { success } = await checkRateLimit(`analyse:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: { resumeText: string; jobDescription: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { resumeText, jobDescription } = body;
  if (!resumeText?.trim() || !jobDescription?.trim()) {
    return NextResponse.json({ error: "Both resume and job description are required." }, { status: 400 });
  }

  // Extract keywords from JD
  const keywords = extractKeywords(jobDescription);

  // Score resume against keywords
  const { matched, missing, score } = scoreResume(resumeText, keywords);

  // Detect formatting issues
  const formattingIssues = detectFormattingIssues(resumeText);

  // Extract job title hint (first meaningful phrase in JD)
  const titleMatch = jobDescription.match(
    /(?:we(?:'re| are) (?:looking|hiring|seeking) (?:for )?(?:a|an) )([^.!?\n]+)/i
  ) ?? jobDescription.match(/^([^\n.]{10,60})/);
  const jobTitleHint = titleMatch ? titleMatch[1].trim().slice(0, 60) : null;

  // Build skills array for the UI — take top matched + top missing
  const skills = [
    ...matched.slice(0, 12).map((name) => ({ name, status: "matched" as const })),
    ...missing.slice(0, 8).map((name) => ({ name, status: "missing" as const })),
  ];

  // Predicted improvement range
  const predictedAfter = Math.min(95, score + 28 + Math.floor(Math.random() * 10));

  return NextResponse.json({
    scoreBefore: score,
    predictedAfter,
    skills,
    formattingIssues,
    jobTitleHint,
    keywordsAnalysed: keywords.length,
    matchedCount: matched.length,
    missingCount: missing.length,
  });
}
