"use client";

import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import ProcessingScreen from "@/components/ProcessingScreen";
import Logo from "@/components/Logo";

// Step icons
const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#eef2ff" />
    <path d="M14 18V11M14 11L11 14M14 11L17 14" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 19h10" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const PasteIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#eef2ff" />
    <rect x="8" y="8" width="12" height="14" rx="2" stroke="#6366f1" strokeWidth="1.8" />
    <path d="M11 12h6M11 15h6M11 18h4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#f0fdf4" />
    <path d="M14 9v7M14 16L11 13M14 16L17 13" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 19h10" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const STEPS = [
  {
    icon: <UploadIcon />,
    num: "01",
    title: "Upload your resume",
    desc: "PDF or Word — we extract and read it instantly",
    color: "#6366f1",
  },
  {
    icon: <PasteIcon />,
    num: "02",
    title: "Paste the job description",
    desc: "Copy it straight from LinkedIn, Indeed, or anywhere",
    color: "#6366f1",
  },
  {
    icon: <DownloadIcon />,
    num: "03",
    title: "Download your optimised resume",
    desc: "ATS-ready, tailored to the role, formatted and polished",
    color: "#10b981",
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
        let message = "Failed to read your resume. Please try again.";
        try { const d = await uploadRes.json(); message = d.error ?? message; } catch {}
        throw new Error(message);
      }

      const { resumeText } = await uploadRes.json();

      const analyseRes = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      let analysis = null;
      if (analyseRes.ok) analysis = await analyseRes.json();

      sessionStorage.setItem("rf_resume_text", resumeText);
      sessionStorage.setItem("rf_job_description", jobDescription);
      sessionStorage.setItem("rf_file_name", file.name);
      if (analysis) sessionStorage.setItem("rf_analysis", JSON.stringify(analysis));

      window.location.href = "/results/new";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  }, [canSubmit, file, jobDescription]);

  if (isProcessing) return <ProcessingScreen />;

  return (
    <div className="flex-1 flex flex-col" style={{ background: "#ffffff" }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <Logo size="md" />
        <a href="/sign-in" className="text-sm transition-colors" style={{ color: "#9ca3af" }}>
          Sign in
        </a>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="w-full flex flex-col items-center text-center px-6 pt-10 pb-16"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.07) 0%, transparent 65%)",
        }}
      >
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-5"
          style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#6366f1" }}
          />
          AI Resume Optimisation
        </div>

        {/* Headline */}
        <h1
          className="font-bold leading-tight mb-4 max-w-2xl"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: "#111827", letterSpacing: "-0.03em" }}
        >
          Get past hiring software.{" "}
          <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Land the interview.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg mb-8 max-w-xl" style={{ color: "#6b7280", lineHeight: 1.6 }}>
          75% of resumes are rejected by software before a human reads them.
          ResuFit rewrites yours to pass the filters — in seconds.
        </p>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { icon: "⚡", label: "Results in seconds" },
            { icon: "🔒", label: "Private & secure" },
            { icon: "✓",  label: "No account needed" },
            { icon: "💳", label: "Only $5 one-time" },
          ].map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#4b5563" }}
            >
              <span>{pill.icon}</span> {pill.label}
            </div>
          ))}
        </div>

        {/* ── Form card ── */}
        <div
          className="w-full max-w-md"
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 24px 48px -8px rgba(99,102,241,0.1)",
          }}
        >
          <div className="p-6 space-y-5">
            {/* Step 1 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#eef2ff", color: "#6366f1" }}
                >
                  1
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                  Upload your resume
                </p>
              </div>
              <DropZone file={file} onFileChange={setFile} />
            </div>

            <div style={{ borderTop: "1px solid #f3f4f6", marginLeft: "-24px", marginRight: "-24px" }} />

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#eef2ff", color: "#6366f1" }}
                >
                  2
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                  Paste the job description
                </p>
              </div>
              <div className="relative">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={5}
                  className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  style={{
                    color: "#111827",
                    background: jobDescription.length > 20 ? "rgba(16,185,129,0.03)" : "#f9fafb",
                    border: `1.5px solid ${jobDescription.length > 20 ? "#10b981" : "#e5e7eb"}`,
                  }}
                />
                {jobDescription.length > 20 && (
                  <div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "#10b981" }}
                  >
                    <span className="text-white text-[9px] font-bold">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
              >
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "#f3f4f6",
                color: canSubmit ? "#ffffff" : "#9ca3af",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
                letterSpacing: "-0.01em",
              }}
            >
              {canSubmit ? "Analyse My Resume →" : "Upload resume + paste job description to start"}
            </button>

            <p className="text-center text-[11px]" style={{ color: "#d1d5db" }}>
              🔒 Never stored or shared with third parties
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section style={{ background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9ca3af" }}>
              How it works
            </p>
            <h2 className="text-2xl font-bold" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
              Three steps to a better resume
            </h2>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Connector line (desktop only) */}
            <div
              className="hidden sm:block absolute top-[18px] left-[calc(16.67%+14px)] right-[calc(16.67%+14px)]"
              style={{
                height: "1px",
                background: "repeating-linear-gradient(90deg, #c7d2fe 0, #c7d2fe 6px, transparent 6px, transparent 14px)",
              }}
            />

            {STEPS.map((step, i) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                {/* Number + icon */}
                <div className="relative mb-4">
                  <div>{step.icon}</div>
                  <span
                    className="absolute -top-1.5 -right-1.5 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: i === 2 ? "#10b981" : "#6366f1", color: "#fff" }}
                  >
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-sm font-bold mb-1.5" style={{ color: "#111827" }}>
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
