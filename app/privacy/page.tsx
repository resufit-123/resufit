import type { Metadata } from "next";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ResuFit collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f172a" }}>
      <header className="w-full max-w-3xl mx-auto px-6 py-8">
        <Logo size="sm" />
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "#64748b" }}>
          Last updated: April 2026
        </p>

        <LegalSection title="1. Who we are">
          ResuFit (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a
          software service that helps job seekers optimise their resumes for
          applicant tracking systems. Our website is{" "}
          <a href="https://resufit.co" className="underline" style={{ color: "#a78bfa" }}>
            resufit.co
          </a>
          . You can contact us at{" "}
          <a href="mailto:hello@resufit.co" className="underline" style={{ color: "#a78bfa" }}>
            hello@resufit.co
          </a>
          .
        </LegalSection>

        <LegalSection title="2. Data we collect">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-white">Account data:</strong> your email address and password (hashed) when you create an account.</li>
            <li><strong className="text-white">Resume content:</strong> the text extracted from your uploaded resume and the job description you paste. This is used solely to generate your optimised resume and is not retained after your session unless you save a result.</li>
            <li><strong className="text-white">Payment data:</strong> processed by Stripe. We never see or store your card details.</li>
            <li><strong className="text-white">Usage data:</strong> number of optimisations used, timestamps, and the plan you are on.</li>
            <li><strong className="text-white">Technical data:</strong> IP address, browser type, and approximate country (used for currency detection and rate limiting).</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. How we use your data">
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve the ResuFit service.</li>
            <li>To process payments and enforce plan limits.</li>
            <li>To send transactional emails (e.g. receipts, password resets).</li>
            <li>To comply with legal obligations.</li>
          </ul>
          We do <strong className="text-white">not</strong> sell your data to third parties or use it for advertising.
        </LegalSection>

        <LegalSection title="4. Legal basis (GDPR)">
          We process your data under the following legal bases:
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong className="text-white">Contract performance</strong> — to deliver the service you purchase.</li>
            <li><strong className="text-white">Legitimate interests</strong> — security, fraud prevention, and service improvement.</li>
            <li><strong className="text-white">Legal obligation</strong> — tax and financial record-keeping.</li>
          </ul>
        </LegalSection>

        <LegalSection title="5. Third-party processors">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-white">Supabase</strong> — database and authentication (EU data residency available).</li>
            <li><strong className="text-white">Stripe</strong> — payment processing.</li>
            <li><strong className="text-white">Anthropic</strong> — AI model provider. Resume text is sent to Anthropic&apos;s API to generate optimisations. Anthropic does not use your data to train models by default.</li>
            <li><strong className="text-white">Resend</strong> — transactional email delivery.</li>
            <li><strong className="text-white">Vercel</strong> — hosting and edge functions.</li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Data retention">
          Account data is retained until you delete your account. Optimisation records are retained for 12 months to support your dashboard history. You may request earlier deletion at any time.
        </LegalSection>

        <LegalSection title="7. Your rights">
          Under UK GDPR and EU GDPR you have the right to access, correct, export, or delete your personal data. To exercise any of these rights, email{" "}
          <a href="mailto:hello@resufit.co" className="underline" style={{ color: "#a78bfa" }}>
            hello@resufit.co
          </a>
          . We will respond within 30 days.
        </LegalSection>

        <LegalSection title="8. Cookies">
          We use only essential cookies. See our{" "}
          <Link href="/cookies" className="underline" style={{ color: "#a78bfa" }}>
            Cookie Policy
          </Link>{" "}
          for details.
        </LegalSection>

        <LegalSection title="9. Changes to this policy">
          We may update this policy from time to time. Significant changes will be notified by email or a notice on the site.
        </LegalSection>
      </main>

      <Footer />
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
        {children}
      </div>
    </section>
  );
}
