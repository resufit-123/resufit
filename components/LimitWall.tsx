"use client";

import type { Plan } from "@/types";

interface LimitWallProps {
  onPurchase: (plan: Plan) => void;
}

export default function LimitWall({ onPurchase }: LimitWallProps) {
  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm text-[#64748b] mb-6">
          You&apos;ve used all 30 optimizations this month.
        </p>

        {/* PRIMARY: Annual Plan */}
        <div
          className="rounded-2xl p-6 mb-3"
          style={{
            border: "2px solid #8b5cf6",
            boxShadow: "0 0 32px rgba(139,92,246,0.18)",
            background: "rgba(139,92,246,0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Annual Plan</span>
            <span
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}
            >
              Best Value
            </span>
          </div>

          <p className="text-3xl font-bold text-white mb-0.5">
            $99
            <span className="text-sm font-normal text-[#64748b]">/year</span>
          </p>
          <p className="text-xs text-[#a78bfa] mb-1">$8.25/month billed annually</p>
          <p className="text-xs text-[#94a3b8] mb-3">50 optimizations/month — 67% more</p>

          <div
            className="rounded-lg px-3 py-2 mb-4"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <p className="text-xs text-[#10b981] font-medium">
              You save $81 compared to paying monthly
            </p>
          </div>

          <button
            onClick={() => onPurchase("annual")}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            Upgrade to Annual →
          </button>
        </div>

        {/* SECONDARY: Start next month early */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(15,23,42,0.5)", border: "1px solid #1e293b" }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#94a3b8]">Start next month early</span>
          </div>
          <p className="text-xl font-bold text-[#94a3b8] mb-0.5">
            $15
            <span className="text-sm font-normal text-[#475569]">/month</span>
          </p>
          <p className="text-xs text-[#475569] mb-3">30 optimizations · Resets next billing cycle</p>
          <button
            onClick={() => onPurchase("pro")}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-[#64748b] transition-all"
            style={{ background: "transparent", border: "1px solid #334155" }}
          >
            Continue with Pro
          </button>
        </div>

        <p className="text-center text-[11px] text-[#334155] mt-4">
          Secured by Stripe · Cancel anytime
        </p>
      </div>
    </main>
  );
}
