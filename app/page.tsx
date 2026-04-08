"use client";

import { useState, useCallback, useRef } from "react";
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
    text: "ResuFit optimises your resume for the job that you want",
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
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchedFromUrl, setFetchedFromUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const canSubmit = file !== null && jobDescription.trim().length > 20;

  const fetchJobFromUrl = useCallback(async (url: string) => {
    setIsFetchingUrl(true);
    setUrlError(null);
    setFetchedFromUrl(false);
    try {
      const res = await fetch("/api/fetch-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not fetch that URL.");
      setJobDescription(data.text);
      setFetchedFromUrl(true);
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "Could not fetch that URL.");
    } finally {
      setIsFetchingUrl(false);
    }
  }, []);

  const handleJobDescriptionPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pasted = e.clipboardData.getData("text").trim();
      try {
        const url = new URL(pasted);
        if (url.protocol === "http:" || url.protocol === "https:") {
          e.preventDefault();
          setJobDescription(pasted); // show the URL in the box while fetching
          fetchJobFromUrl(pasted);
        }
      } catch {
        // Not a URL — let normal paste proceed
      }
    },
    [fetchJobFromUrl]
  );

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
        let message = "Failed to read your resume. Please try again.";
        try {
          const data = await uploadRes.json();
          message = data.error ?? message;
        } catch {}
        throw new Error(message);
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
              Your{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                job-winning
              </span>
              {" "}resume, fast.
            </h1>

            {/* Subtext */}
            <p
              className="text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "#94a3b8" }}
            >
              Hiring software silently rejects most applicants before a human
              reads their resume. ResuFit makes sure yours ticks every box so
              the hiring manager sees it.
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
                  Step 2 — Paste the job description or a link to the posting
                </p>
                <div className="relative">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      setFetchedFromUrl(false);
                      setUrlError(null);
                    }}
                    onPaste={handleJobDescriptionPaste}
                    placeholder="Paste the job description or drop in a URL to the posting..."
                    rows={6}
                    disabled={isFetchingUrl}
                    className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    style={{
                      color: "#e2e8f0",
                      background: isFetchingUrl
                        ? "rgba(124,58,237,0.04)"
                        : jobDescription.length > 20
                        ? "rgba(16,185,129,0.04)"
                        : "rgba(15,23,42,0.5)",
                      border: `2px solid ${
                        isFetchingUrl
                          ? "#7c3aed"
                          : jobDescription.length > 20
                          ? "#10b981"
                          : "#334155"
                      }`,
                      opacity: isFetchingUrl ? 0.7 : 1,
                    }}
                  />
                  {isFetchingUrl && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#a78bfa" }}>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        Fetching job description…
                      </div>
                    </div>
                  )}
                  {!isFetchingUrl && fetchedFromUrl && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
                    >
                      <span className="font-bold">✓</span> Fetched from URL
                    </div>
                  )}
                  {!isFetchingUrl && !fetchedFromUrl && jobDescription.length > 20 && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#10b981" }}
                    >
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
                {urlError && (
                  <p className="text-xs mt-2" style={{ color: "#f87171" }}>
                    {urlError}
                  </p>
                )}
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
