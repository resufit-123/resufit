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
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">

        {/* Blurred preview hint */}
        <div
          className="rounded-2xl p-5 mb-6 text-center"
          style={{ background: "#1e293b", border: "1px solid #334155" }}
        >
          <div className="paywall-blur text-xs text-[#64748b] space-y-1 mb-3 select-none">
            <p>Senior Product Manager · 8 years experience</p>
            <p>12 keywords added · 3 formatting issues fixed</p>
            <p>Resume tailored to role requirements</p>
          </div>
          <p className="text-sm font-semibold text-white">Your optimised resume is ready</p>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>Choose a plan to unlock it</p>
        </div>

        {/* ── One-time: no account needed ── */}
        <div
          className="rounded-2xl p-5 mb-3 cursor-pointer transition-all"
          style={{ background: "#1e293b", border: "2px solid #8b5cf6" }}
          onClick={() => onPurchase("one_time")}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white">One-time download</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
            >
              No account needed
            </span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            $5
            <span className="text-sm font-normal" style={{ color: "#64748b" }}> one-time</span>
          </p>
          <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>
            Single optimised resume · Pay and download instantly
          </p>

          {/* Email for receipt (optional but shown before Stripe) */}
          <input
            type="email"
            value={email}
            onChange={(e) => { e.stopPropagation(); onEmailChange(e.target.value); }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Email for receipt (optional)"
            className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 mb-3 transition-all"
            style={{ background: "rgba(15,23,42,0.6)", border: "1px solid #334155" }}
          />

          <button
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            Download for $5 →
          </button>
        </div>

        {/* ── Pro: account required ── */}
        <div
          className="rounded-2xl p-5 cursor-pointer transition-all"
          style={{ background: "rgba(15,23,42,0.5)", border: "1px solid #334155" }}
          onClick={() => onPurchase("pro")}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>ResuFit Pro</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}
            >
              Best value
            </span>
          </div>
          <p className="text-xl font-bold mb-1" style={{ color: "#94a3b8" }}>
            $15
            <span className="text-sm font-normal" style={{ color: "#475569" }}>/month</span>
          </p>
          <p className="text-xs mb-3" style={{ color: "#475569" }}>
            30 optimisations/month · Dashboard · Cancel anytime
          </p>
          <button
            className="w-full py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "transparent",
              border: "1px solid #334155",
              color: "#94a3b8",
            }}
          >
            Create account &amp; get Pro →
          </button>
        </div>

        {/* Marketing opt-in */}
        <label className="flex items-start gap-2 cursor-pointer mt-4 mb-3">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => onMarketingOptInChange(e.target.checked)}
            className="mt-0.5 flex-shrink-0"
            style={{ accentColor: "#8b5cf6" }}
          />
          <span className="text-[11px]" style={{ color: "#475569" }}>
            Send me occasional job search tips from ResuFit (optional)
          </span>
        </label>

        <p className="text-center text-[11px]" style={{ color: "#334155" }}>
          Secured by Stripe · Apple Pay &amp; Google Pay accepted
        </p>
      </div>
    </main>
  );
}
