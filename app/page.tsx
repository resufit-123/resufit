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
    ? "Analyse my resume — free →"
    : !file
    ? "Upload your resume to get started"
    : "Paste the job description to continue";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7ff", display: "flex", flexDirection: "column" }}>

      {/* ── Nav ── */}
      <header style={{
        maxWidth: 880, margin: "0 auto", width: "100%",
        padding: "22px 32px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Logo size="md" />
        <a href="/sign-in" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>Sign in</a>
      </header>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "44px 24px 80px",
      }}>
        <div style={{ width: "100%", maxWidth: 860 }}>

          {/* ── Headline ── */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              margin: "0 0 16px",
            }}>
              Get the resume{" "}
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                that gets you hired.
              </span>
            </h1>

            {/* Selling points — two lines, what job seekers really care about */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <p style={{ fontSize: 15, color: "#4b5563", margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
                Speaks the language of the job, gets you in the door.
              </p>
              <p style={{ fontSize: 15, color: "#6b7280", margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
                Your real experience, matched to what they&rsquo;re actually hiring for.
              </p>
            </div>
          </div>

          {/* ── Form card ── */}
          <div style={{
            background: "#ffffff",
            borderRadius: 20,
            boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(99,102,241,0.10)",
            overflow: "hidden",
            marginBottom: 16,
          }}>

            {/* Two-column inputs */}
            <div className="rf-grid" style={{
              display: "grid",
              gridTemplateColumns: "1fr 1px 1fr",
            }}>

              {/* ── Left: Resume upload ── */}
              <div style={{ padding: "32px 36px" }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#a5b4fc",
                  margin: "0 0 20px",
                }}>
                  Your resume
                </p>
                <DropZone file={file} onFileChange={handleFileChange} />
              </div>

              {/* Hairline divider */}
              <div style={{ background: "#f3f4f6", alignSelf: "stretch" }} />

              {/* ── Right: Job description ── */}
              <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column" }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#a5b4fc",
                  margin: "0 0 20px",
                }}>
                  Job description
                </p>
                <textarea
                  ref={textareaRef}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here…"
                  style={{
                    flex: 1,
                    minHeight: 180,
                    width: "100%",
                    boxSizing: "border-box",
                    border: "none",
                    outline: "none",
                    resize: "none",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#111827",
                    background: "transparent",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                />
                {jobDescription.trim().length > 0 && jobDescription.trim().length <= 20 && (
                  <p style={{ fontSize: 11, color: "#a5b4fc", marginTop: 8 }}>
                    A little more and we&rsquo;re good to go
                  </p>
                )}
              </div>
            </div>

            {/* Divider above CTA */}
            <div style={{ height: 1, background: "#f3f4f6" }} />

            {/* ── CTA section ── */}
            <div style={{ padding: "20px 28px" }}>
              {error && (
                <div style={{
                  marginBottom: 14, padding: "11px 14px", borderRadius: 10,
                  background: "#fef2f2", border: "1px solid #fecaca",
                  fontSize: 13, color: "#dc2626",
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  padding: "17px 24px",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  background: canSubmit
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "#f3f4f6",
                  color: canSubmit ? "#ffffff" : "#9ca3af",
                  boxShadow: canSubmit ? "0 4px 20px rgba(99,102,241,0.28)" : "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (canSubmit) {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(99,102,241,0.42)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (canSubmit) {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.28)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  }
                }}
              >
                {ctaBtnText}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", margin: "10px 0 0" }}>
                {canSubmit
                  ? <>Instant analysis · <strong style={{ color: "#6b7280" }}>$5</strong> to download · PDF + editable Word</>
                  : <>Free to analyse · <strong style={{ color: "#6b7280" }}>$5</strong> to download · No account needed</>
                }
              </p>
            </div>

          </div>

          {/* ── Trust strip ── */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {["🔒 Private & secure", "📄 PDF + editable Word", "⚡ Results in seconds"].map((t) => (
              <span key={t} style={{ fontSize: 11, color: "#9ca3af" }}>{t}</span>
            ))}
          </div>

        </div>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .rf-grid {
            grid-template-columns: 1fr !important;
          }
          .rf-grid > div:nth-child(2) {
            display: none;
          }
        }
      `}</style>

    </div>
  );
}
