"use client";

import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import ProcessingScreen from "@/components/ProcessingScreen";
import Logo from "@/components/Logo";
import type { OptimizationResult, Template } from "@/types";

const VALUE_PROPS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z" stroke="#10b981" strokeWidth="1.4" />
        <polyline points="5,8 7,10 11,6" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: "Scanned against ATS criteria from 50+ hiring platforms",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8h2.5M8 2v2.5M11.5 8H14M8 11.5V14" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="8" r="3" stroke="#a78bfa" strokeWidth="1.4" />
      </svg>
    ),
    text: "AI rewrites your resume around the exact job description",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h7M3 12h4" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="13" cy="12" r="2" fill="#10b981" />
      </svg>
    ),
    text: "Download your polished resume in seconds, ready to apply",
  },
];

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = file !== null && jobDescription.trim().length > 20;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error ?? "Failed to read your resume.");
      }

      const { resumeText } = await uploadRes.json();

      sessionStorage.setItem("rf_resume_text", resumeText);
      sessionStorage.setItem("rf_job_description", jobDescription);
      sessionStorage.setItem("rf_file_name", file.name);

      window.location.href = "/sign-in?redirectTo=/results/new";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  }, [canSubmit, file, jobDescription]);

  if (isProcessing) {
    return <ProcessingScreen />;
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{
        background: "#0f172a",
        // Subtle radial glow top-right
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 75% -5%, rgba(124,58,237,0.18) 0%, transparent 70%)",
      }}
    >
      {/* ── Top nav ── */}
      <header className="w-full max-w-6xl mx-auto px-6 lg:px-10 pt-6 pb-4 flex items-center justify-between gap-4">
        <Logo size="md" />

        {/* Centre badge — hidden on small screens */}
        <div
          className="hidden md:inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#94a3b8",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
            style={{ background: "#10b981" }}
          />
          AI-powered · Results in under 10 seconds
        </div>

        <a
          href="/sign-in"
          className="text-sm transition-colors shrink-0"
          style={{ color: "#64748b" }}
        >
          Sign in
        </a>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 lg:px-10 pt-8 pb-10 lg:pt-10 lg:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

          {/* ── Left column: copy ── */}
          <div className="flex-1 mb-10 lg:mb-0">
            {/* Headline */}
            <h1
              className="font-bold leading-tight mb-5"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                color: "#f8fafc",
                letterSpacing: "-0.02em",
              }}
            >
              Your resume,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                built to reach humans.
              </span>
              <br />
              In 10 seconds.
            </h1>

            {/* Subtext */}
            <p
              className="text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "#94a3b8" }}
            >
              Hiring software silently rejects most applicants before a human
              reads their resume. ResuFit rewrites yours around the exact role,
              so you make it through.
            </p>

            {/* Value props */}
            <ul className="space-y-4 mb-10">
              {VALUE_PROPS.map((vp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">{vp.icon}</span>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>
                    {vp.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Pricing snippet */}
            <div
              className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-md"
                style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
              >
                ONLY
              </span>
              <span style={{ color: "#e2e8f0" }}>
                <strong className="text-white">$5</strong> one-time &nbsp;·&nbsp;{" "}
                <strong className="text-white">$15/mo</strong> Pro (30 optimisations)
              </span>
            </div>
          </div>

          {/* ── Right column: form card ── */}
          <div className="w-full lg:w-[460px] shrink-0">
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                boxShadow: "0 0 0 1px rgba(124,58,237,0.08), 0 24px 64px rgba(0,0,0,0.4)",
              }}
            >
              {/* Step 1 */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  Step 1 — Upload your resume
                </p>
                <DropZone file={file} onFileChange={setFile} />
                <p className="text-[11px] text-center mt-2" style={{ color: "#475569" }}>
                  🔒 Secure and private — never shared with third parties
                </p>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid #1e293b", marginLeft: "-24px", marginRight: "-24px" }} />

              {/* Step 2 */}
              <div className="relative">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  Step 2 — Paste the job description
                </p>
                <div className="relative">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={6}
                    className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    style={{
                      color: "#e2e8f0",
                      background: jobDescription.length > 20
                        ? "rgba(16,185,129,0.04)"
                        : "rgba(15,23,42,0.5)",
                      border: `2px solid ${jobDescription.length > 20 ? "#10b981" : "#334155"}`,
                    }}
                  />
                  {jobDescription.length > 20 && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#10b981" }}
                    >
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-4 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: canSubmit
                    ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                    : "#1e293b",
                  color: canSubmit ? "#fff" : "#475569",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  border: canSubmit ? "none" : "1px solid #334155",
                  boxShadow: canSubmit ? "0 4px 24px rgba(124,58,237,0.35)" : "none",
                }}
              >
                {canSubmit ? "Optimise My Resume →" : "Add resume + job description to continue"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
