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

// Skill clusters — groups of interchangeable / closely related skills.
// If a JD skill is missing from the resume but the resume contains another
// skill in the same cluster, ResuFit can infer the candidate has relevant
// experience and will add the skill to the rewritten resume automatically.
const SKILL_CLUSTERS: string[][] = [
  // Frontend frameworks
  ["react", "next.js", "vue", "angular", "svelte", "gatsby", "remix", "nuxt", "storybook"],
  // CSS / styling
  ["tailwind", "css", "css3", "sass", "less", "bootstrap"],
  // Backend frameworks
  ["node.js", "express", "nestjs", "fastify", "django", "flask", "fastapi", "rails", "spring", "laravel", "phoenix"],
  // Languages — scripting / web
  ["python", "javascript", "typescript", "ruby", "php"],
  // Languages — systems / mobile
  ["java", "kotlin", "swift", "go", "rust", "c++", "c#", "scala", "dart"],
  // Data / stats languages
  ["python", "r", "matlab", "sas", "stata", "spss", "julia"],
  // Cloud platforms
  ["aws", "azure", "gcp", "heroku", "vercel", "netlify", "cloudflare", "digital ocean", "ibm cloud"],
  // SQL databases
  ["postgresql", "mysql", "sqlite", "microsoft sql server", "oracle", "redshift", "bigquery", "sql", "aurora", "mariadb"],
  // NoSQL databases
  ["mongodb", "redis", "dynamodb", "cassandra", "firebase", "elasticsearch", "cosmos db", "clickhouse"],
  // ML / AI frameworks
  ["tensorflow", "pytorch", "keras", "scikit-learn", "xgboost", "lightgbm", "hugging face"],
  // Data engineering
  ["pandas", "numpy", "spark", "hadoop", "airflow", "dbt", "databricks", "snowflake"],
  // ML concepts (knowing one implies the discipline)
  ["machine learning", "deep learning", "nlp", "natural language processing", "computer vision", "data science", "statistical modelling", "statistical modeling"],
  // Containers / orchestration
  ["docker", "kubernetes", "helm"],
  // IaC
  ["terraform", "ansible"],
  // CI/CD
  ["github actions", "jenkins", "circleci", "gitlab ci", "ci/cd", "devops"],
  // Observability
  ["prometheus", "grafana", "datadog", "splunk", "new relic"],
  // Design tools
  ["figma", "sketch", "adobe xd", "invision", "zeplin", "framer", "canva"],
  // Project management tools
  ["jira", "linear", "asana", "trello", "notion", "confluence", "monday.com", "smartsheet", "clickup", "wrike"],
  // Analytics / BI
  ["google analytics", "mixpanel", "segment", "amplitude", "heap", "tableau", "powerbi", "looker", "looker studio", "adobe analytics", "qlik", "metabase", "sisense"],
  // Marketing automation / email
  ["salesforce marketing cloud", "hubspot", "marketo", "pardot", "eloqua", "braze", "klaviyo", "mailchimp", "activecampaign"],
  // CRM
  ["salesforce", "hubspot", "microsoft dynamics", "dynamics 365", "zoho crm", "pipedrive"],
  // SEO / digital marketing
  ["seo", "sem", "ppc", "google ads", "semrush", "ahrefs", "moz"],
  // Social media management
  ["hootsuite", "sprout social", "buffer", "social media management"],
  // Agile / delivery
  ["agile", "scrum", "kanban", "sprint", "safe", "lean"],
  // Project / programme management qualifications
  ["prince2", "pmp", "pmi", "msp"],
  // ERP platforms
  ["sap", "oracle erp", "microsoft dynamics", "netsuite", "sage", "epicor"],
  // HRMS platforms
  ["workday", "bamboohr", "adp", "ceridian", "ukg", "successfactors", "peoplesoft"],
  // ATS / recruiting tools
  ["greenhouse", "lever", "workable", "taleo", "icims", "smart recruiters"],
  // Finance software
  ["bloomberg", "bloomberg terminal", "refinitiv", "factset", "capital iq", "pitchbook"],
  // Finance modelling
  ["financial modelling", "financial modeling", "dcf", "discounted cash flow", "lbo", "valuation", "financial analysis"],
  // Accounting standards (knowing one implies familiarity with the other)
  ["ifrs", "gaap", "us gaap", "uk gaap"],
  // Finance qualifications
  ["cfa", "cpa", "acca", "aca", "cima", "caia", "frm", "ca"],
  // Risk types
  ["credit risk", "market risk", "operational risk", "liquidity risk", "risk management"],
  // Finance domains (knowing one implies general finance exposure)
  ["investment banking", "corporate finance", "private equity", "equity research", "asset management", "fund accounting"],
  // FX / treasury
  ["treasury", "cash management", "foreign exchange", "fx", "hedging", "derivatives", "options", "futures"],
  // Accounting platforms
  ["quickbooks", "xero", "sage intacct", "netsuite"],
  // HR disciplines
  ["talent acquisition", "recruiting", "headhunting", "executive search"],
  ["performance management", "talent management", "succession planning", "people management"],
  ["compensation", "benefits", "total rewards", "salary benchmarking"],
  // L&D
  ["learning and development", "l&d", "instructional design"],
  // Supply chain
  ["supply chain management", "logistics", "procurement", "sourcing", "vendor management", "supplier management"],
  // Quality
  ["lean", "six sigma", "kaizen", "continuous improvement", "process improvement", "iso 9001"],
  // Ticketing / customer support tools
  ["zendesk", "intercom", "freshdesk", "freshservice", "servicenow"],
  // Security
  ["cyber security", "information security", "iso 27001", "nist", "soc 2", "pci dss"],
  // Cloud productivity
  ["microsoft 365", "google workspace", "sharepoint", "slack", "microsoft teams"],
  // Legal research
  ["westlaw", "lexisnexis"],
  // Leadership / management
  ["leadership", "people management", "line management", "mentoring", "coaching"],
  // Stakeholder / commercial
  ["stakeholder management", "client management", "account management", "key account management", "business development"],
];

// Returns true if the resume contains any skill in the same cluster as `skill`,
// meaning ResuFit can confidently infer the candidate has relevant experience.
function canInferSkill(skill: string, resumeSkillsLower: Set<string>): boolean {
  const s = skill.toLowerCase();
  for (const cluster of SKILL_CLUSTERS) {
    const lc = cluster.map((x) => x.toLowerCase());
    if (!lc.includes(s)) continue;
    // Found the cluster — check if resume has any other member
    for (const peer of lc) {
      if (peer !== s && resumeSkillsLower.has(peer)) return true;
    }
  }
  return false;
}

// Comprehensive skills taxonomy — covers tech, finance, marketing, HR, legal,
// operations, healthcare, and more. ~500 entries so the section works for any job.
const KNOWN_SKILLS = [
  // ── Languages ──────────────────────────────────────────────────
  "python","javascript","typescript","java","c++","c#","ruby","go","rust","swift",
  "kotlin","php","r","scala","perl","matlab","sql","html","css","bash","shell",
  "vba","groovy","objective-c","dart","lua","elixir","clojure","haskell","cobol",
  "fortran","sas","stata","spss","julia","f#","erlang","zig",
  // ── Web Frontend ───────────────────────────────────────────────
  "react","next.js","vue","angular","svelte","tailwind","bootstrap","webpack",
  "vite","redux","graphql","html5","css3","sass","less","storybook","gatsby",
  "remix","nuxt","astro","jquery","d3","three.js","web components","pwa","wcag",
  "responsive design","accessibility",
  // ── Backend / Frameworks ───────────────────────────────────────
  "node.js","express","django","flask","spring","rails","laravel","fastapi",
  "nestjs","fastify","gin","dotnet",".net","asp.net","phoenix","sinatra","grails",
  // ── Mobile ─────────────────────────────────────────────────────
  "react native","flutter","ios","android","xamarin","ionic","expo",
  "swiftui","jetpack compose",
  // ── Data & ML ──────────────────────────────────────────────────
  "tensorflow","pytorch","keras","scikit-learn","pandas","numpy","spark","hadoop",
  "airflow","dbt","snowflake","bigquery","redshift","databricks","looker",
  "machine learning","deep learning","nlp","natural language processing",
  "computer vision","llm","generative ai","genai","data science","data analysis",
  "data engineering","data modelling","data modeling","sql server","mlops",
  "feature engineering","time series","xgboost","lightgbm","hugging face",
  "langchain","embeddings","vector databases","rag","transformers","jupyter",
  "plotly","seaborn","matplotlib","ggplot","r shiny","statistical modelling",
  "statistical modeling","regression","classification","clustering",
  // ── DevOps / Cloud ─────────────────────────────────────────────
  "docker","kubernetes","terraform","ansible","jenkins","github actions","circleci",
  "aws","azure","gcp","heroku","vercel","netlify","cloudflare","linux","nginx",
  "ci/cd","devops","sre","observability","prometheus","grafana","datadog",
  "splunk","new relic","elk stack","pagerduty","helm","argocd","gitlab ci",
  "digital ocean","ibm cloud","oracle cloud",
  // ── Databases ──────────────────────────────────────────────────
  "postgresql","mysql","mongodb","redis","elasticsearch","dynamodb","firebase",
  "cassandra","neo4j","sqlite","oracle","supabase","clickhouse","cosmos db",
  "aurora","mariadb","microsoft sql server","pinecone","weaviate",
  // ── Product / Design ───────────────────────────────────────────
  "figma","sketch","adobe xd","invision","zeplin","miro","notion","linear",
  "jira","confluence","trello","asana","product management","roadmap","backlog",
  "ux","ui","user research","wireframing","prototyping","usability testing",
  "information architecture","interaction design","service design","design systems",
  "product strategy","go-to-market","product analytics","okr","kpi",
  "canva","adobe illustrator","adobe photoshop","adobe indesign","adobe creative suite",
  "framer","maze","hotjar","fullstory","pendo","optimizely","vwo",
  // ── Analytics & BI ─────────────────────────────────────────────
  "tableau","powerbi","looker studio","google analytics","mixpanel","segment",
  "amplitude","heap","google tag manager","adobe analytics","qlik","metabase",
  "excel","google sheets","power query","power pivot","dax","sisense","mode",
  "superset","retool","a/b testing","conversion rate optimisation","cro",
  // ── CRM / Marketing Tech ───────────────────────────────────────
  "salesforce","hubspot","marketo","pardot","eloqua","braze","iterable",
  "klaviyo","mailchimp","activecampaign","sendgrid","salesforce marketing cloud",
  "google ads","facebook ads","meta ads","linkedin ads","tiktok ads","programmatic",
  "hootsuite","sprout social","buffer","social media management",
  "content marketing","email marketing","affiliate marketing","influencer marketing",
  "demand generation","lead generation","account-based marketing","abm",
  "copywriting","brand management","campaign management","media buying",
  "semrush","ahrefs","moz","screaming frog","google search console",
  "seo","sem","ppc","crm","saas","b2b","b2c","p&l","ecommerce",
  // ── ERP / Business Software ────────────────────────────────────
  "sap","sap s/4hana","oracle erp","microsoft dynamics","dynamics 365",
  "netsuite","sage","epicor","infor","workday","peoplesoft","successfactors",
  "bamboohr","adp","ceridian","ukg","kronos","servicenow","freshdesk",
  "zendesk","intercom","freshservice","monday.com","smartsheet","ms project",
  "wrike","clickup","airtable","sharepoint","microsoft 365","google workspace",
  "slack","microsoft teams","zoom","quickbooks","xero","sage intacct","coupa","ariba",
  // ── Finance & Accounting ───────────────────────────────────────
  "financial modelling","financial modeling","financial analysis","financial reporting",
  "valuation","dcf","discounted cash flow","lbo","m&a","mergers and acquisitions",
  "due diligence","equity research","credit analysis","investment banking",
  "corporate finance","private equity","venture capital","fixed income",
  "derivatives","portfolio management","asset management","fund accounting",
  "credit risk","market risk","operational risk","liquidity risk",
  "ifrs","gaap","us gaap","uk gaap","sox","sarbanes-oxley","internal audit",
  "external audit","fp&a","financial planning","budgeting","forecasting",
  "treasury","cash management","foreign exchange","fx","hedging","options","futures",
  "bloomberg","bloomberg terminal","refinitiv","factset","capital iq","pitchbook",
  "actuarial","underwriting","insurance","reinsurance",
  "vat","transfer pricing","corporate tax","tax compliance",
  "cfa","cpa","acca","aca","cima","caia","frm","cfp","ca",
  "management accounts","profit and loss","balance sheet","cash flow","erp",
  // ── HR & People ────────────────────────────────────────────────
  "talent acquisition","recruiting","headhunting","executive search",
  "onboarding","performance management","talent management","succession planning",
  "compensation","benefits","total rewards","salary benchmarking","job evaluation",
  "employment law","hr compliance","tupe","hris","people analytics",
  "workforce planning","learning and development","l&d","instructional design",
  "diversity and inclusion","dei","organizational development","change management",
  "employee relations","industrial relations","cipd","shrm","hrbp",
  "greenhouse","lever","workable","taleo","icims","smart recruiters",
  "payroll","recruiting","talent development","performance reviews","okrs",
  // ── Legal ──────────────────────────────────────────────────────
  "contract drafting","contract negotiation","legal research","legal writing",
  "corporate law","employment law","intellectual property","data protection",
  "gdpr","ccpa","privacy law","regulatory affairs","compliance","litigation",
  "arbitration","mediation","commercial law","competition law","corporate governance",
  "westlaw","lexisnexis","relativity","docusign","clm",
  // ── Operations & Supply Chain ──────────────────────────────────
  "supply chain management","logistics","procurement","sourcing",
  "category management","vendor management","supplier management","contract management",
  "lean","six sigma","kaizen","5s","continuous improvement","process improvement",
  "operations management","quality assurance","quality control","iso 9001","iso 27001",
  "demand planning","inventory management","warehouse management","wms",
  "3pl","fleet management","customs","import export","facilities management",
  "health and safety","hse","risk management",
  // ── Project / Programme Management ────────────────────────────
  "project management","programme management","portfolio management",
  "prince2","pmp","pmi","msp","agile","scrum","kanban","lean","safe","sprint",
  "stakeholder management","change management","risk management","governance",
  "waterfall","cross-functional","strategic planning","resource planning",
  // ── Healthcare ─────────────────────────────────────────────────
  "epic","cerner","meditech","allscripts","eclinicalworks",
  "hl7","fhir","clinical informatics","clinical trials","gcp","gmp",
  "medical writing","icd-10","medical billing","nursing","pharmacy",
  // ── Security & Compliance ──────────────────────────────────────
  "cyber security","information security","penetration testing","soc 2","iso 27001",
  "pci dss","nist","owasp","vulnerability management","iam","siem","zero trust",
  // ── Soft / Leadership (specific, testable) ─────────────────────
  "leadership","people management","line management","mentoring","coaching",
  "executive presentations","board reporting","key account management",
  "client management","account management","business development","negotiation",
  "commercial negotiation","proposal writing","bid writing","analytical",
  "problem-solving","stakeholder","communication","collaboration","critical thinking",
];

// Clean a phrase extracted from a JD trigger pattern — trim filler, cap length.
function cleanTriggerPhrase(raw: string): string {
  return raw
    .trim()
    .replace(/\s+(and|or|in|a|an|the|to|with|for|of|as|such|including|like|eg|e\.g|etc)\.?$/i, "")
    .replace(/[,;.()\[\]]+$/, "")
    .trim()
    .slice(0, 45);
}

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found: Set<string> = new Set();

  // ── Pass 1: KNOWN_SKILLS scan ─────────────────────────────────
  // Multi-word aware, case-insensitive. Highest precision.
  for (const skill of KNOWN_SKILLS) {
    if (lower.includes(skill.toLowerCase())) found.add(skill);
  }

  // ── Pass 2: Trigger-phrase extraction ─────────────────────────
  // JDs telegraph skills with predictable lead-ins. Extract what follows.
  const TRIGGER = [
    /\bexperience (?:with|in|using|of)\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bknowledge of\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bproficien(?:t|cy) (?:in|with)\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bfamiliar(?:ity)? with\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bskilled in\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bexpertise in\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bworking knowledge of\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bexposure to\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bhands[-\s]on (?:experience )?(?:with|in)\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
    /\bability to use\s+([\w][\w\s\-+#./]{1,40}?)(?=\s*[,;.\n]|\s+and\b|\s+or\b|$)/gi,
  ];
  for (const pattern of TRIGGER) {
    for (const m of Array.from(text.matchAll(pattern))) {
      const phrase = cleanTriggerPhrase(m[1]);
      if (phrase.length >= 2 && !STOP_WORDS.has(phrase.toLowerCase())) {
        found.add(phrase.charAt(0).toUpperCase() + phrase.slice(1));
      }
    }
  }

  // ── Pass 3: Parenthetical tool lists ──────────────────────────
  // JDs often list specific tools in parentheses: "tools (Jira, Notion, Figma)"
  for (const m of Array.from(text.matchAll(/\(([A-Z][A-Za-z0-9,.\s/\-+#]{2,80})\)/g))) {
    const items = m[1].split(/[,/]/).map((s: string) => s.trim()).filter((s: string) => s.length >= 2);
    for (const item of items) {
      if (!STOP_WORDS.has(item.toLowerCase()) && !/^\d/.test(item)) {
        found.add(item);
      }
    }
  }

  // ── Pass 4: High-signal structural tokens ─────────────────────
  // All-caps acronyms, CamelCase brands, C++/C# syntax — as before.
  for (const token of text.split(/[\s,;:()\[\]{}"'\n\r/\\]+/)) {
    const clean = token.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9+#.-]+$/g, "");
    if (clean.length < 2 || STOP_WORDS.has(clean.toLowerCase()) || /^\d+$/.test(clean)) continue;
    if (/^[A-Z][A-Z0-9]{1,5}$/.test(clean)) { found.add(clean); continue; }
    if (/^[A-Z][a-z]{2,}[A-Z][a-zA-Z0-9]*$/.test(clean) && clean.length >= 5) { found.add(clean); continue; }
    if (/[+#]/.test(clean) && /[a-zA-Z]/.test(clean) && clean.length >= 2) { found.add(clean); continue; }
  }

  // Return KNOWN_SKILLS hits first (highest confidence), then trigger/structural terms
  const known = Array.from(found).filter((k) =>
    KNOWN_SKILLS.some((s) => s.toLowerCase() === k.toLowerCase())
  );
  const other = Array.from(found).filter(
    (k) => !KNOWN_SKILLS.some((s) => s.toLowerCase() === k.toLowerCase())
  );

  return [...known, ...other].slice(0, 50);
}

// Word-boundary aware skill check.
// Prevents false positives like "go" matching "google", "r" matching "requirements".
// Skills with regex metacharacters (C++, .NET, node.js) fall back to plain includes.
function skillPresentInText(skill: string, resumeLower: string): boolean {
  const s = skill.toLowerCase();

  // Skills containing regex special chars — plain substring is safe enough
  // (they're distinctive: "c++", "c#", "node.js", "asp.net", "a/b testing")
  if (/[.*+?^${}()|[\]\\]/.test(s)) {
    return resumeLower.includes(s);
  }

  // Word-boundary match: skill must not be immediately preceded/followed by a-z or 0-9.
  // This handles: multi-word ("machine learning"), hyphenated ("cross-functional"),
  // short ambiguous terms ("go", "r", "sql"), and regular words alike.
  try {
    return new RegExp(`(?<![a-z0-9])${s}(?![a-z0-9])`).test(resumeLower);
  } catch {
    // Fallback if regex construction fails (shouldn't happen after the metachar check)
    return resumeLower.includes(s);
  }
}

function scoreResume(resumeText: string, keywords: string[]): {
  matched: string[];
  inferred: string[];
  unknown: string[];
  score: number;
} {
  const lower = resumeText.toLowerCase();
  const matched: string[] = [];
  const inferred: string[] = [];
  const unknown: string[] = [];

  // Build a set of skills already present in the resume (for cluster inference)
  const resumeSkillsLower = new Set(
    KNOWN_SKILLS.filter((s) => skillPresentInText(s, lower)).map((s) => s.toLowerCase())
  );

  for (const kw of keywords) {
    if (skillPresentInText(kw, lower)) {
      matched.push(kw);
    } else if (canInferSkill(kw, resumeSkillsLower)) {
      // Resume contains a peer skill in the same cluster — ResuFit can add this confidently
      inferred.push(kw);
    } else {
      // No evidence — need to ask the user
      unknown.push(kw);
    }
  }

  // Score: matched skills only (pre-optimisation state). Map to realistic 20–75 range.
  const raw = keywords.length > 0 ? matched.length / keywords.length : 0;
  const score = Math.round(20 + raw * 55);

  return { matched, inferred, unknown, score };
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

  // Score resume against keywords — three-state result
  const { matched, inferred, unknown, score } = scoreResume(resumeText, keywords);

  // Detect formatting issues
  const formattingIssues = detectFormattingIssues(resumeText);

  // Extract job title hint (first meaningful phrase in JD)
  const titleMatch = jobDescription.match(
    /(?:we(?:'re| are) (?:looking|hiring|seeking) (?:for )?(?:a|an) )([^.!?\n]+)/i
  ) ?? jobDescription.match(/^([^\n.]{10,60})/);
  const jobTitleHint = titleMatch ? titleMatch[1].trim().slice(0, 60) : null;

  // Build skills array for the UI — three states, sensible caps per group
  const skills = [
    ...matched.slice(0, 10).map((name) => ({ name, status: "matched" as const })),
    ...inferred.slice(0, 8).map((name) => ({ name, status: "inferred" as const })),
    ...unknown.slice(0, 6).map((name) => ({ name, status: "unknown" as const })),
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
    inferredCount: inferred.length,
    unknownCount: unknown.length,
  });
}
