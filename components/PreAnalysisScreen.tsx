"use client";

import { useEffect, useState } from "react";
import type { Plan } from "@/types";
import type { AnalysisResult } from "@/app/results/[id]/page";
import Logo from "@/components/Logo";

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

// Skills that look meaningless (noise from poor parsing)
function isRecognizableSkill(name: string): boolean {
  if (name.length < 2) return false;
  // Reject single letters or all-digit strings
  if (/^[a-z0-9]{1,2}$/.test(name)) return false;
  // Reject strings that are entirely numbers
  if (/^\d+$/.test(name)) return false;
  // Accept anything >= 3 chars that has at least one letter
  return /[a-zA-Z]/.test(name);
}

// ── Animated score ring ────────────────────────────────────

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
          <circle cx={size / 2} cy={size / 2} r={radius}
            stroke="#f3f4f6" strokeWidth={strokeWidth} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 38, fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {progress}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color, opacity: 0.7 }}>%</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>
        {label}
      </span>
    </div>
  );
}

// ── Apple Pay button — official brand style ───────────────

function ApplePayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Pay with Apple Pay"
      style={{
        flex: 1, height: 48, borderRadius: 10, border: "none",
        background: "#000", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
    >
      {/* Apple logo — served as SVG image for crisp rendering */}
      <img src="/apple-logo.svg" width="17" height="21" alt="" aria-hidden="true"
        style={{ display: "block", flexShrink: 0 }} />
      <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
        Apple Pay
      </span>
    </button>
  );
}

// ── Google Pay button — official brand style ──────────────

function GooglePayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Pay with Google Pay"
      style={{
        flex: 1, height: 48, borderRadius: 10,
        background: "#fff", border: "1.5px solid #dadce0", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#aaa";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#dadce0";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      {/* Google G — four-colour official mark */}
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z" fill="#34A853"/>
        <path d="M3.96 10.71A5.41 5.41 0 013.64 9c0-.59.1-1.17.32-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3-2.33z" fill="#FBBC05"/>
        <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#3c4043", letterSpacing: "-0.01em" }}>
        Google Pay
      </span>
    </button>
  );
}

// ── Skill context modal ────────────────────────────────────

function ContextModal({
  skillName,
  savedContext,
  currencySymbol,
  onClose,
  onSave,
  onUnlock,
}: {
  skillName: string;
  savedContext: string;
  currencySymbol: string;
  onClose: () => void;
  onSave: (context: string) => void;
  onUnlock: (context: string) => void;
}) {
  const [context, setContext] = useState(savedContext);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 28px 24px",
          maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Missing from your resume
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
              {skillName}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "#9ca3af", cursor: "pointer", lineHeight: 1, padding: 0 }}>
            ×
          </button>
        </div>

        <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, marginBottom: 12 }}>
          Tell us about your experience with <strong>{skillName}</strong> and we&rsquo;ll weave it naturally into your rewritten resume.
        </p>

        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={`e.g. "I've used ${skillName} in three projects, including a migration for 50k users…"`}
          style={{
            width: "100%", boxSizing: "border-box",
            height: 90, borderRadius: 10, border: "1.5px solid #e5e7eb",
            padding: "10px 14px", fontSize: 13, lineHeight: 1.6,
            color: "#111827", resize: "none", outline: "none",
            background: "#f9fafb", fontFamily: "inherit",
            marginBottom: 12,
          }}
          autoFocus
        />

        {/* Save for later — lets users fill in multiple skills before paying */}
        <button
          onClick={() => onSave(context)}
          style={{
            width: "100%", padding: "10px 20px", marginBottom: 10,
            background: "#f9fafb", color: "#374151",
            border: "1.5px solid #e5e7eb", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          Save for now — add more skills first
        </button>

        <button
          onClick={() => onUnlock(context)}
          style={{
            width: "100%", padding: "14px 20px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}
        >
          Save context & unlock for {currencySymbol}5 →
        </button>
      </div>
    </div>
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
  const [contextSkill, setContextSkill] = useState<string | null>(null);
  const [skillContexts, setSkillContexts] = useState<Record<string, string>>({});
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    const lang = navigator.language || "";
    if (lang === "en-GB" || lang.startsWith("en-GB")) setCurrencySymbol("£");
    else if (/^(de|fr|es|it|nl|pt|pl|sv|da|fi|nb|el|cs|sk|hu|ro|bg|hr|sl|et|lv|lt|mt|ga)\b/.test(lang)) setCurrencySymbol("€");
    else setCurrencySymbol("$");
  }, []);

  const firstName = extractFirstName(resumeText);
  const previewText = firstThird(resumeText);
  const previewLines = previewText.split("\n");

  // Filter to only meaningful skill names, then split into three groups
  const allSkills = analysis.skills.filter((s) => isRecognizableSkill(s.name));
  const matchedSkills = allSkills.filter((s) => s.status === "matched");
  const inferredSkills = allSkills.filter((s) => s.status === "inferred");
  const unknownSkills = allSkills.filter((s) => s.status === "unknown");
  // For stats / legacy references
  const missingSkills = [...inferredSkills, ...unknownSkills];
  const improvement = analysis.predictedAfter - analysis.scoreBefore;

  const totalSkills = allSkills.length;
  const matchedCount = matchedSkills.length;

  const formattingIssues = analysis.formattingIssues;
  const bulletsRewritten = Math.min(missingSkills.length + 3, 9);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>

      {/* ── Context modal ── */}
      {contextSkill && (
        <ContextModal
          skillName={contextSkill}
          savedContext={skillContexts[contextSkill] ?? ""}
          currencySymbol={currencySymbol}
          onClose={() => setContextSkill(null)}
          onSave={(ctx) => {
            setSkillContexts((prev) => ({ ...prev, [contextSkill]: ctx }));
            setContextSkill(null);
          }}
          onUnlock={(ctx) => {
            setSkillContexts((prev) => ({ ...prev, [contextSkill]: ctx }));
            setContextSkill(null);
            onPurchase("one_time");
          }}
        />
      )}

      {/* ── Site nav ── */}
      <header style={{
        maxWidth: 880, margin: "0 auto", width: "100%",
        padding: "20px 28px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxSizing: "border-box",
      }}>
        <Logo size="md" />
      </header>

      {/* ── Page headline ── */}
      <div style={{ textAlign: "center", padding: "32px 24px 24px" }}>
        <h1 style={{
          fontSize: "clamp(1.55rem, 3.5vw, 2rem)",
          fontWeight: 900, color: "#111827",
          letterSpacing: "-0.04em", lineHeight: 1.15,
          margin: "0 0 8px",
        }}>
          {firstName
            ? <>🎉&nbsp;&nbsp;{firstName}, your resume has been rebuilt&nbsp;&nbsp;🎉</>
            : <>🎉&nbsp;&nbsp;Your resume has been rebuilt&nbsp;&nbsp;🎉</>
          }
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          Here&rsquo;s exactly what the job needs — and what we&rsquo;ve done about it.
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* ── Score Rings ── */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 32, marginBottom: 32, flexWrap: "wrap",
        }}>
          <ScoreRing score={analysis.scoreBefore} label="Current score" delay={200} color="#ef4444" />

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

          <ScoreRing score={analysis.predictedAfter} label="After ResuFit" delay={1000} color="#6366f1" />
        </div>

        {/* ── Stats Bar ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Skills matched", before: `${matchedCount}/${totalSkills}`, after: `${totalSkills}/${totalSkills}` },
            { label: "Bullets rewritten", before: "0", after: `${bulletsRewritten}` },
            { label: "Format issues", before: `${formattingIssues.length} found`, after: "0 remaining" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "#ffffff", border: "1px solid #e5e7eb",
              borderRadius: 12, padding: "12px 18px", textAlign: "center",
              minWidth: 130, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {stat.label}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 700 }}>{stat.before}</span>
                <span style={{ color: "#d1d5db", fontSize: 11 }}>→</span>
                <span style={{ color: "#10b981", fontSize: 13, fontWeight: 700 }}>{stat.after}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Slimline pay strip — for decisive users who've seen enough ── */}
        <div
          onClick={() => document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 12, padding: "14px 20px", marginBottom: 24,
            cursor: "pointer", gap: 12,
            boxShadow: "0 4px 16px rgba(99,102,241,0.28)",
            transition: "box-shadow 0.15s, transform 0.1s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 22px rgba(99,102,241,0.4)";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.28)";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
            Ready? Download your optimised resume
          </span>
          <span style={{
            fontSize: 13, fontWeight: 800, color: "#fff",
            background: "rgba(255,255,255,0.18)", borderRadius: 8,
            padding: "6px 14px", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            Get it now →
          </span>
        </div>

        {/* ── Skills Gap Analysis ── */}
        <div style={{
          background: "#ffffff", border: "1px solid #e5e7eb",
          borderRadius: 16, padding: 24, marginBottom: 24,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>

          {/* Header + coverage summary */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
                Skills Gap Analysis
              </p>
              <p style={{ fontSize: 12, color: "#6b7280" }}>
                Every skill this job needs — and how your resume covers it.
              </p>
            </div>
            {/* Coverage pill */}
            <div style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))",
              border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10,
              padding: "8px 14px", textAlign: "center", flexShrink: 0,
            }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#6366f1", lineHeight: 1, marginBottom: 2 }}>
                {matchedSkills.length + inferredSkills.length}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>/{allSkills.length}</span>
              </p>
              <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                skills covered
              </p>
            </div>
          </div>

          {/* ── Purple FIRST: ResuFit added — the value prop ── */}
          {inferredSkills.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                ✦ Added by ResuFit — inferred from your experience
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>
                Your resume shows related experience — we&rsquo;ve added these for you.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {inferredSkills.map((skill, i) => (
                  <span key={i} style={{
                    padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                    background: "rgba(99,102,241,0.07)", color: "#6366f1",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}>
                    ✦ {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Green: already in resume ── */}
          {matchedSkills.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                ✓ Already in your resume
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {matchedSkills.map((skill, i) => (
                  <span key={i} style={{
                    padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                    background: "rgba(16,185,129,0.07)", color: "#059669",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Amber: needs user input ── */}
          {unknownSkills.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                ? Not sure if you have these — tap to tell us
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>
                If you have experience here, we&rsquo;ll add it to your rewritten resume.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {unknownSkills.map((skill, i) => {
                  const hasSavedContext = Boolean(skillContexts[skill.name]);
                  return (
                    <button
                      key={i}
                      onClick={() => setContextSkill(skill.name)}
                      style={{
                        padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                        background: hasSavedContext ? "rgba(16,185,129,0.07)" : "rgba(217,119,6,0.07)",
                        color: hasSavedContext ? "#059669" : "#b45309",
                        border: `1px solid ${hasSavedContext ? "rgba(16,185,129,0.25)" : "rgba(217,119,6,0.25)"}`,
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5,
                      }}
                    >
                      {hasSavedContext
                        ? <><span style={{ fontSize: 10 }}>✓</span> {skill.name}</>
                        : <>{skill.name} <span style={{ fontSize: 10, opacity: 0.6 }}>+ tell us</span></>}
                    </button>
                  );
                })}
              </div>
              {Object.keys(skillContexts).length > 0 && (
                <p style={{ fontSize: 11, color: "#059669", marginTop: 10, fontWeight: 500 }}>
                  ✓ Context saved for {Object.keys(skillContexts).length} skill{Object.keys(skillContexts).length > 1 ? "s" : ""} — woven into your resume on unlock.
                </p>
              )}
            </div>
          )}

          {/* Soft CTA — nudge toward payment without being pushy */}
          <div
            onClick={() => document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              marginTop: 6, padding: "10px 14px",
              background: "rgba(99,102,241,0.04)", border: "1px dashed rgba(99,102,241,0.25)",
              borderRadius: 10, cursor: "pointer", textAlign: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>
              ✨ Unlock to download your rewritten resume with all {matchedSkills.length + inferredSkills.length + Object.keys(skillContexts).length} skills included →
            </span>
          </div>
        </div>

        {/* ── Resume Preview — "What you'll get" panel ── */}
        <div style={{
          background: "#ffffff", border: "1px solid #e5e7eb",
          borderRadius: 16, marginBottom: 24, overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          {/* Card header */}
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid #f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Your rewritten resume</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: "rgba(99,102,241,0.08)", color: "#6366f1",
                border: "1px solid rgba(99,102,241,0.15)",
              }}>
                Ready after unlock ✨
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>Here&rsquo;s what we&rsquo;ll deliver</span>
          </div>

          {/* Improvements list */}
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16, lineHeight: 1.5 }}>
              Based on your resume and this job description, here&rsquo;s exactly what ResuFit will produce:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {/* Professional summary */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)",
              }}>
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>✍️</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                    Professional summary — rewritten for this role
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                    Opens with the job title and your strongest match, written to pass the 6-second scan.
                  </p>
                </div>
              </div>

              {/* Bullet points */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)",
              }}>
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>📈</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                    {bulletsRewritten} bullet points upgraded
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                    Stronger action verbs + measurable outcomes using the X–Y–Z impact formula.
                  </p>
                </div>
              </div>

              {/* Skills added */}
              {inferredSkills.length > 0 && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 14px", borderRadius: 10,
                  background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)",
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>✦</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                      {inferredSkills.length} skill{inferredSkills.length !== 1 ? "s" : ""} added from your experience
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                      {inferredSkills.slice(0, 3).map(s => s.name).join(", ")}
                      {inferredSkills.length > 3 ? ` + ${inferredSkills.length - 3} more` : ""} — woven in naturally, never invented.
                    </p>
                  </div>
                </div>
              )}

              {/* User-provided context */}
              {Object.keys(skillContexts).length > 0 && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 14px", borderRadius: 10,
                  background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)",
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>💬</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                      {Object.keys(skillContexts).length} skill{Object.keys(skillContexts).length !== 1 ? "s" : ""} you told us about — included
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                      Your extra context will be woven into the relevant bullet points.
                    </p>
                  </div>
                </div>
              )}

              {/* ATS formatting */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)",
              }}>
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>🤖</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                    ATS-safe formatting throughout
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                    Clean single-column layout, standard section headers, no graphics or tables that confuse parsers.
                  </p>
                </div>
              </div>
            </div>

            {/* Lock CTA */}
            <button
              onClick={() => document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                width: "100%", padding: "13px 20px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                letterSpacing: "-0.01em",
              }}
            >
              <span>🔒</span>
              <span>Unlock & download your rewritten resume →</span>
            </button>
          </div>
        </div>

        {/* ── ATS Compatibility ── */}
        <div style={{
          background: "#ffffff", border: "1px solid #e5e7eb",
          borderRadius: 16, padding: "18px 20px", marginBottom: 24,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 10 }}>
            ✅ We updated your resume to pass 8 hiring software checks
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {[
              "ATS parsing",
              "Keyword alignment",
              "Section structure",
              "Date formatting",
              "Content depth",
              "Contact details",
            ].map((label) => (
              <span key={label} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 600, color: "#059669",
                background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)",
                borderRadius: 20, padding: "4px 11px",
              }}>
                <span style={{ fontSize: 10, fontWeight: 900 }}>✓</span> {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Payment Card ── */}
        <div id="payment" style={{
          background: "#ffffff", border: "1.5px solid #e5e7eb",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 8px 30px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {/* Indigo header */}
          <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", padding: "20px 28px" }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginBottom: 4, letterSpacing: "-0.02em" }}>
              Download your optimised resume
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              You&rsquo;ll get a professionally analyzed, job-matched, resume that&rsquo;s ready-to-send.
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

            {/* One-time CTA */}
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
              Download optimised resume — {currencySymbol}5
            </button>

            {/* Apple Pay + Google Pay */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <ApplePayButton onClick={() => onPurchase("one_time")} />
              <GooglePayButton onClick={() => onPurchase("one_time")} />
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>or get more with Pro</span>
              <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
            </div>

            {/* Pro tier card — presented as a genuine, compelling option */}
            <div
              onClick={() => onPurchase("pro")}
              style={{
                border: "2px solid #c7d2fe", borderRadius: 14,
                overflow: "hidden", cursor: "pointer", marginBottom: 18,
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#818cf8";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#c7d2fe";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(99,102,241,0.08)";
              }}
            >
              {/* Pro header strip */}
              <div style={{
                background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                padding: "12px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: "1px solid #e0e7ff",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#3730a3" }}>ResuFit Pro</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                  }}>
                    Best value
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>$15</span>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>/month</span>
                </div>
              </div>

              {/* Pro benefits */}
              <div style={{ padding: "14px 18px", background: "#ffffff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 16px", marginBottom: 14 }}>
                  {[
                    "30 optimisations/month",
                    "Cover letter writer",
                    "Priority processing",
                    "Cancel anytime",
                  ].map((benefit) => (
                    <span key={benefit} style={{ fontSize: 12, color: "#374151", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: "#6366f1", fontWeight: 800, fontSize: 12 }}>✓</span>
                      {benefit}
                    </span>
                  ))}
                </div>
                <div style={{
                  width: "100%", padding: "10px 0", borderRadius: 10, textAlign: "center",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  boxShadow: "0 2px 10px rgba(99,102,241,0.25)",
                }}>
                  Get Pro — {currencySymbol}15/month →
                </div>
              </div>
            </div>


          </div>
        </div>

      </div>

    </div>
  );
}
