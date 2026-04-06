"use client";

import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import ProcessingScreen from "@/components/ProcessingScreen";
import type { OptimizationResult, Template } from "@/types";

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
      // Step 1: Upload and extract text
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

      // Step 2: Store in sessionStorage to pass to results page
      // (never persisted server-side until payment confirmed)
      sessionStorage.setItem("rf_resume_text", resumeText);
      sessionStorage.setItem("rf_job_description", jobDescription);
      sessionStorage.setItem("rf_file_name", file.name);

      // Redirect to sign-in/sign-up if not authenticated, otherwise to results
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
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center">
      {/* Hero */}
      <div className="w-full max-w-xl px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-full px-4 py-1.5 text-xs text-[#94a3b8] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block" />
          Optimized against ATS criteria from 50+ hiring platforms
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
          Get your focused,{" "}
          <span className="text-[#8b5cf6]">100% tailored</span> resume in 10 seconds
        </h1>

        <p className="text-sm text-[#a78bfa] font-medium max-w-md mx-auto leading-relaxed">
          Hiring software filters out most applicants before a human reads their
          resume. We make sure yours gets through.
        </p>
      </div>

      {/* Upload card */}
      <div className="w-full max-w-xl px-6">
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-4">
          {/* Step 1: Resume upload */}
          <div>
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Step 1 — Upload your resume
            </p>
            <DropZone file={file} onFileChange={setFile} />
            <p className="text-[11px] text-[#475569] text-center mt-2">
              🔒 Your resume is never stored or shared
            </p>
          </div>

          {/* Step 2: Job description */}
          <div className="relative">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Step 2 — Paste the job description
            </p>
            <div className="relative">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={6}
                className="w-full rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                style={{
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

          {/* Error message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
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
            }}
          >
            Optimize My Resume →
          </button>

          {!canSubmit && (
            <p className="text-center text-xs text-[#475569]">
              Add your resume and a job description to continue
            </p>
          )}
        </div>

        {/* Social proof placeholder */}
        <p className="text-center text-xs text-[#475569] mt-4 pb-8">
          Trusted by job seekers applying to Google, Meta, HSBC, McKinsey and more
        </p>
      </div>
    </main>
  );
}
