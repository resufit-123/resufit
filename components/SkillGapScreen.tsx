"use client";

import { useState } from "react";
import type { SkillGapQuestion } from "@/types";

interface SkillGapScreenProps {
  questions: SkillGapQuestion[];
  jobTitle: string | null;
  onComplete: (answers: Record<string, string>, skipped: boolean) => void;
}

export default function SkillGapScreen({ questions, jobTitle, onComplete }: SkillGapScreenProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [refining, setRefining] = useState(false);

  const handleRefine = async () => {
    setRefining(true);
    // Small animation delay so the user sees feedback before the API call resolves
    await new Promise((r) => setTimeout(r, 1800));
    onComplete(answers, false);
  };

  const handleSkip = () => {
    onComplete({}, true);
  };

  const hasAnyAnswer = Object.values(answers).some((a) => a.trim().length > 0);

  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            ✦ One quick step to improve your resume further
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            Help us fill in the gaps
          </h2>
          {jobTitle && (
            <p className="text-xs text-[#64748b]">
              For your <span className="text-[#94a3b8]">{jobTitle}</span> application
            </p>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {questions.map((q) => (
            <div key={q.id}>
              <label className="block text-sm text-[#94a3b8] mb-2 leading-relaxed">
                {q.question}
                <span className="ml-1.5 text-[10px] text-[#475569]">
                  (appeared {q.occurrences}× in the job description)
                </span>
              </label>
              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                placeholder="A brief example is fine — even a sentence helps..."
                rows={3}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-[#475569] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        {refining ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-[#a78bfa]">
              <span
                className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent inline-block"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Refining your resume...
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handleRefine}
              disabled={!hasAnyAnswer}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mb-3"
              style={{
                background: hasAnyAnswer
                  ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                  : "#1e293b",
                color: hasAnyAnswer ? "#fff" : "#475569",
                border: hasAnyAnswer ? "none" : "1px solid #334155",
                cursor: hasAnyAnswer ? "pointer" : "not-allowed",
              }}
            >
              Refine My Resume →
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "transparent",
                border: "1px solid #334155",
                color: "#64748b",
              }}
            >
              Skip — download as-is
            </button>
          </>
        )}
      </div>
    </main>
  );
}
