import type { Metadata } from "next";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How ResuFit uses cookies and similar technologies.",
};

export default function CookiePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f172a" }}>
      <header className="w-full max-w-3xl mx-auto px-6 py-8">
        <Logo size="sm" />
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-bold text-white mb-2">Cookie Policy</h1>
        <p className="text-sm mb-10" style={{ color: "#64748b" }}>
          Last updated: April 2026
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">What are cookies?</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Cookies are small text files stored on your device when you visit a website.
            They help the site remember your preferences and keep you signed in.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Cookies we use</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid #1e293b" }}>
                  <th className="text-left py-3 pr-4 font-semibold text-white">Cookie</th>
                  <th className="text-left py-3 pr-4 font-semibold text-white">Purpose</th>
                  <th className="text-left py-3 font-semibold text-white">Type</th>
                </tr>
              </thead>
              <tbody style={{ color: "#94a3b8" }}>
                <CookieRow name="sb-*" purpose="Supabase authentication — keeps you signed in securely." type="Essential" />
                <CookieRow name="rf_cookie_consent" purpose="Remembers your cookie preference so we don't ask again." type="Essential" />
                <CookieRow name="Stripe cookies" purpose="Fraud prevention and secure payment processing." type="Essential" />
              </tbody>
            </table>
          </div>
          <p className="text-sm mt-4" style={{ color: "#64748b" }}>
            We do <strong className="text-white">not</strong> use advertising, analytics, or tracking cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Managing cookies</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Because we only use essential cookies, disabling them may prevent ResuFit from functioning
            correctly (e.g. you would be signed out on every visit). You can manage cookies through your
            browser settings, but we recommend leaving essential cookies enabled.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Questions about cookies? Email us at{" "}
            <a href="mailto:hello@resufit.co" className="underline" style={{ color: "#a78bfa" }}>
              hello@resufit.co
            </a>
            . See also our{" "}
            <Link href="/privacy" className="underline" style={{ color: "#a78bfa" }}>
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CookieRow({ name, purpose, type }: { name: string; purpose: string; type: string }) {
  return (
    <tr style={{ borderBottom: "1px solid #1e293b" }}>
      <td className="py-3 pr-4 font-mono text-xs" style={{ color: "#a78bfa" }}>{name}</td>
      <td className="py-3 pr-4">{purpose}</td>
      <td className="py-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
        >
          {type}
        </span>
      </td>
    </tr>
  );
}
