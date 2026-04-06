"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import PaymentWall from "@/components/PaymentWall";
import LimitWall from "@/components/LimitWall";
import SkillGapScreen from "@/components/SkillGapScreen";
import ResultsScreen from "@/components/ResultsScreen";
import ProcessingScreen from "@/components/ProcessingScreen";
import type { OptimizationResult, Template } from "@/types";

type PageState =
  | "loading"           // Running the AI optimization
  | "payment_required"  // No active entitlement
  | "limit_reached"     // Pro user hit monthly cap
  | "skill_gap"         // Post-payment skill gap questions
  | "ready"             // Show results + download
  | "error";

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const optimizationId = params.id as string;
  const justPaid = searchParams.has("session_id");

  const [pageState, setPageState] = useState<PageState>(
    justPaid ? "loading" : "payment_required"
  );
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [revisedResume, setRevisedResume] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>("executive");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  // If user just completed payment, run the optimization
  useEffect(() => {
    if (justPaid) {
      runOptimization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justPaid]);

  async function runOptimization() {
    setPageState("loading");

    const resumeText = sessionStorage.getItem("rf_resume_text");
    const jobDescription = sessionStorage.getItem("rf_job_description");

    if (!resumeText || !jobDescription) {
      setError("Session expired. Please start again from the homepage.");
      setPageState("error");
      return;
    }

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, template: selectedTemplate }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "LIMIT_REACHED") {
          setPageState("limit_reached");
          return;
        }
        if (res.status === 401 || res.status === 403) {
          setPageState("payment_required");
          return;
        }
        throw new Error(data.error ?? "Optimization failed.");
      }

      setResult(data);

      // Move to skill gap if there are questions; otherwise straight to results
      if (data.skillGapQuestions?.length > 0) {
        setPageState("skill_gap");
      } else {
        setPageState("ready");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPageState("error");
    }
  }

  async function handleSkillGapComplete(answers: Record<string, string>, skipped: boolean) {
    if (skipped || !result || Object.values(answers).every((a) => !a.trim())) {
      setPageState("ready");
      return;
    }

    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optimizationId: result.optimizationId ?? optimizationId,
          answers,
          optimizedResume: result.optimizedResume,
          questions: result.skillGapQuestions,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRevisedResume(data.revisedResume);
      }
    } catch (err) {
      console.error("Skill gap revision failed:", err);
      // Fall through to results even if revision fails
    }

    setPageState("ready");
  }

  async function handlePurchase(plan: "one_time" | "pro" | "annual") {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          optimizationId: optimizationId !== "new" ? optimizationId : undefined,
          email,
          marketingOptIn,
        }),
      });

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
    }
  }

  // ── Render ─────────────────────────────────────

  if (pageState === "loading") {
    return <ProcessingScreen />;
  }

  if (pageState === "error") {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/" className="text-[#a78bfa] text-sm hover:underline">
            ← Start again
          </a>
        </div>
      </main>
    );
  }

  if (pageState === "payment_required") {
    return (
      <PaymentWall
        email={email}
        marketingOptIn={marketingOptIn}
        onEmailChange={setEmail}
        onMarketingOptInChange={setMarketingOptIn}
        onPurchase={handlePurchase}
      />
    );
  }

  if (pageState === "limit_reached") {
    return <LimitWall onPurchase={handlePurchase} />;
  }

  if (pageState === "skill_gap" && result) {
    return (
      <SkillGapScreen
        questions={result.skillGapQuestions}
        jobTitle={result.jobTitle}
        onComplete={handleSkillGapComplete}
      />
    );
  }

  if (pageState === "ready" && result) {
    return (
      <ResultsScreen
        result={result}
        revisedResume={revisedResume}
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
      />
    );
  }

  return null;
}
