"use client";

import type { Plan } from "@/types";
import type { AnalysisResult } from "@/app/results/[id]/page";

interface PreAnalysisScreenProps {
  analysis: AnalysisResult;
  email: string;
  marketingOptIn: boolean;
  onEmailChange: (v: string) => void;
  onMarketingOptInChange: (v: boolean) => void;
  onPurchase: (plan: Plan) => void;
}

export default function PreAnalysisScreen({
  analysis,
  email,
  marketingOptIn,
  onEmailChange,
  onMarketingOptInChange,
  onPurchase,
}: PreAnalysisScreenProps) {
  const {
    scoreBefore,
    predictedAfter,
    skills,
    formattingIssues,
    jobTitleHint,
    missingCount,
    matchedCount,
  } = analysis;

  const improvement = predictedAfter - scoreBefore;

  const resumeText =
    typeof window !== "undefined"
      ? sessionStorage.getItem("rf_resume_text") ?? ""
      : "";

  const resumeSnippet = resumeText.slice(0, 480);

  return (
    <main className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* ── Score hero ───────────────────────────────────── */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #f3f4f6" }}>
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#9ca3af" }}>
                Analysis complete
              </p>
              {jobTitleHint && (
                <p className="text-sm font-medium" style={{ color: "#374151" }}>
                  {jobTitleHint}
                </p>
              )}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#15803d",
              }}
            >
              <span>⚡</span> Instant results ready
            </div>
          </div>

          {/* Score bars */}
          <div className="flex items-center gap-6">
            <div className="text-center w-24 shrink-0">
              <p className="text-xs mb-1 font-medium" style={{ color: "#9ca3af" }}>Your score now</p>
              <p className="text-4xl font-bold" style={{ color: "#ef4444" }}>
                {scoreBefore}<span className="text-xl font-semibold">%</span>
              </p>
            </div>

            <div className="flex-1">
              <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${scoreBefore}%`, background: "#fca5a5" }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full opacity-30"
                  style={{
                    width: `${predictedAfter}%`,
                    background: "linear-gradient(90deg, #6366f1, #10b981)",
                  }}
                />
              </div>
              <div className="flex justify-center mt-2.5">
                <div
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
                >
                  ResuFit typically adds +{improvement}%
                </div>
              </div>
            </div>

            <div className="text-center w-24 shrink-0">
              <p className="text-xs mb-1 font-medium" style={{ color: "#9ca3af" }}>After ResuFit</p>
              <p className="text-4xl font-bold" style={{ color: "#6366f1", opacity: 0.5 }}>
                ~{predictedAfter}<span className="text-xl font-semibold">%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: resume preview + skills ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Resume preview */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="px-5 py-3 border-b" style={{ borderColor: "#f3f4f6" }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#d1d5db" }}>
                  Your current resume
                </p>
              </div>

              <div className="relative">
                <div
                  className="px-6 pt-5 pb-4 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-hidden"
                  style={{ color: "#6b7280", maxHeight: "210px" }}
                >
                  {resumeSnippet || "Resume content loaded."}
                </div>

                {/* Gradient fade */}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: "140px",
                    background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 50%, #ffffff 100%)",
                  }}
                />

                <div
                  className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-5"
                  style={{ height: "140px" }}
                >
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      color: "#4f46e5",
                    }}
                  >
                    <span>🔒</span>
                    <span>ResuFit rewrites this around the exact role — unlock below</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                  Skills for this role
                </p>
                <div className="flex gap-2">
                  {matchedCount > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                      {matchedCount} matched
                    </span>
                  )}
                  {missingCount > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fef2f2", color: "#dc2626" }}>
                      {missingCount} missing
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                    style={{
                      background: skill.status === "matched" ? "#f5f3ff" : "#fef2f2",
                      border: `1px solid ${skill.status === "matched" ? "#ddd6fe" : "#fecaca"}`,
                    }}
                  >
                    <span style={{ color: skill.status === "matched" ? "#7c3aed" : "#dc2626" }}>
                      {skill.status === "matched" ? "✓" : "✗"}
                    </span>
                    <span style={{ color: skill.status === "matched" ? "#6d28d9" : "#b91c1c" }}>
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] mt-4 pt-3 border-t" style={{ color: "#9ca3af", borderColor: "#f3f4f6" }}>
                ResuFit weaves the missing keywords naturally into your rewritten resume.
              </p>
            </div>

            {/* Formatting issues */}
            {formattingIssues.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>
                  Format issues we&apos;ll fix
                </p>
                <div className="space-y-2.5">
                  {formattingIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 shrink-0" style={{ color: "#f59e0b" }}>⚠</span>
                      <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: payment ── */}
          <div className="space-y-3">

            {/* One-time */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "#ffffff",
                border: "2px solid #6366f1",
                boxShadow: "0 4px 24px rgba(99,102,241,0.12)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold" style={{ color: "#111827" }}>One-time download</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
                >
                  No account needed
                </span>
              </div>

              <p className="text-3xl font-bold mb-1" style={{ color: "#111827" }}>
                $5
                <span className="text-sm font-normal ml-1" style={{ color: "#9ca3af" }}>one-time</span>
              </p>

              <ul className="space-y-1.5 my-4">
                {[
                  "Full AI resume rewrite",
                  `${missingCount} missing keywords woven in`,
                  "Formatting issues fixed",
                  "Download-ready PDF",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "#4b5563" }}>
                    <span style={{ color: "#10b981" }}>✓</span> {item}
                  </li>
                ))}
              </ul>

              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Email for receipt (optional)"
                className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
                style={{
                  background: "#f9fafb",
                  border: "1.5px solid #e5e7eb",
                  color: "#111827",
                }}
              />

              <button
                onClick={() => onPurchase("one_time")}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                Unlock my optimised resume →
              </button>

              <p className="text-center text-[10px] mt-3" style={{ color: "#d1d5db" }}>
                Secured by Stripe · Apple Pay &amp; Google Pay accepted
              </p>
            </div>

            {/* Pro */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", cursor: "pointer" }}
              onClick={() => onPurchase("pro")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: "#374151" }}>ResuFit Pro</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "#f5f3ff", color: "#7c3aed" }}
                >
                  Best value
                </span>
              </div>
              <p className="text-lg font-bold mb-0.5" style={{ color: "#374151" }}>
                $15<span className="text-xs font-normal" style={{ color: "#9ca3af" }}>/month</span>
              </p>
              <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
                30 optimisations/month · Dashboard · Cancel anytime
              </p>
              <button
                className="w-full py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  color: "#6b7280",
                }}
              >
                Create account &amp; get Pro →
              </button>
            </div>

            {/* Marketing */}
            <label className="flex items-start gap-2 cursor-pointer px-1">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => onMarketingOptInChange(e.target.checked)}
                className="mt-0.5 shrink-0"
                style={{ accentColor: "#6366f1" }}
              />
              <span className="text-[11px]" style={{ color: "#9ca3af" }}>
                Send me occasional job search tips from ResuFit (optional)
              </span>
            </label>

            <a href="/" className="block text-center text-xs py-2" style={{ color: "#d1d5db" }}>
              ← Try a different resume
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
