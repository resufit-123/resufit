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

  const matchedCount  = result.skills.filter((s) => s.status === "matched").length;
  const addedCount    = result.skills.filter((s) => s.status === "added").length;
  const confirmedCount = result.skills.filter((s) => s.status === "confirmed").length;
  const improvement   = result.scoreAfter - result.scoreBefor;

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
    <main
      className="min-h-screen"
      style={{ background: "#0f172a" }}
    >
      {/* ── Score hero ─────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(124,58,237,0.12) 0%, transparent 100%)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div className="max-w-5xl mx-auto px-5 py-8">
          {/* Top line */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#64748b" }}>
                Optimisation complete
              </p>
              {(result.jobTitle || result.company) && (
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  {[result.jobTitle, result.company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            {skillGapAnswered && (
              <div
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  color: "#a78bfa",
                }}
              >
                <span>◉</span> Refined with your answers
              </div>
            )}
          </div>

          {/* Score comparison */}
          <div className="flex items-center gap-6">
            {/* Before */}
            <div className="text-center w-20 shrink-0">
              <p className="text-xs mb-1" style={{ color: "#64748b" }}>Before</p>
              <p className="text-4xl font-bold" style={{ color: "#f87171" }}>
                {result.scoreBefor}
                <span className="text-xl">%</span>
              </p>
            </div>

            {/* Bar */}
            <div className="flex-1">
              <div
                className="relative h-3 rounded-full overflow-hidden"
                style={{ background: "#1e293b" }}
              >
                {/* Before fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${result.scoreBefor}%`,
                    background: "rgba(248,113,113,0.3)",
                    transition: "width 0.8s ease",
                  }}
                />
                {/* After fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${result.scoreAfter}%`,
                    background: "linear-gradient(90deg, #7c3aed, #10b981)",
                    transition: "width 1s ease 0.2s",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs" style={{ color: "#475569" }}>0%</p>
                <div
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                  }}
                >
                  +{improvement}% improvement
                </div>
                <p className="text-xs" style={{ color: "#475569" }}>100%</p>
              </div>
            </div>

            {/* After */}
            <div className="text-center w-20 shrink-0">
              <p className="text-xs mb-1" style={{ color: "#64748b" }}>After</p>
              <p className="text-4xl font-bold" style={{ color: "#10b981" }}>
                {result.scoreAfter}
                <span className="text-xl">%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: resume preview ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Before / After toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: "#1e293b", border: "1px solid #334155" }}
            >
              <button
                onClick={() => setShowOriginal(false)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: !showOriginal
                    ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                    : "transparent",
                  color: !showOriginal ? "#fff" : "#64748b",
                }}
              >
                ✦ Optimised
              </button>
              <button
                onClick={() => setShowOriginal(true)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: showOriginal ? "#334155" : "transparent",
                  color: showOriginal ? "#94a3b8" : "#475569",
                }}
              >
                Original
              </button>
            </div>

            {/* Resume preview with blur-out */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid #334155" }}
            >
              {/* Paper-white header strip */}
              <div
                className="px-6 pt-6 pb-0"
                style={{ background: "#1e293b" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                  {showOriginal ? "Your original resume" : "Your optimised resume"}
                </p>
              </div>

              {/* The resume text — visible top, blurred bottom */}
              <div className="relative" style={{ background: "#1e293b" }}>
                <div
                  className="px-6 pb-6 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-hidden"
                  style={{
                    color: "#94a3b8",
                    maxHeight: "320px",
                  }}
                >
                  {showOriginal
                    ? (typeof window !== "undefined" ? sessionStorage.getItem("rf_resume_text") ?? "" : "") || "(original not saved in this session)"
                    : finalResume}
                </div>

                {/* Gradient blur overlay */}
                <div
                  className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end"
                  style={{
                    height: "180px",
                    background: "linear-gradient(to bottom, transparent 0%, rgba(30,41,59,0.7) 40%, #1e293b 100%)",
                  }}
                >
                  <div className="pb-6 text-center">
                    <p className="text-xs mb-3" style={{ color: "#64748b" }}>
                      Full resume in your download
                    </p>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloading}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{
                        background: downloading
                          ? "#334155"
                          : "linear-gradient(135deg, #7c3aed, #6366f1)",
                        boxShadow: downloading ? "none" : "0 4px 20px rgba(124,58,237,0.4)",
                      }}
                    >
                      {downloading ? "Preparing…" : "⬇ Download PDF"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Template picker */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#1e293b", border: "1px solid #334155" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>
                Template
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTemplateChange(t.id)}
                    className="rounded-lg px-3 py-2.5 text-left transition-all"
                    style={{
                      background: selectedTemplate === t.id
                        ? "rgba(124,58,237,0.15)"
                        : "rgba(15,23,42,0.5)",
                      border: `1px solid ${selectedTemplate === t.id ? "#7c3aed" : "#334155"}`,
                    }}
                  >
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#475569" }}>{t.best}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Full-width download CTA */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="w-full py-4 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: downloading
                  ? "#334155"
                  : "linear-gradient(135deg, #7c3aed, #6366f1)",
                boxShadow: downloading ? "none" : "0 4px 24px rgba(124,58,237,0.35)",
              }}
            >
              {downloading ? "Preparing PDF…" : "⬇ Download your optimised resume"}
            </button>
          </div>

          {/* ── Right: skills + ATS sidebar ── */}
          <div className="space-y-4">
            {/* Skills */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#1e293b", border: "1px solid #334155" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>
                Skills for this role
              </p>
              <div className="flex gap-3 mb-4 flex-wrap">
                {addedCount > 0 && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
                  >
                    +{addedCount} added
                  </span>
                )}
                {matchedCount > 0 && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
                  >
                    {matchedCount} matched
                  </span>
                )}
                {confirmedCount > 0 && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}
                  >
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
                        background: isConfirmed
                          ? "rgba(139,92,246,0.12)"
                          : isAdded
                          ? "rgba(16,185,129,0.08)"
                          : isMatched
                          ? "rgba(99,102,241,0.08)"
                          : "rgba(15,23,42,0.4)",
                      }}
                    >
                      <span
                        className="shrink-0 text-[11px]"
                        style={{
                          color: isConfirmed ? "#c4b5fd"
                            : isAdded ? "#10b981"
                            : isMatched ? "#818cf8"
                            : "#475569",
                        }}
                      >
                        {isConfirmed ? "◉" : isAdded ? "✦" : isMatched ? "✓" : "·"}
                      </span>
                      <span
                        style={{
                          color: isConfirmed ? "#c4b5fd"
                            : isAdded ? "#a7f3d0"
                            : isMatched ? "#c7d2fe"
                            : "#475569",
                        }}
                      >
                        {skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 space-y-1" style={{ borderTop: "1px solid #334155" }}>
                <p className="text-[10px]" style={{ color: "#475569" }}>✦ Added by ResuFit</p>
                <p className="text-[10px]" style={{ color: "#475569" }}>✓ Already in your resume</p>
                {confirmedCount > 0 && (
                  <p className="text-[10px]" style={{ color: "#475569" }}>◉ Confirmed by you</p>
                )}
              </div>
            </div>

            {/* ATS fixes */}
            {result.atsIssues.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: "#1e293b", border: "1px solid #334155" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>
                  Format fixes applied
                </p>
                <div className="space-y-2">
                  {result.atsIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 shrink-0" style={{ color: "#10b981" }}>✓</span>
                      <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                        {issue.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start another */}
            <a
              href="/"
              className="block text-center text-xs py-3 rounded-xl transition-all"
              style={{
                background: "rgba(15,23,42,0.5)",
                border: "1px solid #334155",
                color: "#64748b",
              }}
            >
              ← Optimise another resume
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
