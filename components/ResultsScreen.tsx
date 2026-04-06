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

  const matchedCount = result.skills.filter((s) => s.status === "matched").length;
  const addedCount   = result.skills.filter((s) => s.status === "added").length;
  const confirmedCount = result.skills.filter((s) => s.status === "confirmed").length;

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
    <main className="min-h-screen bg-[#0f172a] px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-[#1e293b] border border-[#334155] rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-[#64748b] mb-0.5">Before</p>
              <p className="text-2xl font-bold text-red-400">{result.scoreBefor}%</p>
            </div>
            <div className="flex-1 h-2 bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${result.scoreAfter}%`, background: "linear-gradient(90deg, #8b5cf6, #10b981)" }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-[#64748b] mb-0.5">After</p>
              <p className="text-2xl font-bold text-[#10b981]">{result.scoreAfter}%</p>
            </div>
          </div>
        </div>

        {/* Skill gap banner */}
        {skillGapAnswered && (
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}
          >
            <span className="text-[#a78bfa]">◉</span>
            <div>
              <p className="text-sm font-medium text-white">Resume refined with your answers</p>
              <p className="text-xs text-[#64748b]">
                We&apos;ve incorporated the details you provided — check the skills section below.
              </p>
            </div>
          </div>
        )}

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume preview */}
          <div className="lg:col-span-2 space-y-4">
            {/* Template picker */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                Template
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTemplateChange(t.id)}
                    className="rounded-lg px-3 py-2.5 text-left transition-all"
                    style={{
                      background: selectedTemplate === t.id ? "rgba(139,92,246,0.15)" : "rgba(15,23,42,0.5)",
                      border: `1px solid ${selectedTemplate === t.id ? "#8b5cf6" : "#334155"}`,
                    }}
                  >
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] text-[#475569] mt-0.5 leading-tight">{t.best}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Before / After toggle */}
            <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-xl p-1">
              <button
                onClick={() => setShowOriginal(false)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: !showOriginal ? "#8b5cf6" : "transparent",
                  color: !showOriginal ? "#fff" : "#64748b",
                }}
              >
                Optimized
              </button>
              <button
                onClick={() => setShowOriginal(true)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: showOriginal ? "#334155" : "transparent",
                  color: showOriginal ? "#fff" : "#64748b",
                }}
              >
                Original
              </button>
            </div>

            {/* Resume content */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 font-mono text-xs text-[#94a3b8] whitespace-pre-wrap leading-relaxed min-h-[400px]">
              {showOriginal
                ? sessionStorage.getItem("rf_resume_text") ?? "(original not available)"
                : finalResume}
            </div>

            {/* Download */}
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: downloading ? "#334155" : "linear-gradient(135deg, #7c3aed, #6366f1)" }}
              >
                {downloading ? "Preparing PDF..." : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Skills sidebar */}
          <div className="space-y-4">
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                Skills required for this role
              </p>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] text-[#10b981]">✓ Already in resume</span>
                <span className="text-[10px] text-[#a78bfa]">✦ Added by ResuFit</span>
                {skillGapAnswered && (
                  <span className="text-[10px] text-[#c4b5fd]">◉ Confirmed by you</span>
                )}
              </div>

              <div className="space-y-1.5">
                {result.skills.map((skill) => {
                  const isConfirmed = skillGapAnswered && skill.status === "confirmed";
                  const isAdded = skill.status === "added";
                  const isMatched = skill.status === "matched";

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
                        style={{
                          color: isConfirmed
                            ? "#c4b5fd"
                            : isAdded
                            ? "#10b981"
                            : isMatched
                            ? "#818cf8"
                            : "#475569",
                        }}
                      >
                        {isConfirmed ? "◉" : isAdded ? "✦" : isMatched ? "✓" : "·"}
                      </span>
                      <span
                        style={{
                          color: isConfirmed
                            ? "#c4b5fd"
                            : isAdded
                            ? "#a7f3d0"
                            : isMatched
                            ? "#c7d2fe"
                            : "#475569",
                        }}
                      >
                        {skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-[#334155] text-xs text-[#475569] space-y-0.5">
                <p>{matchedCount} already matched</p>
                <p>{addedCount} keywords added</p>
                {confirmedCount > 0 && <p>{confirmedCount} confirmed by you</p>}
              </div>
            </div>

            {/* ATS issues */}
            {result.atsIssues.length > 0 && (
              <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                  Format fixes applied
                </p>
                <div className="space-y-2">
                  {result.atsIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#10b981] text-xs mt-0.5 flex-shrink-0">✓</span>
                      <p className="text-xs text-[#94a3b8] leading-relaxed">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
