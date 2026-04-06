import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Optimization, Subscription } from "@/types";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirectTo=/dashboard");

  // Fetch recent optimizations and active subscription in parallel
  const [{ data: optimizations }, { data: subscriptions }] = await Promise.all([
    supabase
      .from("optimizations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const activeSubscription = (subscriptions as Subscription[] | null)?.[0] ?? null;
  const recentOptimizations = (optimizations as Optimization[] | null) ?? [];

  const isPro = activeSubscription?.plan === "pro" || activeSubscription?.plan === "annual";
  const usedCount = activeSubscription?.optimizations_used_this_period ?? 0;
  const limitCount = activeSubscription?.optimizations_limit ?? 0;
  const usagePct = limitCount > 0 ? (usedCount / limitCount) * 100 : 0;

  const planLabel =
    activeSubscription?.plan === "annual"
      ? "Annual Plan"
      : activeSubscription?.plan === "pro"
      ? "Pro Plan"
      : activeSubscription?.plan === "one_time"
      ? "One-time purchase"
      : "No active plan";

  const resetDate = activeSubscription?.current_period_end
    ? new Date(activeSubscription.current_period_end).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <main className="min-h-screen bg-[#0f172a] px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-[#64748b] mt-0.5">{user.email}</p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            New optimization →
          </Link>
        </div>

        {/* Usage meter (Pro/Annual only) */}
        {isPro && activeSubscription && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-white">{planLabel}</p>
                <p className="text-xs text-[#64748b] mt-0.5">this month</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#a78bfa]">{usedCount}</span>
                <span className="text-sm text-[#475569]"> / {limitCount}</span>
                <p className="text-xs text-[#64748b]">
                  resets {resetDate ?? "–"}
                </p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(usagePct, 100)}%`,
                  background: usagePct > 80
                    ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : "linear-gradient(90deg, #8b5cf6, #6366f1)",
                }}
              />
            </div>
            {usagePct > 80 && (
              <p className="text-xs text-amber-400 mt-2">
                You&apos;re approaching your monthly limit.{" "}
                <Link href="/?upgrade=annual" className="underline">
                  Upgrade to Annual for 50/month.
                </Link>
              </p>
            )}
          </div>
        )}

        {/* No plan CTA */}
        {!activeSubscription && (
          <div
            className="border rounded-2xl p-5"
            style={{ border: "1px solid #334155", background: "#1e293b" }}
          >
            <p className="text-sm text-[#94a3b8] mb-3">
              You don&apos;t have an active plan. Optimize a resume to get started.
            </p>
            <Link
              href="/"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl inline-block"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              Start optimizing →
            </Link>
          </div>
        )}

        {/* Recent optimizations */}
        <div>
          <h2 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
            Recent optimizations
          </h2>

          {recentOptimizations.length === 0 ? (
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 text-center">
              <p className="text-sm text-[#475569]">
                No optimizations yet. Upload your resume to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOptimizations.map((opt) => (
                <div
                  key={opt.id}
                  className="bg-[#1e293b] border border-[#334155] rounded-xl px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {opt.job_title ?? "Resume optimization"}
                      {opt.company && (
                        <span className="text-[#64748b]"> at {opt.company}</span>
                      )}
                    </p>
                    <p className="text-xs text-[#475569] mt-0.5">
                      {new Date(opt.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[#64748b]">ATS score</p>
                      <p className="text-sm font-semibold">
                        <span className="text-[#ef4444]">{opt.score_before}%</span>
                        <span className="text-[#64748b] mx-1">→</span>
                        <span className="text-[#10b981]">{opt.score_after}%</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
