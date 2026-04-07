"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message
      );
      setLoading(false);
    } else {
      window.location.href = redirectTo;
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
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
          placeholder="Your password"
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
        {loading ? "Signing in..." : "Sign in →"}
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Sign in to ResuFit</h1>
          <p className="text-sm text-[#94a3b8]">Access your optimizations and Pro allowance</p>
        </div>

        <Suspense fallback={<div className="text-[#475569] text-sm text-center">Loading...</div>}>
          <SignInForm />
        </Suspense>

        <p className="text-center text-xs text-[#475569] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[#a78bfa] hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}
