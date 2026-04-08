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

// Extract first name from the top of a resume
function extractFirstName(resumeText: string): string | null {
  const lines = resumeText.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const first = lines[0] ?? "";
  const words = first.split(/\s+/);
  if (
    words.length >= 2 &&
    words.length <= 5 &&
    words.every((w) => /^[A-Z][a-zA-Z'-]{1,}$/.test(w)) &&
    first.length < 55
  ) {
    return words[0];
  }
  return null;
}

// First third of resume by line count
function firstThird(resumeText: string): string {
  const lines = resumeText.trim().split("\n");
  const cutoff = Math.max(Math.ceil(lines.length / 3), 8); // at least 8 lines
  return lines.slice(0, cutoff).join("\n");
}

// ── Animated SVG circle gauge ─────────────────────────────
interface CircleGaugeProps {
  score: number;
  label: string;
  sublabel?: string;
  trackColor: string;
  fillColor: string;
  textColor: string;
  animateDelay?: number; // ms
  size?: number;
  strokeWidth?: number;
  dim?: boolean;
}

function CircleGauge({
  score,
  label,
  sublabel,
  trackColor,
  fillColor,
  textColor,
  animateDelay = 0,
  size = 148,
  strokeWidth = 11,
  dim = false,
}: CircleGaugeProps) {
  const [filled, setFilled] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - score / 100);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), animateDelay);
    return () => clearTimeout(t);
  }, [animateDelay]);

  return (
    <div className="flex flex-col items-center" style={{ opacity: dim ? 0.45 : 1 }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={`gauge-fill-${score}-${animateDelay}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fillColor} />
              <stop offset="100%" stopColor={fillColor === "#ef4444" ? "#f87171" : "#10b981"} />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          {/* Fill arc — draws in on mount */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={`url(#gauge-fill-${score}-${animateDelay})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={filled ? targetOffset : circumference}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: `stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1) ${animateDelay * 0.001}s` }}
          />
        </svg>

        {/* Score text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-black leading-none"
            style={{ fontSize: size * 0.26, color: textColor, fontVariantNumeric: "tabular-nums" }}
          >
            {score}
          </span>
          <span className="font-semibold" style={{ fontSize: size * 0.12, color: textColor, opacity: 0.7 }}>%</span>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider mt-3" style={{ color: textColor === "#ef4444" ? "#ef4444" : "#374151" }}>
        {label}
      </p>
      {sublabel && (
        <p className="text-[11px] mt-0.5 text-center max-w-[120px]" style={{ color: "#9ca3af" }}>{sublabel}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────

export default function PreAnalysisScreen({
  analysis,
  email,
  marketingOptIn,
  onEmailChange,
  onMarketingOptInChange,
  onPurchase,
}: PreAnalysisScreenProps) {
  const { scoreBefore, predictedAfter, skills, formattingIssues, jobTitleHint, missingCount } = analysis;

  const improvement  = predictedAfter - scoreBefore;
  const missingSkills = skills.filter((s) => s.status === "missing");
  const matchedSkills = skills.filter((s) => s.status === "matched");

  const resumeText =
    typeof window !== "undefined" ? sessionStorage.getItem("rf_resume_text") ?? "" : "";

  const firstName     = extractFirstName(resumeText);
  const resumePreview = firstThird(resumeText);

  const animStyles = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .chip-in { animation: fadeInUp 0.3s ease both; }
  `;

  return (
    <main className="min-h-screen pb-24 lg:pb-0" style={{ background: "#f9fafb" }}>
      <style>{animStyles}</style>

      {/* ══════════════════════════════════════════════
          HERO — score circles + headline
      ══════════════════════════════════════════════ */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #f3f4f6" }}>
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-10">

          {/* Headline */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
              >
                <span>✓</span> Analysis complete
              </div>
              <h1
                className="font-bold leading-tight"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#111827", letterSpacing: "-0.02em" }}
              >
                {firstName
                  ? <>{firstName}, your optimised resume is ready.</>
                  : <>Your optimised resume is ready.</>}
              </h1>
              <p className="text-sm mt-2 max-w-lg" style={{ color: "#6b7280" }}>
                We&apos;ve matched your experience to{" "}
                {jobTitleHint
                  ? <span style={{ color: "#374151", fontWeight: 500 }}>{jobTitleHint}</span>
                  : "the role"}{" "}
                and rebuilt your resume around it. Unlock below to download your PDF or editable Word file.
              </p>
            </div>
            <div
              className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold self-start"
              style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c" }}
            >
              <span>⚡</span> {missingCount} gaps found &amp; fixed
            </div>
          </div>

          {/* Score circles */}
          <div className="flex items-center justify-center gap-6 sm:gap-12">

            {/* Before */}
            <CircleGauge
              score={scoreBefore}
              label="Your score now"
              sublabel="Before ResuFit"
              trackColor="#fee2e2"
              fillColor="#ef4444"
              textColor="#ef4444"
              animateDelay={200}
              size={148}
            />

            {/* Arrow + improvement badge */}
            <div className="flex flex-col items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18h20M22 12l6 6-6 6" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div
                className="text-xs font-bold px-3 py-1.5 rounded-full text-center"
                style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", maxWidth: "110px", lineHeight: 1.4 }}
              >
                +{improvement}%<br />improvement
              </div>
            </div>

            {/* After */}
            <CircleGauge
              score={predictedAfter}
              label="Your new score"
              sublabel="With ResuFit"
              trackColor="#ddd6fe"
              fillColor="#6366f1"
              textColor="#4f46e5"
              animateDelay={600}
              size={148}
              dim
            />

          </div>

          {/* Unlock nudge */}
          <p className="text-center text-xs mt-6" style={{ color: "#9ca3af" }}>
            Your rewritten resume is ready — unlock below to download
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BODY
      ══════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Resume preview — first third, blurred below */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              {/* Mac chrome bar */}
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

              <div className="relative">
                {/* First third of the actual resume */}
                <div
                  className="px-7 pt-6 pb-4 text-xs leading-relaxed whitespace-pre-wrap overflow-hidden"
                  style={{
                    color: "#374151",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    lineHeight: "1.75",
                    maxHeight: "280px",
                  }}
                >
                  {resumePreview || "Resume loaded."}
                </div>

                {/* Blur overlay — real CSS blur */}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: "160px",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.75) 50%, #ffffff 100%)",
                  }}
                />

                {/* Lock label */}
                <div
                  className="absolute inset-x-0 bottom-0 flex justify-center"
                  style={{ paddingBottom: "18px", height: "160px", alignItems: "flex-end" }}
                >
                  <div
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #c7d2fe",
                      color: "#4f46e5",
                      boxShadow: "0 2px 12px rgba(99,102,241,0.15)",
                    }}
                  >
                    <span>✦</span> Your rewritten version is ready — unlock to download
                  </div>
                </div>
              </div>
            </div>

            {/* Missing skills */}
            {missingSkills.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid #fecaca" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold" style={{ color: "#991b1b" }}>
                    Keywords the hiring software looks for — missing from your resume
                  </p>
                  <span
                    className="shrink-0 ml-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                  >
                    {missingSkills.length} missing
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
                  We weave every one into your rewritten resume naturally.
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((s, i) => (
                    <div
                      key={s.name}
                      className="chip-in flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", animationDelay: `${i * 40}ms` }}
                    >
                      <span style={{ fontSize: "9px" }}>✗</span> {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched skills */}
            {matchedSkills.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold" style={{ color: "#111827" }}>
                    Keywords already in your resume
                  </p>
                  <span
                    className="shrink-0 ml-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
                  >
                    {matchedSkills.length} matched ✓
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
                  You&apos;re qualified — your resume just isn&apos;t representing you fully yet.
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((s, i) => (
                    <div
                      key={s.name}
                      className="chip-in flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534",
                        animationDelay: `${(missingSkills.length + i) * 40}ms`,
                      }}
                    >
                      <span style={{ fontSize: "9px" }}>✓</span> {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Format fixes */}
            {formattingIssues.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
              >
                <p className="text-sm font-bold mb-1" style={{ color: "#111827" }}>We automatically fix these</p>
                <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>Common issues that cause hiring software to misread or skip resumes.</p>
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

          {/* ── RIGHT: payment ── */}
          <div className="space-y-3">

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                border: "1.5px solid #6366f1",
                boxShadow: "0 8px 32px rgba(99,102,241,0.14)",
              }}
            >
              {/* Purple header */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <p className="text-xs font-bold text-white">Your tailored resume</p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                >
                  No account needed
                </span>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>
                  What&apos;s included
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    "Resume rewritten and matched to this role",
                    missingCount > 0 ? `${missingCount} missing keywords added` : "All keyword gaps closed",
                    formattingIssues.length > 0
                      ? `${formattingIssues.length} format issue${formattingIssues.length > 1 ? "s" : ""} fixed`
                      : "ATS format verified",
                    "Download as PDF or editable Word",
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
                  <p className="font-bold leading-none" style={{ fontSize: "2.4rem", color: "#111827", letterSpacing: "-0.03em" }}>
                    $5 <span className="text-sm font-normal" style={{ color: "#9ca3af" }}>one-time</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Less than a coffee. Potentially life-changing.</p>
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="Email for receipt (optional)"
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3 transition-all"
                  style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#111827" }}
                />

                <button
                  onClick={() => onPurchase("one_time")}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Unlock my resume — $5 →
                </button>

                <div className="flex items-center justify-center gap-3 mt-3">
                  {["🔒 Stripe", "Apple Pay", "Google Pay"].map((t, i) => (
                    <span key={t} className="flex items-center gap-2">
                      {i > 0 && <span style={{ color: "#e5e7eb" }}>·</span>}
                      <span className="text-[10px]" style={{ color: "#d1d5db" }}>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pro */}
            <div
              className="rounded-2xl p-4 cursor-pointer"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
              onClick={() => onPurchase("pro")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: "#374151" }}>ResuFit Pro</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                  Best value
                </span>
              </div>
              <p className="text-base font-bold" style={{ color: "#374151" }}>
                $15 <span className="text-xs font-normal" style={{ color: "#9ca3af" }}>/month</span>
              </p>
              <p className="text-xs mt-0.5 mb-3" style={{ color: "#9ca3af" }}>30 optimisations · Dashboard · Cancel anytime</p>
              <button
                className="w-full py-2 rounded-xl text-xs font-medium"
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280" }}
              >
                Create account &amp; get Pro →
              </button>
            </div>

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

      {/* Sticky mobile CTA */}
      <div
        className="fixed bottom-0 inset-x-0 lg:hidden px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.96)",
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
          Unlock my resume — $5 →
        </button>
      </div>
    </main>
  );
}
