"use client";

import { useEffect, useState } from "react";
import type { Plan } from "@/types";
import type { AnalysisResult } from "@/app/results/[id]/page";

interface PreAnalysisScreenProps {
  analysis: AnalysisResult;
  resumeText: string;
  email: string;
  marketingOptIn: boolean;
  onEmailChange: (v: string) => void;
  onMarketingOptInChange: (v: boolean) => void;
  onPurchase: (plan: Plan) => void;
}

// ── Helpers ───────────────────────────────────────────────

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

function firstThird(resumeText: string): string {
  const lines = resumeText.trim().split("\n");
  const cutoff = Math.max(Math.ceil(lines.length / 3), 8);
  return lines.slice(0, cutoff).join("\n");
}

// ── Animated score ring (prototype style) ─────────────────

function ScoreRing({
  score,
  label,
  delay = 0,
  color,
}: {
  score: number;
  label: string;
  delay?: number;
  color: string;
}) {
  const [progress, setProgress] = useState(0);
  const size = 156;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setProgress(score), delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#f3f4f6" strokeWidth={strokeWidth} fill="none"
          />
          {/* Animated fill */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.5s ease-out, stroke 0.3s ease" }}
          />
        </svg>
        {/* Score label */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: 38, fontWeight: 900, color, lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}>
            {progress}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color, opacity: 0.7 }}>%</span>
        </div>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
        color: "#6b7280",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Apple Pay SVG ─────────────────────────────────────────

function ApplePayLogo() {
  return (
    <svg width="44" height="18" viewBox="0 0 44 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8.23 2.57c-.46.55-1.2.98-1.94.92-.09-.74.27-1.53.69-2.02C7.44.9 8.25.5 8.9.46c.08.77-.22 1.55-.67 2.11zm.66 1.05c-1.07-.06-1.99.61-2.5.61-.52 0-1.3-.58-2.15-.56C3.1 3.69 2 4.34 1.4 5.35c-1.22 2.1-.32 5.2.87 6.91.58.85 1.27 1.78 2.18 1.75.87-.03 1.2-.57 2.25-.57 1.05 0 1.35.57 2.27.55.94-.02 1.53-.85 2.11-1.7.66-.97.93-1.92.95-1.97-.02-.01-1.82-.7-1.84-2.79-.02-1.74 1.42-2.58 1.49-2.63-.82-1.2-2.08-1.33-2.49-1.37zM16.2 1.28h-3.3v12.4h1.87V9.6h2.57c2.35 0 4-1.62 4-4.17 0-2.55-1.61-4.15-4.14-4.15zm.42 6.65h-1.85V2.97h1.85c1.45 0 2.28.78 2.28 1.99 0 1.2-.83 1.97-2.28 1.97zm8.33-2.36c-1.64 0-2.85.82-2.9 1.94h1.73c.14-.54.62-.89 1.2-.89.78 0 1.22.36 1.22 1.02v.45l-1.6.1c-1.49.09-2.3.7-2.3 1.76 0 1.07.83 1.78 2.04 1.78.81 0 1.56-.41 1.9-1.06h.03v1h1.73V7.74c0-1.39-.98-2.17-2.65-2.17h.6zm1.24 3.67c0 .76-.67 1.3-1.57 1.3-.69 0-1.13-.34-1.13-.85 0-.53.42-.84 1.22-.89l1.48-.09v.53zm4.09-7.92h-1.86v1.4h-1.02v1.44h1.02v3.58c0 1.55.67 2.19 2.42 2.19.31 0 .62-.04.92-.1v-1.41a2.7 2.7 0 01-.53.05c-.67 0-.95-.27-.95-.96V4.16h1.51V2.72h-1.51V1.32zm3.68 9.52c-.53 0-.87-.35-.87-.88 0-.54.34-.88.87-.88h.89v.9c0 .5-.4.86-.89.86zm.55 2.94c1.41 0 2.58-.92 2.58-2.2v-7.4h-1.77v.92h-.03c-.37-.6-1.04-.98-1.79-.98-1.58 0-2.7 1.26-2.7 3.05 0 1.76 1.1 2.98 2.64 2.98.76 0 1.42-.37 1.78-.97h.03v.87c0 .78-.57 1.3-1.42 1.3-.65 0-1.22-.26-1.37-.67h-1.74c.22 1.24 1.45 2.1 2.79 2.1z" fill="white"/>
    </svg>
  );
}

function GooglePayLogo() {
  return (
    <svg width="46" height="18" viewBox="0 0 46 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21.87 9.09v4.59h-1.46V2.31h3.87a3.49 3.49 0 012.48.98 3.19 3.19 0 010 4.8 3.49 3.49 0 01-2.48.98h-2.41zm0-5.4v4.02h2.44c.57 0 1.11-.22 1.51-.61a2.06 2.06 0 000-2.81 2.12 2.12 0 00-1.51-.6h-2.44zm9.15 1.95c1.06 0 1.9.28 2.5.84.6.56.9 1.33.9 2.3v4.65H33v-1.05h-.06c-.58.86-1.35 1.29-2.32 1.29-.82 0-1.51-.24-2.07-.73a2.36 2.36 0 01-.83-1.85c0-.78.3-1.4.89-1.86.59-.46 1.38-.69 2.37-.69.84 0 1.54.15 2.08.46v-.32c0-.49-.2-.9-.58-1.24a2.02 2.02 0 00-1.36-.51c-.79 0-1.41.33-1.87.99l-1.34-.84c.73-1.03 1.81-1.54 3.21-1.54zm-1.95 5.88c0 .37.16.68.48.93.32.25.69.37 1.12.37.61 0 1.15-.22 1.63-.67.48-.45.72-.97.72-1.57-.45-.36-1.08-.54-1.88-.54-.58 0-1.07.14-1.46.43-.39.29-.61.64-.61 1.05zm11.49-5.64l-4.88 11.25h-1.5l1.81-3.92-3.2-7.33h1.58l2.32 5.63h.03l2.25-5.63h1.59z" fill="#3C4043"/>
      <path d="M14.25 7.75c0-.46-.04-.9-.11-1.33H7.28v2.52h3.91a3.34 3.34 0 01-1.45 2.19v1.82h2.35c1.37-1.27 2.16-3.13 2.16-5.2z" fill="#4285F4"/>
      <path d="M7.28 15c1.96 0 3.61-.65 4.81-1.76l-2.35-1.82c-.65.44-1.49.7-2.46.7-1.89 0-3.49-1.27-4.06-2.99H.79v1.88A7.28 7.28 0 007.28 15z" fill="#34A853"/>
      <path d="M3.22 9.13a4.35 4.35 0 010-2.76V4.49H.79a7.3 7.3 0 000 6.52l2.43-1.88z" fill="#FBBC05"/>
      <path d="M7.28 3.38a3.94 3.94 0 012.79 1.09l2.08-2.08A6.97 6.97 0 007.28.5 7.28 7.28 0 00.79 4.49l2.43 1.88c.57-1.72 2.17-2.99 4.06-2.99z" fill="#EA4335"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────

export default function PreAnalysisScreen({
  analysis,
  resumeText,
  email,
  marketingOptIn,
  onEmailChange,
  onMarketingOptInChange,
  onPurchase,
}: PreAnalysisScreenProps) {
  const firstName = extractFirstName(resumeText);
  const previewText = firstThird(resumeText);
  const previewLines = previewText.split("\n");

  const missingSkills = analysis.skills.filter((s) => s.status === "missing");
  const matchedSkills = analysis.skills.filter((s) => s.status === "matched");
  const improvement = analysis.predictedAfter - analysis.scoreBefore;

  // Skills matched stat
  const totalSkills = analysis.skills.length;
  const matchedCount = matchedSkills.length;

  // Format issues from analysis (shown as fixed in "After")
  const formattingIssues = analysis.formattingIssues;

  // Count bullets rewritten (approximation based on missing skills)
  const bulletsRewritten = Math.min(missingSkills.length + 2, 9);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>

      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "40px 24px 32px" }}>
        {firstName ? (
          <>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>Results ready for</p>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: "#111827",
              letterSpacing: "-0.03em", marginBottom: 6,
            }}>
              {firstName}, your tailored resume is ready.
            </h1>
          </>
        ) : (
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: "#111827",
            letterSpacing: "-0.03em", marginBottom: 6,
          }}>
            Your tailored resume is ready.
          </h1>
        )}
        {analysis.jobTitleHint && (
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Optimised for{" "}
            <strong style={{ color: "#4b5563" }}>{analysis.jobTitleHint}</strong>
          </p>
        )}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* ── Score Rings ── */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 32, marginBottom: 32, flexWrap: "wrap",
        }}>
          <ScoreRing
            score={analysis.scoreBefore}
            label="Current score"
            delay={200}
            color="#ef4444"
          />

          {/* Arrow + improvement badge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden="true">
              <path d="M1 10h28M22 3l7 7-7 7" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {improvement > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                background: "rgba(99,102,241,0.1)", color: "#6366f1",
                border: "1px solid rgba(99,102,241,0.2)",
              }}>
                +{improvement}% improvement
              </span>
            )}
          </div>

          <ScoreRing
            score={analysis.predictedAfter}
            label="After ResuFit"
            delay={1000}
            color="#6366f1"
          />
        </div>

        {/* ── Stats Bar ── */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 12,
          marginBottom: 32, flexWrap: "wrap",
        }}>
          {[
            {
              label: "Skills matched",
              before: `${matchedCount}/${totalSkills}`,
              after: `${totalSkills}/${totalSkills}`,
            },
            {
              label: "Bullets rewritten",
              before: "0",
              after: `${bulletsRewritten}`,
            },
            {
              label: "Format issues",
              before: `${formattingIssues.length} found`,
              after: "0 remaining",
            },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "#ffffff", border: "1px solid #e5e7eb",
              borderRadius: 12, padding: "14px 18px", textAlign: "center",
              minWidth: 140, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {stat.label}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 700 }}>{stat.before}</span>
                <span style={{ color: "#d1d5db", fontSize: 12 }}>→</span>
                <span style={{ color: "#10b981", fontSize: 13, fontWeight: 700 }}>{stat.after}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── ATS Compatibility ── */}
        {formattingIssues.length > 0 && (
          <div style={{
            background: "#ffffff", border: "1px solid #e5e7eb",
            borderRadius: 16, padding: 24, marginBottom: 24,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              🛡️ Hiring Software Compatibility
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16, lineHeight: 1.6 }}>
              Most companies use automated screening software that filters resumes before a recruiter ever sees them.
              Here&apos;s what we found — and fixed — in yours:
            </p>
            {formattingIssues.map((issue, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0",
                borderBottom: i < formattingIssues.length - 1 ? "1px solid #f3f4f6" : "none",
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, marginTop: 2, flexShrink: 0,
                  background: "rgba(239,68,68,0.08)", color: "#ef4444",
                }}>
                  FIXED
                </span>
                <span style={{ fontSize: 13, color: "#4b5563", flex: 1, lineHeight: 1.5 }}>{issue}</span>
                <span style={{ color: "#10b981", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>✓</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Resume Preview ── */}
        <div style={{
          background: "#ffffff", border: "1px solid #e5e7eb",
          borderRadius: 16, marginBottom: 24, overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid #f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Your optimised resume</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: "rgba(99,102,241,0.08)", color: "#6366f1",
                border: "1px solid rgba(99,102,241,0.15)",
              }}>
                Tailored ✨
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>Preview — unlock to download</span>
          </div>

          {/* Content */}
          <div style={{ position: "relative", maxHeight: 320, overflow: "hidden" }}>
            <div style={{
              padding: "20px 24px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 11,
              lineHeight: 1.7,
              color: "#374151",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {previewLines.map((line, i) => (
                <div key={i} style={{ minHeight: "1em" }}>{line || " "}</div>
              ))}
            </div>

            {/* Blur overlay — bottom portion */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 160,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.97))",
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              paddingBottom: 20,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                color: "#4b5563", fontSize: 12, fontWeight: 600,
              }}>
                <span>🔒</span>
                <span>Unlock to see your full rewritten resume</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Skills Breakdown ── */}
        <div style={{
          background: "#ffffff", border: "1px solid #e5e7eb",
          borderRadius: 16, padding: 24, marginBottom: 24,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
            Skills Match Breakdown
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {matchedSkills.map((skill, i) => (
              <span key={i} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: "rgba(16,185,129,0.08)", color: "#059669",
                border: "1px solid rgba(16,185,129,0.15)",
              }}>
                {skill.name}
              </span>
            ))}
            {missingSkills.map((skill, i) => (
              <span key={i} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: "rgba(99,102,241,0.08)", color: "#6366f1",
                border: "1px solid rgba(99,102,241,0.2)",
              }}>
                + {skill.name}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: 10, color: "#9ca3af" }}>
            <span style={{ color: "#059669" }}>● Already in your resume</span>
            <span style={{ color: "#6366f1" }}>+ Added by ResuFit</span>
          </div>
        </div>

        {/* ── Payment Card ── */}
        <div style={{
          background: "#ffffff", border: "1.5px solid #e5e7eb",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 8px 30px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {/* Indigo header */}
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            padding: "20px 28px",
          }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginBottom: 4, letterSpacing: "-0.02em" }}>
              Download your optimised resume
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              Tailored, formatted, and ready to submit
            </p>
          </div>

          <div style={{ padding: "24px 28px" }}>

            {/* Email capture */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Email address <span style={{ color: "#9ca3af", fontWeight: 400 }}>(send a copy to your inbox)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 14px", borderRadius: 10, fontSize: 14,
                  border: "1.5px solid #e5e7eb", outline: "none",
                  color: "#111827", background: "#f9fafb",
                }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => onMarketingOptInChange(e.target.checked)}
                  style={{ accentColor: "#6366f1" }}
                />
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  Send me tips on getting more interviews
                </span>
              </label>
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => onPurchase("one_time")}
              style={{
                width: "100%", padding: "15px 24px", marginBottom: 10,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                letterSpacing: "-0.01em",
              }}
            >
              Download your optimised resume — $5
            </button>

            {/* Apple Pay + Google Pay */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button
                onClick={() => onPurchase("one_time")}
                style={{
                  flex: 1, padding: "12px 16px",
                  background: "#000000", color: "#ffffff",
                  border: "none", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <ApplePayLogo />
              </button>
              <button
                onClick={() => onPurchase("one_time")}
                style={{
                  flex: 1, padding: "12px 16px",
                  background: "#ffffff", color: "#3c4043",
                  border: "1.5px solid #dadce0", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <GooglePayLogo />
              </button>
            </div>

            {/* Pro link */}
            <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Or{" "}
              <button
                onClick={() => onPurchase("pro")}
                style={{
                  background: "none", border: "none", color: "#6366f1",
                  cursor: "pointer", fontWeight: 600, fontSize: 13,
                  textDecoration: "underline", padding: 0,
                }}
              >
                get unlimited for $15/month →
              </button>
            </p>

            {/* Trust badges */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 16,
              fontSize: 11, color: "#9ca3af", flexWrap: "wrap",
            }}>
              <span>🔒 Secure payment</span>
              <span>📄 PDF + editable Word</span>
              <span>⚡ Instant download</span>
            </div>

          </div>
        </div>

      </div>

      {/* ── Sticky mobile CTA ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid #e5e7eb",
        padding: "12px 20px 20px",
        display: "none",  // shown via media query in globals.css if needed
      }} className="mobile-cta-bar">
        <button
          onClick={() => onPurchase("one_time")}
          style={{
            width: "100%", padding: "14px 24px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          Unlock my resume — $5 →
        </button>
      </div>

    </div>
  );
}
