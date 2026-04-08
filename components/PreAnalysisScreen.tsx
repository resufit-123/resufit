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

  // Show first ~500 chars of resume as preview
  const resumeSnippet = resumeText.slice(0, 500);

  return (
    <main
      className="min-h-screen"
      style={{ background: "#0f172a" }}
    >
      {/* ── Score hero ───────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(124,58,237,0.12) 0%, transparent 100%)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#64748b" }}>
                Analysis complete
              </p>
              {jobTitleHint && (
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  {jobTitleHint}
                </p>
              )}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#10b981",
              }}
            >
              <span>⚡</span> Instant analysis ready
            </div>
          </div>

          {/* Score comparison */}
          <div className="flex items-center gap-6">
            {/* Before */}
            <div className="text-center w-20 shrink-0">
              <p className="text-xs mb-1" style={{ color: "#64748b" }}>Your score</p>
              <p className="text-4xl font-bold" style={{ color: "#f87171" }}>
                {scoreBefore}
                <span className="text-xl">%</span>
              </p>
            </div>

            {/* Progress bar */}
            <div className="flex-1">
              <div
                className="relative h-3 rounded-full overflow-hidden"
                style={{ background: "#1e293b" }}
              >
                {/* Current score */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${scoreBefore}%`,
                    background: "rgba(248,113,113,0.5)",
                  }}
                />
                {/* Predicted after line */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full opacity-40"
                  style={{
                    width: `${predictedAfter}%`,
                    background: "linear-gradient(90deg, #7c3aed, #10b981)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs" style={{ color: "#475569" }}>0%</p>
                <div
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                  }}
                >
                  ResuFit typically adds +{improvement}%
                </div>
                <p className="text-xs" style={{ color: "#475569" }}>100%</p>
              </div>
            </div>

            {/* Predicted after */}
            <div className="text-center w-20 shrink-0">
              <p className="text-xs mb-1" style={{ color: "#64748b" }}>After ResuFit</p>
              <p className="text-4xl font-bold" style={{ color: "#a78bfa", opacity: 0.6 }}>
                ~{predictedAfter}
                <span className="text-xl">%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: resume preview + skills ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Resume preview with blur */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid #334155" }}
            >
              <div
                className="px-5 py-3"
                style={{ background: "#1e293b", borderBottom: "1px solid #1e293b" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
                  Your current resume
                </p>
              </div>

              <div className="relative" style={{ background: "#1e293b" }}>
                {/* Visible top portion */}
                <div
                  className="px-6 pt-5 pb-4 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-hidden"
                  style={{ color: "#94a3b8", maxHeight: "220px" }}
                >
                  {resumeSnippet || "Resume content loaded."}
                </div>

                {/* Gradient blur overlay — strong, covering lower 60% */}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: "160px",
                    background: "linear-gradient(to bottom, transparent 0%, rgba(30,41,59,0.85) 45%, #1e293b 100%)",
                  }}
                />

                {/* Lock icon + label in the blur zone */}
                <div
                  className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-5"
                  style={{ height: "160px" }}
                >
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(124,58,237,0.3)",
                      color: "#a78bfa",
                    }}
                  >
                    <span>🔒</span>
                    <span>ResuFit rewrites this for the exact role — unlock below</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills grid */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#1e293b", border: "1px solid #334155" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                  Skills for this role
                </p>
                <div className="flex gap-2">
                  {matchedCount > 0 && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                    >
                      {matchedCount} matched
                    </span>
                  )}
                  {missingCount > 0 && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                    >
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
                      background: skill.status === "matched"
                        ? "rgba(99,102,241,0.08)"
                        : "rgba(239,68,68,0.06)",
                      border: `1px solid ${skill.status === "matched" ? "rgba(99,102,241,0.2)" : "rgba(239,68,68,0.15)"}`,
                    }}
                  >
                    <span style={{ color: skill.status === "matched" ? "#818cf8" : "#f87171" }}>
                      {skill.status === "matched" ? "✓" : "✗"}
                    </span>
                    <span style={{ color: skill.status === "matched" ? "#c7d2fe" : "#fca5a5" }}>
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] mt-4" style={{ color: "#475569" }}>
                ResuFit weaves the missing keywords naturally into your rewritten resume.
              </p>
            </div>

            {/* Formatting issues */}
            {formattingIssues.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "#1e293b", border: "1px solid #334155" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>
                  Format issues we&apos;ll fix
                </p>
                <div className="space-y-2">
                  {formattingIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 shrink-0" style={{ color: "#f87171" }}>⚠</span>
                      <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: payment card ── */}
          <div className="space-y-3">
            {/* One-time — prominent */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#1e293b", border: "2px solid #8b5cf6" }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">One-time download</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
                >
                  No account needed
                </span>
              </div>

              <p className="text-3xl font-bold text-white mt-2 mb-1">
                $5
                <span className="text-sm font-normal" style={{ color: "#64748b" }}> one-time</span>
              </p>

              <ul className="space-y-1.5 mb-4 mt-3">
                {[
                  "Full AI resume rewrite",
                  `${missingCount} missing keywords added`,
                  "Formatting issues fixed",
                  "Download-ready PDF",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
                    <span style={{ color: "#10b981" }}>✓</span> {item}
                  </li>
                ))}
              </ul>

              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Email for receipt (optional)"
                className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 mb-3"
                style={{ background: "rgba(15,23,42,0.6)", border: "1px solid #334155" }}
              />

              <button
                onClick={() => onPurchase("one_time")}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                }}
              >
                Unlock my optimised resume →
              </button>

              <p className="text-center text-[10px] mt-2" style={{ color: "#475569" }}>
                Secured by Stripe · Apple Pay &amp; Google Pay accepted
              </p>
            </div>

            {/* Pro — secondary */}
            <div
              className="rounded-2xl p-4 cursor-pointer transition-all"
              style={{ background: "rgba(15,23,42,0.5)", border: "1px solid #334155" }}
              onClick={() => onPurchase("pro")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>ResuFit Pro</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}
                >
                  Best value
                </span>
              </div>
              <p className="text-lg font-bold mb-1" style={{ color: "#94a3b8" }}>
                $15<span className="text-xs font-normal" style={{ color: "#475569" }}>/month</span>
              </p>
              <p className="text-xs mb-3" style={{ color: "#475569" }}>
                30 optimisations/month · Dashboard · Cancel anytime
              </p>
              <button
                className="w-full py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: "transparent", border: "1px solid #334155", color: "#64748b" }}
              >
                Create account &amp; get Pro →
              </button>
            </div>

            {/* Marketing opt-in */}
            <label className="flex items-start gap-2 cursor-pointer px-1">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => onMarketingOptInChange(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                style={{ accentColor: "#8b5cf6" }}
              />
              <span className="text-[11px]" style={{ color: "#475569" }}>
                Send me occasional job search tips from ResuFit (optional)
              </span>
            </label>

            {/* Back link */}
            <a
              href="/"
              className="block text-center text-xs py-2"
              style={{ color: "#334155" }}
            >
              ← Try a different resume
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
