import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t mt-auto"
      style={{ borderColor: "#f3f4f6", background: "#ffffff" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-8">
          <div className="flex flex-col gap-3">
            <Logo size="sm" linkToHome />
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: "#9ca3af" }}>
              AI-powered resume optimiser that helps you get past
              ATS filters and land more interviews.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#d1d5db" }}>
                Product
              </p>
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/sign-in">Sign in</FooterLink>
              <FooterLink href="/sign-up">Get started</FooterLink>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#d1d5db" }}>
                Legal
              </p>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#d1d5db" }}>
                Support
              </p>
              <FooterLink href="mailto:hello@resufit.co">Contact</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-6 text-xs"
          style={{ borderTop: "1px solid #f3f4f6", color: "#d1d5db" }}
        >
          <p>© {year} ResuFit. All rights reserved.</p>
          <p>
            Registered in England &amp; Wales ·{" "}
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            {" "}·{" "}
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("mailto:");
  const cls = "text-xs transition-colors text-gray-400 hover:text-gray-600";
  return isExternal ? (
    <a href={href} className={cls}>{children}</a>
  ) : (
    <Link href={href} className={cls}>{children}</Link>
  );
}
