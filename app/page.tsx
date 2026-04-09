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
      <header className="w-full max-w-2xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <Logo size="md" />
        <a href="/sign-in" className="text-sm" style={{ color: "#9ca3af" }}>Sign in</a>
      </header>

      {/* ── Single centred column ── */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-10 pb-20">
        <div className="w-full max-w-xl">

          {/* Headline */}
          <div className="text-center mb-8">
            <h1
              className="font-bold leading-tight mb-3"
              style={{ fontSize: "clamp(1.65rem, 4vw, 2.4rem)", color: "#111827", letterSpacing: "-0.03em" }}
            >
              A resume tailored to the job —{" "}
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                ready to download.
              </span>
            </h1>
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              Free to analyse &nbsp;·&nbsp; <strong style={{ color: "#4b5563" }}>$5</strong> to download &nbsp;·&nbsp; No account needed
            </p>
          </div>

          {/* 3-step progress strip */}
          <div
            className="flex items-center justify-between mb-6 px-2"
            style={{ gap: 0 }}
          >
            {/* Step 1 */}
            <div className="flex flex-col items-center" style={{ flex: 1 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5"
                style={{
                  background: file ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#eef2ff",
                  color: file ? "#fff" : "#6366f1",
                  transition: "all 0.3s",
                }}
              >
                {file ? "✓" : "1"}
              </div>
              <span className="text-[10px] font-semibold text-center" style={{ color: file ? "#6366f1" : "#9ca3af" }}>
                Upload resume
              </span>
            </div>

            {/* Connector */}
            <div style={{ flex: 1, height: 1, background: "#e5e7eb", marginBottom: 20 }} />

            {/* Step 2 */}
            <div className="flex flex-col items-center" style={{ flex: 1 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5"
                style={{
                  background: jobDescription.length > 20 ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#eef2ff",
                  color: jobDescription.length > 20 ? "#fff" : "#6366f1",
                  transition: "all 0.3s",
                }}
              >
                {jobDescription.length > 20 ? "✓" : "2"}
              </div>
              <span className="text-[10px] font-semibold text-center" style={{ color: jobDescription.length > 20 ? "#6366f1" : "#9ca3af" }}>
                Paste job post
              </span>
            </div>

            {/* Connector */}
            <div style={{ flex: 1, height: 1, background: "#e5e7eb", marginBottom: 20 }} />

            {/* Step 3 */}
            <div className="flex flex-col items-center" style={{ flex: 1 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5"
                style={{ background: "#eef2ff", color: "#6366f1" }}
              >
                3
              </div>
              <span className="text-[10px] font-semibold text-center" style={{ color: "#9ca3af" }}>
                Download for $5
              </span>
            </div>
          </div>

          {/* Form card */}
          <div style={{
            background: "#ffffff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 20,
            boxShadow: "0 8px 30px rgba(99,102,241,0.09), 0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div className="p-6 space-y-5">

              {/* Step 1: Upload */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>
                  Step 1 · Upload your resume
                </p>
                <DropZone file={file} onFileChange={setFile} />
              </div>

              <div style={{ borderTop: "1px solid #f3f4f6", margin: "0 -24px" }} />

              {/* Step 2: Job description */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>
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
                  className="w-full py-4 rounded-xl font-bold transition-all"
                  style={{
                    background: canSubmit
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "#f3f4f6",
                    color: canSubmit ? "#ffffff" : "#9ca3af",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    boxShadow: canSubmit ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
                    fontSize: "0.95rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {canSubmit ? "Analyse my resume — free →" : "Add your resume + job description to continue"}
                </button>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-[11px]" style={{ color: "#9ca3af" }}>
                    Instant free analysis · <strong style={{ color: "#4b5563" }}>$5</strong> to download · PDF + editable Word
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom trust strip */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {["🔒 Private & secure", "📄 PDF + editable Word", "⚡ Results in seconds"].map((item) => (
              <span key={item} className="text-xs" style={{ color: "#9ca3af" }}>{item}</span>
            ))}
          </div>

        </div>
      </main>

    </div>
  );
}
