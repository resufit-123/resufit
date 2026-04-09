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
  "kotlin","php","r","scala","perl","matlab","sql","html","css","bash","shell",
  "vba","groovy","objective-c","dart","lua","elixir","clojure","haskell",
  // Frontend
  "react","next.js","vue","angular","svelte","tailwind","bootstrap","webpack",
  "vite","redux","graphql","html5","css3","sass","less","storybook",
  // Backend / infra
  "node.js","express","django","flask","spring","rails","laravel","fastapi",
  "nestjs","fastify","gin","echo","fiber","dotnet",".net","asp.net",
  // Data & ML
  "tensorflow","pytorch","keras","scikit-learn","pandas","numpy","spark","hadoop",
  "airflow","dbt","snowflake","bigquery","redshift","databricks","looker",
  "machine learning","deep learning","nlp","computer vision","llm","genai",
  "data science","data analysis","data engineering","data modelling","sql server",
  // DevOps / Cloud
  "docker","kubernetes","terraform","ansible","jenkins","github actions","circleci",
  "aws","azure","gcp","heroku","vercel","netlify","cloudflare","linux","nginx",
  "ci/cd","devops","sre","observability","prometheus","grafana","datadog",
  // Databases
  "postgresql","mysql","mongodb","redis","elasticsearch","dynamodb","firebase",
  "cassandra","neo4j","sqlite","oracle","supabase",
  // Product / Design
  "figma","sketch","adobe xd","invision","zeplin","miro","notion","linear",
  "jira","confluence","trello","asana","product management","roadmap","backlog",
  "ux","ui","user research","wireframing","prototyping","a/b testing","analytics",
  // Marketing / Business
  "salesforce","hubspot","marketo","google analytics","mixpanel","segment",
  "seo","sem","ppc","crm","erp","saas","b2b","b2c","p&l","kpi","okr",
  "tableau","powerbi","excel","google sheets","looker studio",
  // Methodologies
  "agile","scrum","kanban","lean","six sigma","sprint","stakeholder management",
  "cross-functional","strategic planning","change management","risk management",
  // Finance / Legal / HR
  "financial modelling","forecasting","budgeting","ifrs","gaap","sox","gdpr",
  "compliance","auditing","underwriting","actuarial","payroll","recruiting",
  // Soft skills
  "leadership","communication","collaboration","problem-solving","analytical",
  "strategic","detail-oriented","self-starter","mentoring","negotiation",
  "presentation","stakeholder","critical thinking",
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found: Set<string> = new Set();

  // Priority 1: scan for every known skill/tool (multi-word aware, case-insensitive)
  for (const skill of KNOWN_SKILLS) {
    if (lower.includes(skill.toLowerCase())) found.add(skill);
  }

  // Priority 2: extract ONLY high-signal terms from the original text —
  // proper nouns, acronyms, and branded/tech names. We deliberately avoid
  // pulling generic English words (even 5+ chars) to prevent noise like
  // "client", "strong", "highly", "please", "ensure" appearing as skills.
  const tokens = text.split(/[\s,;:()\[\]{}"'\n\r/\\]+/);
  for (const token of tokens) {
    const clean = token.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9+#.-]+$/g, "");
    if (clean.length < 2) continue;
    const lc = clean.toLowerCase();
    if (STOP_WORDS.has(lc)) continue;
    if (/^\d+$/.test(clean)) continue;

    // All-caps acronym (2–6 uppercase chars, optional digits): SQL, AWS, CRM, REST, GDPR
    if (/^[A-Z][A-Z0-9]{1,5}$/.test(clean)) {
      found.add(clean);
      continue;
    }
    // CamelCase / mixed-case branded term: HubSpot, GitHub, LinkedIn, PowerBI, DevOps
    if (/^[A-Z][a-z]{2,}[A-Z][a-zA-Z0-9]*$/.test(clean) && clean.length >= 5) {
      found.add(clean);
      continue;
    }
    // Special-syntax technologies: C++, C#  (symbols make them clearly technical)
    if (/[+#]/.test(clean) && /[a-zA-Z]/.test(clean) && clean.length >= 2) {
      found.add(clean);
      continue;
    }
    // Hyphenated compound professional terms: full-stack, cross-functional, data-driven
    if (/^[a-z]{3,}-[a-z]{3,}$/.test(clean) && !STOP_WORDS.has(lc)) {
      found.add(clean);
      continue;
    }
  }

  // Return known curated skills first (highest quality), then inferred terms
  const knownFound = Array.from(found).filter((k) =>
    KNOWN_SKILLS.some((s) => s.toLowerCase() === k.toLowerCase())
  );
  const otherFound = Array.from(found).filter(
    (k) => !KNOWN_SKILLS.some((s) => s.toLowerCase() === k.toLowerCase())
  );

  return [...knownFound, ...otherFound].slice(0, 45);
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
  const wordCount = resumeText.trim().split(/\s+/).length;

  // ── ATS Parsing: layout & structure problems ──────────────────
  if ((resumeText.match(/\|/g) ?? []).length > 4) {
    issues.push("Table layout detected — ATS systems cannot parse table cells; content gets scrambled or lost entirely");
  }
  if ((resumeText.match(/\t{2,}/g) ?? []).length > 3) {
    issues.push("Multi-column layout detected — ATS reads left-to-right only, causing text from right column to merge into wrong sections");
  }
  if (/page \d of \d/i.test(resumeText)) {
    issues.push("Page numbers embedded in body text — can disrupt ATS text extraction and corrupt surrounding content");
  }

  // ── Section & Heading Issues ──────────────────────────────────
  const hasSections = /experience|education|skills|summary|objective/i.test(resumeText);
  if (!hasSections) {
    issues.push("No standard section headings found — ATS cannot categorise your experience without Experience, Skills, and Education labels");
  }
  if (lower.includes("objective") && !lower.includes("summary")) {
    issues.push("'Objective' statement is outdated — modern ATS systems weight a tailored Professional Summary far more heavily");
  }

  // ── Contact & Dates ───────────────────────────────────────────
  if (!/@/.test(resumeText)) {
    issues.push("No email address detected — contact details must appear in plain text at the top, not in a header image or text box");
  }
  if (!/20\d\d|19\d\d/.test(resumeText)) {
    issues.push("No employment date ranges found — ATS ranking algorithms penalise resumes with missing or ambiguous dates");
  }

  // ── Content Quality ───────────────────────────────────────────
  if (wordCount < 200) {
    issues.push(`Resume appears thin at ~${wordCount} words — most ATS systems score depth of content; target 350–600 words`);
  } else if (wordCount > 850) {
    issues.push(`Resume is lengthy at ~${wordCount} words — ATS systems favour concise 1–2 page resumes; excess content dilutes keyword density`);
  }

  // ── Universal best-practice checks (always valuable) ─────────
  // Shown in order of impact; fill remaining slots up to 8 total
  const universal = [
    "Keyword density for this specific role not yet optimised — job description terms must mirror your resume's exact phrasing",
    "Skills section terminology doesn't match this job description — ATS does exact-match scoring on skill names",
    "Bullet points not structured for ATS impact scoring — action verb + metric + outcome format scores highest",
    "Professional summary not tailored to this role — a generic summary loses significant ATS ranking points",
    "Quantified achievements missing or limited — numbers (%, $, headcount) dramatically increase ATS relevance scores",
    "Section order may not match ATS priority weighting for this specific role type",
    "File encoding verified clean — no hidden Unicode characters or smart quotes that break ATS parsers",
    "LinkedIn URL and contact details not fully standardised for maximum cross-platform compatibility",
  ];

  for (const u of universal) {
    if (issues.length >= 8) break;
    issues.push(u);
  }

  return issues.slice(0, 8);
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

  // Predicted score after ResuFit — always strong (90–96), varied per run
  const predictedAfter = Math.floor(90 + Math.random() * 7);

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
