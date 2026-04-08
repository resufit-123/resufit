"use client";

import { useEffect, useState } from "react";
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

// Extract first name from the top of a resume (first line, first word)
function extractFirstName(resumeText: string): string | null {
  const lines = resumeText.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const first = lines[0] ?? "";
  // Must look like a name: 2–4 words, each starting with a capital, no digits
  const words = first.split(/\s+/);
  if (
    words.length >= 2 &&
    words.length <= 5 &&
    words.every((w) => /^[A-Z][a-zA-Z'-]{1,}$/.test(w)) &&
    first.length < 55
  ) {
    return words[0]; // Return first name only
  }
  return null;
}

// Ease-out cubic count-up for the score reveal
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

export default function PreAnalysisScreen({
  analysis,
  email,
  marketingOptIn,
  onEmailChange,
  onMarketingOptInChange,
  onPurchase,
}: PreAnalysisScreenProps) {
  const { scoreBefore, predictedAfter, skills, formattingIssues, jobTitleHint, missingCount } = analysis;

  const displayScore = useCountUp(scoreBefore);
  const improvement  = predictedAfter - scoreBefore;

  const missingSkills = skills.filter((s) => s.status === "missing");
  const matchedSkills = skills.filter((s) => s.status === "matched");

  const resumeText =
    typeof window !== "undefined" ? sessionStorage.getItem("rf_resume_text") ?? "" : "";

  const firstName = extractFirstName(resumeText);

  // Animation styles (injected once)
  const animStyles = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-arrow {
      0%, 100% { transform: translateX(0); opacity: 1; }
      50%       { transform: translateX(4px); opacity: 0.7; }
    }
    .chip-animate { animation: fadeInUp 0.35s ease both; }
    .arrow-pulse  { animation: pulse-arrow 1.8s ease-in-out 1s 3; }
  `;

  return (
    <main className="min-h-screen pb-24 lg:pb-0" style={{ background: "#f9fafb" }}>
      <style>{animStyles}</style>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #f3f4f6" }}>
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-10">

          {/* Eyebrow + headline */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
            <div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
              >
                <span>✓</span> Analysis complete
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
                {firstName ? `${firstName}, your optimised resume is ready.` : "Your optimised resume is ready."}
              </h1>
              <p className="text-sm mt-2 max-w-lg" style={{ color: "#6b7280" }}>
                We&apos;ve analysed your resume against{jobTitleHint ? ` the ${jobTitleHint} role` : " the job description"} and built your tailored version.
                Unlock it below to download your PDF — ready to apply.
              </p>
            </div>
            <div
              className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold sm:mt-1"
              style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c" }}
            >
              <span>⚡</span> {missingCount} gaps found &amp; fixed
            </div>
          </div>

          {/* Score visual */}
          <div className="flex items-center gap-4 sm:gap-8">

            {/* Before */}
            <div className="text-center shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>
                Current match
              </p>
              <p
                className="font-bold leading-none"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", color: "#ef4444", fontVariantNumeric: "tabular-nums" }}
              >
                {displayScore}
                <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>%</span>
              </p>
            </div>

            {/* Arrow + bar */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${scoreBefore}%`, background: "#fca5a5", transition: "width 1s ease" }}
                  />
                </div>
                <span className="arrow-pulse text-lg shrink-0" style={{ color: "#6366f1" }}>→</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${predictedAfter}%`,
                      background: "linear-gradient(90deg, #6366f1, #10b981)",
                      transition: "width 1.2s ease 0.4s",
                    }}
                  />
                </div>
              </div>
              <div
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
              >
                +{improvement}% improvement locked in — unlock below to download
              </div>
            </div>

            {/* After */}
            <div className="text-center shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9ca3af" }}>
                Your new score
              </p>
              <p
                className="font-bold leading-none"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", color: "#6366f1", opacity: 0.45, fontVariantNumeric: "tabular-nums" }}
              >
                {predictedAfter}
                <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>%</span>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: resume + insights ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Resume preview — document aesthetic */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Doc header bar */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#fca5a5" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#fde68a" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#bbf7d0" }} />
                <p className="ml-2 text-[10px] font-medium" style={{ color: "#9ca3af" }}>
                  your-resume.pdf — optimised version ready to unlock
                </p>
              </div>

              {/* Document content */}
              <div className="relative">
                <div
                  className="px-7 pt-6 pb-4 text-xs leading-relaxed whitespace-pre-wrap overflow-hidden"
                  style={{
                    color: "#4b5563",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    maxHeight: "230px",
                    lineHeight: "1.7",
                  }}
                >
                  {resumeText.slice(0, 520) || "Resume content loaded."}
                </div>

                {/* Backdrop blur + gradient fade */}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: "155px",
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)",
                    background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.7) 45%, #ffffff 100%)",
                  }}
                />

                {/* Lock label over blur */}
                <div
                  className="absolute inset-x-0 bottom-0 flex justify-center pb-5"
                  style={{ height: "155px", alignItems: "flex-end" }}
                >
                  <div
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      color: "#4f46e5",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <span>✦</span>
                    <span>Your rewritten version is ready — unlock to download</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MISSING keywords — the gap */}
            {missingSkills.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "#ffffff",
                  border: "1px solid #fecaca",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold" style={{ color: "#991b1b" }}>
                    Keywords the ATS is looking for — not in your resume
                  </p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-3"
                    style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                  >
                    {missingSkills.length} missing
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
                  Each one is a gate the algorithm closes before a human reads your name.
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, i) => (
                    <div
                      key={skill.name}
                      className="chip-animate flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#b91c1c",
                        animationDelay: `${i * 40}ms`,
                      }}
                    >
                      <span style={{ color: "#ef4444", fontSize: "9px" }}>✗</span>
                      {skill.name}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] mt-4 pt-3" style={{ color: "#9ca3af", borderTop: "1px solid #fef2f2" }}>
                  ResuFit weaves every one of these naturally into your rewritten resume.
                </p>
              </div>
            )}

            {/* MATCHED keywords — the reassurance */}
            {matchedSkills.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold" style={{ color: "#111827" }}>
                    Keywords already in your resume
                  </p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-3"
                    style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
                  >
                    {matchedSkills.length} matched ✓
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
                  You&apos;re qualified — your resume just isn&apos;t representing you fully yet.
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((skill, i) => (
                    <div
                      key={skill.name}
                      className="chip-animate flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        color: "#166534",
                        animationDelay: `${(missingSkills.length + i) * 40}ms`,
                      }}
                    >
                      <span style={{ color: "#16a34a", fontSize: "9px" }}>✓</span>
                      {skill.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORMAT FIXES — framed as what we deliver */}
            {formattingIssues.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
              >
                <p className="text-sm font-bold mb-1" style={{ color: "#111827" }}>
                  We automatically fix these for you
                </p>
                <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
                  Common issues that cause ATS systems to misread or reject resumes.
                </p>
                <div className="space-y-2.5">
                  {formattingIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                      >
                        <span style={{ color: "#16a34a", fontSize: "9px", fontWeight: 700 }}>✓</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: payment card ── */}
          <div className="space-y-3">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                border: "1.5px solid #6366f1",
                boxShadow: "0 8px 32px rgba(99,102,241,0.14), 0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Card top accent */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <p className="text-xs font-semibold text-white">Your ResuFit report</p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                >
                  No account needed
                </span>
              </div>

              <div className="p-5">
                {/* Personalised benefit list */}
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>
                  What&apos;s included
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    "Full AI rewrite tailored to this role",
                    missingCount > 0 ? `${missingCount} missing keywords woven in` : "Keyword gaps closed",
                    formattingIssues.length > 0
                      ? `${formattingIssues.length} format issue${formattingIssues.length > 1 ? "s" : ""} fixed automatically`
                      : "ATS format verified",
                    "Download-ready PDF, instantly",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div
                        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                      >
                        <span style={{ color: "#16a34a", fontSize: "9px", fontWeight: 700 }}>✓</span>
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: "#374151" }}>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="mb-4">
                  <p
                    className="font-bold leading-none"
                    style={{ fontSize: "2.5rem", color: "#111827", letterSpacing: "-0.03em" }}
                  >
                    $5
                    <span className="text-sm font-normal ml-1" style={{ color: "#9ca3af" }}>one-time</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                    Less than a coffee. Potentially life-changing.
                  </p>
                </div>

                {/* Email */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="Email for receipt (optional)"
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3 transition-all"
                  style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#111827" }}
                />

                {/* Primary CTA */}
                <button
                  onClick={() => onPurchase("one_time")}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Get my optimised resume →
                </button>

                {/* Trust line */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="text-[10px]" style={{ color: "#d1d5db" }}>🔒 Stripe</span>
                  <span style={{ color: "#e5e7eb" }}>·</span>
                  <span className="text-[10px]" style={{ color: "#d1d5db" }}>Apple Pay</span>
                  <span style={{ color: "#e5e7eb" }}>·</span>
                  <span className="text-[10px]" style={{ color: "#d1d5db" }}>Google Pay</span>
                </div>
              </div>
            </div>

            {/* Pro — very secondary */}
            <div
              className="rounded-2xl p-4 cursor-pointer transition-all"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
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
              <p className="text-base font-bold" style={{ color: "#374151" }}>
                $15 <span className="text-xs font-normal" style={{ color: "#9ca3af" }}>/month</span>
              </p>
              <p className="text-xs mt-0.5 mb-3" style={{ color: "#9ca3af" }}>
                30 optimisations · Dashboard · Cancel anytime
              </p>
              <button
                className="w-full py-2 rounded-xl text-xs font-medium"
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280" }}
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
                className="mt-0.5 shrink-0"
                style={{ accentColor: "#6366f1" }}
              />
              <span className="text-[11px]" style={{ color: "#9ca3af" }}>
                Send me occasional job search tips from ResuFit (optional)
              </span>
            </label>

            <a href="/" className="block text-center text-xs py-1.5" style={{ color: "#d1d5db" }}>
              ← Try a different resume
            </a>
          </div>

        </div>
      </div>

      {/* ── STICKY MOBILE CTA ────────────────────────────────────── */}
      <div
        className="fixed bottom-0 inset-x-0 lg:hidden px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid #f3f4f6",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <button
          onClick={() => onPurchase("one_time")}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          Get my optimised resume — $5 →
        </button>
      </div>
    </main>
  );
}
