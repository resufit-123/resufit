"use client";

import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import ProcessingScreen from "@/components/ProcessingScreen";
import Logo from "@/components/Logo";
import type { Template } from "@/types";

const VALUE_PROPS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z" stroke="#6366f1" strokeWidth="1.4" />
        <polyline points="5,8 7,10 11,6" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: "Scanned against ATS criteria from 50+ hiring platforms",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8h2.5M8 2v2.5M11.5 8H14M8 11.5V14" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="8" r="3" stroke="#6366f1" strokeWidth="1.4" />
      </svg>
    ),
    text: "ResuFit rewrites your resume around the exact role",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h7M3 12h4" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" />
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
      // Step 1: Parse the resume file
      const formData = new FormData();
      formData.append("resume", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        let message = "Failed to read your resume. Please try again.";
        try {
          const data = await uploadRes.json();
          message = data.error ?? message;
        } catch {}
        throw new Error(message);
      }

      const { resumeText } = await uploadRes.json();

      // Step 2: Run instant keyword analysis (no AI, no cost)
      const analyseRes = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      let analysis = null;
      if (analyseRes.ok) {
        analysis = await analyseRes.json();
      }

      // Persist for the results page
      sessionStorage.setItem("rf_resume_text", resumeText);
      sessionStorage.setItem("rf_job_description", jobDescription);
      sessionStorage.setItem("rf_file_name", file.name);
      if (analysis) {
        sessionStorage.setItem("rf_analysis", JSON.stringify(analysis));
      }

      window.location.href = "/results/new";
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
        background: "#ffffff",
        backgroundImage:
          "radial-gradient(ellipse 70% 50% at 80% -10%, rgba(99,102,241,0.07) 0%, transparent 65%)",
      }}
    >
      {/* ── Nav ── */}
      <header className="w-full max-w-6xl mx-auto px-6 lg:px-10 pt-6 pb-4 flex items-center justify-between gap-4">
        <Logo size="md" />
        <a
          href="/sign-in"
          className="text-sm transition-colors shrink-0"
          style={{ color: "#9ca3af" }}
        >
          Sign in
        </a>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 lg:px-10 pt-10 pb-12 lg:pt-14 lg:pb-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

          {/* ── Left: copy ── */}
          <div className="flex-1 mb-10 lg:mb-0 flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1
              className="font-bold leading-tight mb-5"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                color: "#111827",
                letterSpacing: "-0.02em",
              }}
            >
              Your{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                job-winning
              </span>
              {" "}resume, fast.
            </h1>

            <p
              className="text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "#6b7280" }}
            >
              Hiring software silently rejects most applicants before a human
              reads their resume. ResuFit makes sure yours ticks every box so
              the hiring manager sees it.
            </p>

            <ul className="space-y-3.5 mb-10 w-full max-w-lg">
              {VALUE_PROPS.map((vp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">{vp.icon}</span>
                  <span className="text-sm" style={{ color: "#6b7280" }}>
                    {vp.text}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-md"
                style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
              >
                ONLY
              </span>
              <span style={{ color: "#374151" }}>
                <strong style={{ color: "#111827" }}>$5</strong> one-time &nbsp;·&nbsp;{" "}
                <strong style={{ color: "#111827" }}>$15/mo</strong> Pro (30 optimisations)
              </span>
            </div>
          </div>

          {/* ── Right: form card ── */}
          <div className="w-full lg:w-[460px] shrink-0">
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 48px -8px rgba(99,102,241,0.08)",
              }}
            >
              {/* Step 1 */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#9ca3af" }}
                >
                  Step 1 — Upload your resume
                </p>
                <DropZone file={file} onFileChange={setFile} />
                <p className="text-[11px] text-center mt-2" style={{ color: "#d1d5db" }}>
                  🔒 Secure and private — never shared with third parties
                </p>
              </div>

              <div style={{ borderTop: "1px solid #f3f4f6", marginLeft: "-24px", marginRight: "-24px" }} />

              {/* Step 2 */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#9ca3af" }}
                >
                  Step 2 — Paste the job description
                </p>
                <div className="relative">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={6}
                    className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    style={{
                      color: "#111827",
                      background: jobDescription.length > 20 ? "rgba(16,185,129,0.03)" : "#f9fafb",
                      border: `1.5px solid ${jobDescription.length > 20 ? "#10b981" : "#e5e7eb"}`,
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
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
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
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "#f3f4f6",
                  color: canSubmit ? "#fff" : "#9ca3af",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  border: "none",
                  boxShadow: canSubmit ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
                }}
              >
                {canSubmit ? "Analyse My Resume →" : "Add resume + job description to continue"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
