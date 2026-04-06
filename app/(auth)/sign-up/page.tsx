"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#10b981] text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-sm text-[#94a3b8]">
            We sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click it to activate your account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-[#94a3b8]">
            Free to start — pay only when you download
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
            style={{
              background: loading ? "#334155" : "linear-gradient(135deg, #7c3aed, #6366f1)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p className="text-center text-xs text-[#475569] mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#a78bfa] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
