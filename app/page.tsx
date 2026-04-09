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
  const [textareaFocused, setTextareaFocused] = useState(false);
  const [validationHint, setValidationHint] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const canSubmit = file !== null && jobDescription.trim().length > 20;

  const handleFileChange = useCallback((f: File | null) => {
    setFile(f);
    if (f) {
      setValidationHint(null);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    // Always-active CTA — validate inline rather than disabling
    if (!file) {
      setValidationHint("resume");
      dropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (jobDescription.trim().length <= 20) {
      setValidationHint("job");
      textareaRef.current?.focus();
      return;
    }

    setValidationHint(null);
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
  }, [file, jobDescription]);

  if (isProcessing) return <ProcessingScreen />;

  // Shared inner-box style — both panels identical
  const inputBoxStyle: React.CSSProperties = {
    border: "1.5px solid #ddd6fe",
    borderRadius: 14,
    background: "#f5f3ff",
    minHeight: 200,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "border-color 0.2s",
  };

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
              margin: "0 0 14px",
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
            <p style={{ fontSize: 15, color: "#4b5563", margin: 0, lineHeight: 1.5 }}>
              Your real experience, matched to what they&rsquo;re actually hiring for.
            </p>
          </div>

          {/* ── Card ── */}
          <div style={{
            background: "#ffffff",
            borderRadius: 20,
            boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(99,102,241,0.10)",
            overflow: "hidden",
            marginBottom: 16,
          }}>

            {/* ── Two columns ── */}
            <div className="rf-grid" style={{
              display: "grid",
              gridTemplateColumns: "1fr 1px 1fr",
            }}>

              {/* ── Left: Resume upload ── */}
              <div style={{ padding: "28px 28px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: file
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "#ede9fe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 11, fontWeight: 800,
                    color: file ? "#fff" : "#6366f1",
                    transition: "background 0.25s",
                  }}>
                    {file ? "✓" : "1"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    Drop your resume
                  </span>
                </div>

                <div
                  ref={dropRef}
                  style={{
                    ...inputBoxStyle,
                    borderColor: validationHint === "resume"
                      ? "#f87171"
                      : file ? "#c4b5fd" : "#ddd6fe",
                  }}
                >
                  <DropZone file={file} onFileChange={handleFileChange} />
                </div>

                {validationHint === "resume" && (
                  <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>
                    Please upload your resume first.
                  </p>
                )}
              </div>

              {/* Hairline divider */}
              <div style={{ background: "#f3f4f6" }} />

              {/* ── Right: Job description ── */}
              <div style={{ padding: "28px 28px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: jobDescription.trim().length > 20
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "#ede9fe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 11, fontWeight: 800,
                    color: jobDescription.trim().length > 20 ? "#fff" : "#6366f1",
                    transition: "background 0.25s",
                  }}>
                    {jobDescription.trim().length > 20 ? "✓" : "2"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    Paste the job description
                  </span>
                </div>

                <div style={{
                  ...inputBoxStyle,
                  borderColor: validationHint === "job"
                    ? "#f87171"
                    : textareaFocused
                    ? "#a5b4fc"
                    : jobDescription.trim().length > 20 ? "#c4b5fd" : "#ddd6fe",
                }}>
                  <textarea
                    ref={textareaRef}
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      if (validationHint === "job") setValidationHint(null);
                    }}
                    onFocus={() => setTextareaFocused(true)}
                    onBlur={() => setTextareaFocused(false)}
                    placeholder="Paste the full job description here…"
                    style={{
                      flex: 1,
                      minHeight: 200,
                      width: "100%",
                      boxSizing: "border-box",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "#111827",
                      background: "transparent",
                      padding: "16px 18px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {validationHint === "job" && (
                  <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>
                    Paste the job description to continue.
                  </p>
                )}
              </div>
            </div>

            {/* ── Divider ── */}
            <div style={{ height: 1, background: "#f3f4f6" }} />

            {/* ── CTA row ── */}
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

              {/* Always-purple hero CTA */}
              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  padding: "17px 24px",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#ffffff",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
                  transition: "box-shadow 0.2s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(99,102,241,0.45)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(255,255,255,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  3
                </span>
                <span>Optimise my resume — free analysis</span>
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", margin: "10px 0 0" }}>
                Free to analyse &nbsp;·&nbsp;{" "}
                <strong style={{ color: "#6b7280" }}>$5</strong> to download &nbsp;·&nbsp; PDF + editable Word
              </p>
            </div>

          </div>

          {/* ── Trust strip ── */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {["🔒 Private & secure", "⚡ Results in seconds", "No account needed"].map((t) => (
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
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
