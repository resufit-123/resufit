import type { Metadata } from "next";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ResuFit terms and conditions of use.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f172a" }}>
      <header className="w-full max-w-3xl mx-auto px-6 py-8">
        <Logo size="sm" />
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm mb-10" style={{ color: "#64748b" }}>
          Last updated: April 2026
        </p>

        <LegalSection title="1. Acceptance of terms">
          By using ResuFit you agree to these terms. If you do not agree, please do not use the service.
        </LegalSection>

        <LegalSection title="2. The service">
          ResuFit provides AI-assisted resume optimisation. We do not guarantee that using our service will result in job interviews or offers. Results depend on many factors outside our control.
        </LegalSection>

        <LegalSection title="3. Your account">
          You are responsible for keeping your account credentials secure. You must be at least 18 years old to create an account. You may not use the service for any unlawful purpose.
        </LegalSection>

        <LegalSection title="4. Payments and refunds">
          All payments are processed securely by Stripe. One-time purchases are non-refundable once the optimised resume has been generated and delivered. Monthly and annual subscriptions may be cancelled at any time; you retain access until the end of the current billing period. If you experience a technical failure that prevents delivery of your resume, contact us at{" "}
          <a href="mailto:hello@resufit.co" className="underline" style={{ color: "#a78bfa" }}>
            hello@resufit.co
          </a>{" "}
          and we will issue a credit or refund at our discretion.
        </LegalSection>

        <LegalSection title="5. Acceptable use">
          You may not use ResuFit to upload content that is illegal, offensive, or infringes the rights of others. We reserve the right to suspend accounts that violate this policy.
        </LegalSection>

        <LegalSection title="6. Intellectual property">
          The optimised resume output generated for you is yours to use freely. ResuFit retains ownership of the platform, branding, and underlying AI prompts.
        </LegalSection>

        <LegalSection title="7. Limitation of liability">
          To the fullest extent permitted by law, ResuFit is not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the 12 months preceding any claim.
        </LegalSection>

        <LegalSection title="8. Governing law">
          These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </LegalSection>

        <LegalSection title="9. Changes">
          We may update these terms from time to time. Continued use of the service after changes constitutes acceptance.
        </LegalSection>

        <LegalSection title="10. Contact">
          Questions?{" "}
          <a href="mailto:hello@resufit.co" className="underline" style={{ color: "#a78bfa" }}>
            hello@resufit.co
          </a>
          . See also our{" "}
          <Link href="/privacy" className="underline" style={{ color: "#a78bfa" }}>
            Privacy Policy
          </Link>
          .
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
