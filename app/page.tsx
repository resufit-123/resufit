"use client";

import { useState, useCallback, useRef } from "react";
import DropZone from "@/components/DropZone";
import ProcessingScreen from "@/components/ProcessingScreen";
import Logo from "@/components/Logo";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = file !== null && jobDescription.trim().length > 20;

  // Move focus to textarea after file upload — guide the user forward
  const handleFileChange = useCallback((f: File | null) => {
    setFile(f);
    if (f && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, []);

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

  const ctaBtnText = canSubmit
    ? "Get my tailored resume →"
    : !file
    ? "Upload your resume to get started"
    : "Paste the job description to continue";

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>

      {/* ── Nav ── */}
      <header style={{
        maxWidth: 960, margin: "0 auto", width: "100%",
        padding: "22px 32px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Logo size="md" />
        <a href="/sign-in" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>
          Sign in
        </a>
      </header>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 32px 80px",
      }}>
        <div style={{ width: "100%", maxWidth: 920 }}>

          {/* ── Headline ── */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h1 style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.035em",
              lineHeight: 1.15,
              margin: "0 0 14px",
            }}>
              Tailor your resume to the job.
            </h1>
            <p style={{ fontSize: 15, color: "#9ca3af", margin: 0, fontWeight: 400 }}>
              Free to analyse&ensp;·&ensp;<strong style={{ color: "#6b7280", fontWeight: 600 }}>$5</strong> to download your tailored resume&ensp;·&ensp;No account needed
            </p>
          </div>

          {/* ── Two-column inputs ── */}
          <div className="rf-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1,                         /* 1px gap = hairline divider */
            background: "#e5e7eb",          /* gap colour = border */
            border: "1px solid #e5e7eb",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 20,
          }}>

            {/* ── Left: Resume upload ── */}
            <div style={{ background: "#ffffff", padding: "28px 32px" }}>
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#9ca3af",
                margin: "0 0 16px",
              }}>
                Your resume
              </p>
              <DropZone file={file} onFileChange={handleFileChange} />
            </div>

            {/* ── Right: Job description ── */}
            <div style={{ background: "#ffffff", padding: "28px 32px" }}>
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#9ca3af",
                margin: "0 0 16px",
              }}>
                Job description
              </p>
              <textarea
                ref={textareaRef}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={8}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "#111827",
                  background: "transparent",
                  padding: 0,
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  (e.target as HTMLTextAreaElement).style.setProperty(
                    "--tw-ring-color",
                    "transparent"
                  );
                }}
              />
              {jobDescription.trim().length > 0 && jobDescription.trim().length <= 20 && (
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                  Keep going — a bit more text and we&rsquo;re ready
                </p>
              )}
            </div>

          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{
              marginBottom: 16, padding: "12px 16px", borderRadius: 6,
              background: "#fef2f2", border: "1px solid #fecaca",
              fontSize: 13, color: "#dc2626",
            }}>
              {error}
            </div>
          )}

          {/* ── CTA ── */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: "100%",
              padding: "18px 24px",
              border: "none",
              borderRadius: 4,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? "#6366f1" : "#f3f4f6",
              color: canSubmit ? "#ffffff" : "#9ca3af",
              transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (canSubmit) {
                (e.currentTarget as HTMLButtonElement).style.background = "#4f46e5";
              }
            }}
            onMouseLeave={(e) => {
              if (canSubmit) {
                (e.currentTarget as HTMLButtonElement).style.background = "#6366f1";
              }
            }}
          >
            {ctaBtnText}
          </button>

          {/* ── Sub-copy ── */}
          {canSubmit ? (
            <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
              Instant analysis · <strong style={{ color: "#6b7280" }}>$5</strong> to download · PDF + editable Word
            </p>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
              {["🔒 Private & secure", "📄 PDF + editable Word", "⚡ Results in seconds"].map((t) => (
                <span key={t} style={{ fontSize: 11, color: "#9ca3af" }}>{t}</span>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ── Mobile override: stack to single column ── */}
      <style>{`
        @media (max-width: 640px) {
          .rf-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}
