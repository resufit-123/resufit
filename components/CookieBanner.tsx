"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_KEY = "rf_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage blocked (private mode, etc.) — don't show
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_KEY, "accepted");
    } catch {}
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(COOKIE_KEY, "declined");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
      role="region"
      aria-label="Cookie consent"
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-2xl"
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
        }}
      >
        {/* Text */}
        <div className="flex-1 text-sm" style={{ color: "#94a3b8" }}>
          <span className="font-semibold text-white">We use cookies.</span>{" "}
          ResuFit uses essential cookies to keep you signed in and process
          payments securely. We don&apos;t use advertising or tracking
          cookies.{" "}
          <Link
            href="/cookies"
            className="underline underline-offset-2 transition-colors"
            style={{ color: "#a78bfa" }}
          >
            Cookie Policy
          </Link>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-xs px-4 py-2 rounded-lg transition-colors"
            style={{
              color: "#64748b",
              background: "transparent",
              border: "1px solid #334155",
            }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-xs px-5 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              color: "#fff",
              border: "none",
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
