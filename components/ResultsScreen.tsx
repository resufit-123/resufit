"use client";

import { useState } from "react";
import type { OptimizationResult, Template } from "@/types";

const TEMPLATES: { id: Template; name: string; best: string }[] = [
  { id: "executive", name: "Executive", best: "Finance, Law, Banking" },
  { id: "modern",    name: "Modern",    best: "Tech, Product, Startups" },
  { id: "minimal",   name: "Minimal",   best: "Consulting, Strategy" },
  { id: "classic",   name: "Classic",   best: "Academia, Research" },
];

interface ResultsScreenProps {
  result: OptimizationResult;
  revisedResume: string | null;
  selectedTemplate: Template;
  onTemplateChange: (t: Template) => void;
}

export default function ResultsScreen({
  result,
  revisedResume,
  selectedTemplate,
  onTemplateChange,
}: ResultsScreenProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const skillGapAnswered = revisedResume !== null;
  const finalResume = revisedResume ?? result.optimizedResume;
  const matchedCount   = result.skills.filter((s) => s.status === "matched").length;
  const addedCount     = result.skills.filter((s) => s.status === "added").length;
  const confirmedCount = result.skills.filter((s) => s.status === "confirmed").length;
  const improvement    = result.scoreAfter - result.scoreBefor;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/download/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: finalResume, template: selectedTemplate }),
      });
      if (!res.ok) throw new Error("Download failed.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resufit-optimized.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* ── Score hero ─────────────────────────────────── */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #f3f4f6" }}>
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#9ca3af" }}>
                Optimisation complete
              </p>
              {(result.jobTitle || result.company) && (
                <p className="text-sm font-medium" style={{ color: "#374151" }}>
                  {[result.jobTitle, result.company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            {skillGapAnswered && (
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#7c3aed" }}
              >
                <span>◉</span> Refined with your answers
              </div>
            )}
          </div>

          {/* Score comparison */}
          <div className="flex items-center gap-6">
            <div className="text-center w-24 shrink-0">
              <p className="text-xs mb-1 font-medium" style={{ color: "#9ca3af" }}>Before</p>
              <p className="text-4xl font-bold" style={{ color: "#ef4444" }}>
                {result.scoreBefor}<span className="text-xl">%</span>
              </p>
            </div>

            <div className="flex-1">
              <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${result.scoreBefor}%`, background: "#fca5a5" }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${result.scoreAfter}%`,
                    background: "linear-gradient(90deg, #6366f1, #10b981)",
                    transition: "width 1s ease 0.2s",
                  }}
                />
              </div>
              <div className="flex justify-center mt-2.5">
                <div
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
                >
                  +{improvement}% improvement
                </div>
              </div>
            </div>

            <div className="text-center w-24 shrink-0">
              <p className="text-xs mb-1 font-medium" style={{ color: "#9ca3af" }}>After</p>
              <p className="text-4xl font-bold" style={{ color: "#10b981" }}>
                {result.scoreAfter}<span className="text-xl">%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: resume + download ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
            >
              <button
                onClick={() => setShowOriginal(false)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: !showOriginal ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                  color: !showOriginal ? "#fff" : "#9ca3af",
                }}
              >
                ✦ Optimised
              </button>
              <button
                onClick={() => setShowOriginal(true)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: showOriginal ? "#f3f4f6" : "transparent",
                  color: showOriginal ? "#374151" : "#9ca3af",
                }}
              >
                Original
              </button>
            </div>

            {/* Resume preview with blur */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="px-5 py-3 border-b" style={{ borderColor: "#f3f4f6" }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#d1d5db" }}>
                  {showOriginal ? "Your original resume" : "Your optimised resume"}
                </p>
              </div>

              <div className="relative">
                <div
                  className="px-6 pt-5 pb-4 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-hidden"
                  style={{ color: "#4b5563", maxHeight: "320px" }}
                >
                  {showOriginal
                    ? (typeof window !== "undefined" ? sessionStorage.getItem("rf_resume_text") ?? "" : "")
                    : finalResume}
                </div>

                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: "170px",
                    background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 50%, #ffffff 100%)",
                  }}
                />

                <div
                  className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-6"
                  style={{ height: "170px" }}
                >
                  <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>Full resume in your download</p>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{
                      background: downloading ? "#e5e7eb" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: downloading ? "#9ca3af" : "#fff",
                      boxShadow: downloading ? "none" : "0 4px 16px rgba(99,102,241,0.3)",
                    }}
                  >
                    {downloading ? "Preparing…" : "⬇ Download PDF"}
                  </button>
                </div>
              </div>
            </div>

            {/* Template picker */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>
                Template
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTemplateChange(t.id)}
                    className="rounded-xl px-3 py-2.5 text-left transition-all"
                    style={{
                      background: selectedTemplate === t.id ? "#eef2ff" : "#f9fafb",
                      border: `1.5px solid ${selectedTemplate === t.id ? "#6366f1" : "#e5e7eb"}`,
                    }}
                  >
                    <p className="text-xs font-semibold" style={{ color: selectedTemplate === t.id ? "#4f46e5" : "#374151" }}>
                      {t.name}
                    </p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#9ca3af" }}>{t.best}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Full-width download */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="w-full py-4 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: downloading ? "#e5e7eb" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: downloading ? "#9ca3af" : "#fff",
                boxShadow: downloading ? "none" : "0 4px 20px rgba(99,102,241,0.25)",
              }}
            >
              {downloading ? "Preparing your PDF…" : "⬇ Download your optimised resume"}
            </button>
          </div>

          {/* ── Right: skills + ATS ── */}
          <div className="space-y-4">

            {/* Skills */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>
                Skills for this role
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                {addedCount > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                    +{addedCount} added
                  </span>
                )}
                {matchedCount > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}>
                    {matchedCount} matched
                  </span>
                )}
                {confirmedCount > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
                    {confirmedCount} confirmed
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {result.skills.map((skill) => {
                  const isAdded     = skill.status === "added";
                  const isMatched   = skill.status === "matched";
                  const isConfirmed = skill.status === "confirmed";
                  return (
                    <div
                      key={skill.name}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
                      style={{
                        background: isConfirmed ? "#f5f3ff" : isAdded ? "#f0fdf4" : isMatched ? "#eef2ff" : "#f9fafb",
                        border: `1px solid ${isConfirmed ? "#ddd6fe" : isAdded ? "#bbf7d0" : isMatched ? "#c7d2fe" : "#f3f4f6"}`,
                      }}
                    >
                      <span style={{ color: isConfirmed ? "#7c3aed" : isAdded ? "#15803d" : isMatched ? "#4f46e5" : "#d1d5db" }}>
                        {isConfirmed ? "◉" : isAdded ? "✦" : isMatched ? "✓" : "·"}
                      </span>
                      <span style={{ color: isConfirmed ? "#6d28d9" : isAdded ? "#166534" : isMatched ? "#3730a3" : "#9ca3af" }}>
                        {skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t text-xs space-y-0.5" style={{ borderColor: "#f3f4f6", color: "#9ca3af" }}>
                <p>✦ Added by ResuFit</p>
                <p>✓ Already in your resume</p>
                {confirmedCount > 0 && <p>◉ Confirmed by you</p>}
              </div>
            </div>

            {/* ATS issues */}
            {result.atsIssues.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af" }}>
                  Format fixes applied
                </p>
                <div className="space-y-2">
                  {result.atsIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 shrink-0" style={{ color: "#10b981" }}>✓</span>
                      <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{issue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start again */}
            <a
              href="/"
              className="block text-center text-xs py-3 rounded-xl"
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", color: "#9ca3af" }}
            >
              ← Optimise another resume
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
