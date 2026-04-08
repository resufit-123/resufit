"use client";

import type { Plan } from "@/types";

interface PaymentWallProps {
  email: string;
  marketingOptIn: boolean;
  onEmailChange: (email: string) => void;
  onMarketingOptInChange: (v: boolean) => void;
  onPurchase: (plan: Plan) => void;
}

export default function PaymentWall({
  email,
  marketingOptIn,
  onEmailChange,
  onMarketingOptInChange,
  onPurchase,
}: PaymentWallProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10" style={{ background: "#f9fafb" }}>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: "#eef2ff" }}
          >
            <span style={{ fontSize: "22px" }}>📄</span>
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "#111827" }}>
            Your optimised resume is ready
          </h2>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Choose a plan to unlock it and download your PDF
          </p>
        </div>

        {/* One-time */}
        <div
          className="rounded-2xl p-5 mb-3"
          style={{
            background: "#ffffff",
            border: "2px solid #6366f1",
            boxShadow: "0 4px 24px rgba(99,102,241,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold" style={{ color: "#111827" }}>One-time download</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
            >
              No account needed
            </span>
          </div>

          <p className="text-3xl font-bold mb-1" style={{ color: "#111827" }}>
            $5
            <span className="text-sm font-normal ml-1" style={{ color: "#9ca3af" }}>one-time</span>
          </p>
          <p className="text-xs mb-4" style={{ color: "#6b7280" }}>
            Full AI rewrite · Pay and download instantly
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Email for receipt (optional)"
            className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
            style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#111827" }}
          />

          <button
            onClick={() => onPurchase("one_time")}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            Download for $5 →
          </button>
        </div>

        {/* Pro */}
        <div
          className="rounded-2xl p-5 mb-4 cursor-pointer"
          style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
          onClick={() => onPurchase("pro")}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium" style={{ color: "#374151" }}>ResuFit Pro</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#f5f3ff", color: "#7c3aed" }}
            >
              Best value
            </span>
          </div>
          <p className="text-xl font-bold mb-1" style={{ color: "#374151" }}>
            $15<span className="text-xs font-normal" style={{ color: "#9ca3af" }}>/month</span>
          </p>
          <p className="text-xs mb-3" style={{ color: "#9ca3af" }}>
            30 optimisations/month · Dashboard · Cancel anytime
          </p>
          <button
            className="w-full py-2 rounded-xl text-xs font-medium"
            style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280" }}
          >
            Create account &amp; get Pro →
          </button>
        </div>

        {/* Marketing */}
        <label className="flex items-start gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => onMarketingOptInChange(e.target.checked)}
            className="mt-0.5 shrink-0"
            style={{ accentColor: "#6366f1" }}
          />
          <span className="text-[11px]" style={{ color: "#9ca3af" }}>
            Send me occasional job search tips from ResuFit (optional)
          </span>
        </label>

        <p className="text-center text-[11px]" style={{ color: "#d1d5db" }}>
          Secured by Stripe · Apple Pay &amp; Google Pay accepted
        </p>
      </div>
    </main>
  );
}
