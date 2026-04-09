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
  const [ctaHover, setCtaHover] = useState(false);

  const canSubmit = file !== null && jobDescription.trim().length > 20;
  const step1Done = file !== null;
  const step2Done = jobDescription.trim().length > 20;

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
    <div className="flex-1 flex flex-col" style={{ background: "#f9fafb", minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <header style={{ maxWidth: 560, margin: "0 auto", width: "100%", padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size="md" />
        <a href="/sign-in" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>Sign in</a>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>

          {/* ── Headline ── */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{
              fontSize: "clamp(1.5rem, 4vw, 2.1rem)",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              margin: "0 0 10px",
            }}>
              Get a resume that matches
              <br />
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                exactly the job you want.
              </span>
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
              Free to analyse &nbsp;·&nbsp; <strong style={{ color: "#6b7280" }}>$5</strong> to download &nbsp;·&nbsp; No account needed
            </p>
          </div>

          {/* ── Card ── */}
          <div style={{
            background: "#ffffff",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(99,102,241,0.10), 0 20px 60px rgba(0,0,0,0.06)",
            border: "1px solid rgba(99,102,241,0.12)",
          }}>

            {/* Coloured top accent bar */}
            <div style={{
              height: 4,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
            }} />

            <div style={{ padding: "28px 28px 24px" }}>

              {/* ── Step 1: Upload ── */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: step1Done ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#eef2ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.3s ease",
                  }}>
                    {step1Done
                      ? <span style={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>✓</span>
                      : <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 800 }}>1</span>
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>
                      Upload your current resume
                    </p>
                    {!step1Done && (
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                        PDF, Word, or plain text
                      </p>
                    )}
                    {step1Done && (
                      <p style={{ fontSize: 11, color: "#10b981", margin: "2px 0 0", fontWeight: 600 }}>
                        {file!.name} — uploaded ✓
                      </p>
                    )}
                  </div>
                </div>

                <DropZone file={file} onFileChange={setFile} />
              </div>

              {/* ── Connector ── */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                margin: "20px 0",
                opacity: step1Done ? 1 : 0.35,
                transition: "opacity 0.4s ease",
              }}>
                <div style={{ flex: 1, height: 1, background: step1Done ? "#c7d2fe" : "#e5e7eb", transition: "background 0.4s" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: step1Done ? "#6366f1" : "#9ca3af", letterSpacing: "0.06em", transition: "color 0.4s" }}>
                  THEN
                </span>
                <div style={{ flex: 1, height: 1, background: step1Done ? "#c7d2fe" : "#e5e7eb", transition: "background 0.4s" }} />
              </div>

              {/* ── Step 2: Job description ── */}
              <div style={{
                opacity: step1Done ? 1 : 0.45,
                transform: step1Done ? "translateY(0)" : "translateY(4px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: step2Done ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#eef2ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.3s ease",
                  }}>
                    {step2Done
                      ? <span style={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>✓</span>
                      : <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 800 }}>2</span>
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>
                      Paste the job description
                    </p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                      Copy it straight from LinkedIn, Indeed, or any job site
                    </p>
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={step1Done
                      ? "Paste the full job description here…"
                      : "Upload your resume first, then paste the job description here…"
                    }
                    rows={5}
                    disabled={!step1Done}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px 16px",
                      borderRadius: 12,
                      fontSize: 13,
                      lineHeight: 1.6,
                      resize: "none",
                      outline: "none",
                      color: "#111827",
                      background: step2Done ? "rgba(99,102,241,0.02)" : step1Done ? "#fafafa" : "#f9fafb",
                      border: `1.5px solid ${step2Done ? "#a5b4fc" : step1Done ? "#e5e7eb" : "#f3f4f6"}`,
                      cursor: step1Done ? "text" : "default",
                      transition: "border-color 0.3s, background 0.3s",
                    }}
                  />
                  {step2Done && (
                    <div style={{
                      position: "absolute", top: 12, right: 12,
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#6366f1",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 800 }}>✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Error ── */}
              {error && (
                <div style={{
                  marginBottom: 16, padding: "12px 14px", borderRadius: 10,
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
                onMouseEnter={() => setCtaHover(true)}
                onMouseLeave={() => setCtaHover(false)}
                style={{
                  width: "100%",
                  padding: "17px 24px",
                  borderRadius: 13,
                  border: "none",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  background: canSubmit
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "#f3f4f6",
                  color: canSubmit ? "#ffffff" : "#9ca3af",
                  boxShadow: canSubmit
                    ? ctaHover
                      ? "0 6px 28px rgba(99,102,241,0.5)"
                      : "0 4px 20px rgba(99,102,241,0.3)"
                    : "none",
                  transform: canSubmit && ctaHover ? "translateY(-1px)" : "translateY(0)",
                  transition: "background 0.3s, box-shadow 0.2s, transform 0.15s, color 0.3s",
                }}
              >
                {canSubmit
                  ? <span>Analyse my resume — free&nbsp;&nbsp;→</span>
                  : <span>{step1Done ? "Paste a job description to continue" : "Upload your resume to get started"}</span>
                }
              </button>

              {/* CTA sub-copy */}
              {canSubmit && (
                <p style={{
                  textAlign: "center", fontSize: 11, color: "#9ca3af",
                  margin: "10px 0 0",
                }}>
                  Instant analysis · <strong style={{ color: "#6b7280" }}>$5</strong> to download your tailored resume · PDF + editable Word
                </p>
              )}

            </div>
          </div>

          {/* ── Trust strip ── */}
          <div style={{
            display: "flex", justifyContent: "center",
            gap: 20, marginTop: 20, flexWrap: "wrap",
          }}>
            {[
              "🔒 Private & secure",
              "📄 PDF + editable Word",
              "⚡ Results in seconds",
            ].map((item) => (
              <span key={item} style={{ fontSize: 11, color: "#9ca3af" }}>{item}</span>
            ))}
          </div>

        </div>
      </main>

    </div>
  );
}
