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
            You&rsquo;ll get a professionally analyzed, job-matched, resume that&rsquo;s ready-to-send.
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

        {/* Pro — genuine option with proper visual weight */}
        <div
          className="rounded-2xl mb-4 cursor-pointer overflow-hidden"
          style={{
            background: "#ffffff",
            border: "2px solid #c7d2fe",
            boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onClick={() => onPurchase("pro")}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#818cf8";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.18)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#c7d2fe";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(99,102,241,0.08)";
          }}
        >
          {/* Pro header */}
          <div style={{
            background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
            padding: "11px 18px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "1px solid #e0e7ff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#3730a3" }}>ResuFit Pro</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
              }}>
                Best value
              </span>
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>$15</span>
              <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>/month</span>
            </div>
          </div>

          {/* Pro benefits */}
          <div style={{ padding: "12px 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 10px", marginBottom: 12 }}>
              {[
                "Unlimited optimisations",
                "Cover letter writer",
                "LinkedIn optimiser",
                "Priority processing",
                "Job tracker dashboard",
                "Cancel anytime",
              ].map((b) => (
                <span key={b} style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#6366f1", fontWeight: 800, fontSize: 11 }}>✓</span> {b}
                </span>
              ))}
            </div>
            <div style={{
              width: "100%", padding: "9px 0", borderRadius: 9, textAlign: "center",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", fontSize: 12, fontWeight: 700,
              boxShadow: "0 2px 10px rgba(99,102,241,0.25)",
            }}>
              Get Pro — $15/month →
            </div>
          </div>
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
