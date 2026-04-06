"use client";

import { useState, useEffect } from "react";

const STEPS = [
  { text: "Scanning job requirements...", duration: 300 },
  { text: "Found 14 required skills, 6 preferred qualifications", duration: 350 },
  { text: "Analyzing your resume...", duration: 300 },
  { text: "Matched 5 of 14 core skills", duration: 300 },
  { text: "Checking format compatibility with hiring software...", duration: 250 },
  { text: "Found 3 format issues — fixing automatically", duration: 350 },
  { text: "Optimizing bullet points with quantified impact...", duration: 400 },
  { text: "Rewriting professional summary...", duration: 300 },
  { text: "Adding missing keywords naturally...", duration: 300 },
  { text: "Generating optimized resume...", duration: 250 },
];

export default function ProcessingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");

  // Advance through steps
  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) return;

    const timer = setTimeout(() => {
      setStepIndex((i) => i + 1);
    }, STEPS[stepIndex].duration);

    return () => clearTimeout(timer);
  }, [stepIndex]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Spinner */}
        <div className="relative w-14 h-14 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "3px solid #1e293b",
              borderTopColor: "#8b5cf6",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        <h2 className="text-lg font-bold text-white mb-1">Optimizing your resume</h2>
        <p className="text-xs text-[#475569] mb-8">Usually ready in under 10 seconds</p>

        {/* Step log */}
        <div className="space-y-1.5 text-left">
          {STEPS.slice(0, stepIndex + 1).map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5"
              style={{ opacity: i === stepIndex ? 1 : 0.4 }}
            >
              <span
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                style={{
                  background: i < stepIndex ? "#10b981" : "#8b5cf6",
                  color: "#fff",
                }}
              >
                {i < stepIndex ? "✓" : "•"}
              </span>
              <span className="text-sm text-[#94a3b8]">
                {step.text}
                {i === stepIndex && <span className="text-[#8b5cf6]">{dots}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
