"use client";

import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import ProcessingScreen from "@/components/ProcessingScreen";
import Logo from "@/components/Logo";

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
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
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

      {/* ── Nav ── */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <Logo size="md" />
        <a href="/sign-in" className="text-sm" style={{ color: "#9ca3af" }}>Sign in</a>
      </header>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-16 max-w-5xl mx-auto px-6 pt-12 pb-16">

        {/* Left: copy */}
        <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1
            className="font-bold leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", color: "#111827", letterSpacing: "-0.03em" }}
          >
            A tailored, job-winning resume —{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              matched to the role you want.
            </span>
          </h1>

          <p className="text-base leading-relaxed mb-6 max-w-md" style={{ color: "#6b7280" }}>
            Paste a job description. ResuFit rewrites your resume to match it perfectly — the right skills, the right language, the right format. Download as a polished PDF <em>or</em> an editable Word document you can keep refining.
          </p>

          {/* Value props */}
          <ul className="space-y-2.5 mb-8 w-full max-w-md">
            {[
              { icon: "✦", text: "Your experience, matched to exactly what the role requires" },
              { icon: "✦", text: "Formatting fixed so hiring software reads every word" },
              { icon: "✦", text: "Download as PDF or editable Word — ready to apply, or keep improving" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="shrink-0 text-xs mt-0.5 font-bold" style={{ color: "#6366f1" }}>{item.icon}</span>
                <span className="text-sm" style={{ color: "#4b5563" }}>{item.text}</span>
              </li>
            ))}
          </ul>

          {/* Social proof strip */}
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#9ca3af" }}>
            <span>🔒 Secure &amp; private</span>
            <span>·</span>
            <span>No account needed</span>
            <span>·</span>
            <span>Results in seconds</span>
          </div>
        </div>

        {/* Right: form — the primary action */}
        <div className="w-full lg:w-[420px] shrink-0">
          {/* Price callout above the card */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}
            >
              $5 one-time · no account needed
            </span>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #e5e7eb",
              borderRadius: "20px",
              boxShadow: "0 8px 30px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div className="p-6 space-y-5">

              {/* Step 1 */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>
                  Step 1 · Upload your resume
                </p>
                <DropZone file={file} onFileChange={setFile} />
              </div>

              <div style={{ borderTop: "1px solid #f3f4f6", marginLeft: "-24px", marginRight: "-24px" }} />

              {/* Step 2 */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>
                  Step 2 · Paste the job description
                </p>
                <div className="relative">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Copy and paste the full job post here..."
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

              {error && (
                <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                  {error}
                </div>
              )}

              {/* CTA */}
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: canSubmit ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f3f4f6",
                    color: canSubmit ? "#ffffff" : "#9ca3af",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    boxShadow: canSubmit ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
                    fontSize: "0.9rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {canSubmit ? "Get my tailored resume →" : "Add your resume + job description to continue"}
                </button>
                <p className="text-center text-[11px] mt-2.5" style={{ color: "#9ca3af" }}>
                  Free to analyse · <strong style={{ color: "#4b5563" }}>$5</strong> to download your tailored resume · No account needed
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS  — 3 steps, designed to pop
      ══════════════════════════════════════════════════ */}
      <section style={{ background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
        <div className="max-w-5xl mx-auto px-6 py-16">

          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9ca3af" }}>How it works</p>
            <h2 className="text-2xl font-bold" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
              Three steps. A better resume.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Step 1 */}
            <div
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg font-black"
                style={{ background: "#eef2ff", color: "#6366f1" }}
              >
                1
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: "#111827" }}>Upload your resume</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                PDF or Word document. We extract every word of your experience instantly.
              </p>
            </div>

            {/* Arrow (desktop) */}
            {/* Step 2 */}
            <div
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg font-black"
                style={{ background: "#eef2ff", color: "#6366f1" }}
              >
                2
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: "#111827" }}>Paste the job description</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                Copy it straight from LinkedIn, Indeed, or any job site. We read the requirements and match your experience to them.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
              }}
            >
              {/* Subtle glow */}
              <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at top right, #ffffff, transparent 60%)" }} />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg font-black relative z-10"
                style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}
              >
                3
              </div>
              <h3 className="font-bold text-base mb-2 text-white relative z-10">Download your tailored resume</h3>
              <p className="text-sm leading-relaxed relative z-10" style={{ color: "rgba(255,255,255,0.8)" }}>
                A polished, job-matched resume — download as a <strong className="text-white">PDF</strong> or an <strong className="text-white">editable Word document</strong> you can keep working on.
              </p>
              <div className="mt-4 relative z-10">
                <span
                  className="inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}
                >
                  $5 one-time · no account needed
                </span>
              </div>
            </div>

          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-10">
            <button
              onClick={() => document.querySelector("textarea")?.focus()}
              className="inline-flex items-center gap-2 py-3 px-8 rounded-xl font-bold text-sm text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
              }}
            >
              Get started for $5 →
            </button>
            <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>Free to analyse · Pay only to download</p>
          </div>

        </div>
      </section>

    </div>
  );
}
