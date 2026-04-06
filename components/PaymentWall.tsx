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
            <p>ATS score improved from 34% → 91%</p>
            <p>12 keywords added · 3 format issues fixed</p>
          </div>
          <p className="text-sm font-semibold text-white">
            Your optimized resume is ready
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            Download to see your results
          </p>
        </div>

        {/* Email capture (GDPR compliant) */}
        <div className="space-y-2 mb-5">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Email address — we'll send your resume here"
            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => onMarketingOptInChange(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
              style={{ accentColor: "#8b5cf6" }}
            />
            <span className="text-[11px] text-[#475569]">
              Send me occasional job search tips from ResuFit (optional)
            </span>
          </label>
        </div>

        {/* Pricing options — Pro anchored first */}
        <div className="space-y-3">
          {/* Pro Plan */}
          <div
            className="rounded-2xl p-5 cursor-pointer hover:border-violet-500 transition-all"
            style={{ background: "#1e293b", border: "2px solid #8b5cf6" }}
            onClick={() => onPurchase("pro")}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">ResuFit Pro</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}
              >
                Most popular
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              $15
              <span className="text-sm font-normal text-[#64748b]">/month</span>
            </p>
            <p className="text-xs text-[#94a3b8]">30 optimizations/month · Cancel anytime</p>
            <button
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              Get Pro →
            </button>
          </div>

          {/* One-time */}
          <div
            className="rounded-2xl p-5 cursor-pointer hover:border-slate-500 transition-all"
            style={{ background: "rgba(15,23,42,0.5)", border: "1px solid #334155" }}
            onClick={() => onPurchase("one_time")}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[#94a3b8]">One-time download</span>
            </div>
            <p className="text-xl font-bold text-[#94a3b8] mb-1">
              $5
              <span className="text-sm font-normal text-[#475569]"> one-time</span>
            </p>
            <p className="text-xs text-[#475569]">Single optimized resume · No subscription</p>
            <button
              className="mt-3 w-full py-2 rounded-xl text-sm font-medium text-[#94a3b8] transition-all"
              style={{ background: "transparent", border: "1px solid #334155" }}
            >
              Download for $5
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#334155] mt-4">
          Secured by Stripe · Apple Pay & Google Pay accepted
        </p>
      </div>
    </main>
  );
}
