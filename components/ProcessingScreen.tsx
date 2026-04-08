"use client";

import { useState, useEffect } from "react";

const STEPS = [
  { text: "Reading your resume...", duration: 300 },
  { text: "Scanning job requirements", duration: 350 },
  { text: "Identifying required skills and keywords", duration: 300 },
  { text: "Checking your current match rate", duration: 300 },
  { text: "Detecting formatting issues", duration: 250 },
  { text: "Building your skills gap report", duration: 350 },
  { text: "Almost ready...", duration: 400 },
];

export default function ProcessingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) return;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), STEPS[stepIndex].duration);
    return () => clearTimeout(timer);
  }, [stepIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#ffffff" }}
    >
      <div className="w-full max-w-xs text-center">
        {/* Spinner */}
        <div className="relative w-12 h-12 mx-auto mb-7">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2.5px solid #f3f4f6",
              borderTopColor: "#6366f1",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        <h2 className="text-lg font-bold mb-1" style={{ color: "#111827" }}>
          Analysing your resume
        </h2>
        <p className="text-xs mb-8" style={{ color: "#9ca3af" }}>
          This takes just a few seconds
        </p>

        {/* Step log */}
        <div className="space-y-2 text-left">
          {STEPS.slice(0, stepIndex + 1).map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 transition-opacity"
              style={{ opacity: i === stepIndex ? 1 : 0.35 }}
            >
              <span
                className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  background: i < stepIndex ? "#10b981" : "#6366f1",
                  color: "#fff",
                }}
              >
                {i < stepIndex ? "✓" : "•"}
              </span>
              <span className="text-sm" style={{ color: "#4b5563" }}>
                {step.text}
                {i === stepIndex && <span style={{ color: "#6366f1" }}>{dots}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
