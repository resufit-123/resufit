import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t mt-auto"
      style={{ borderColor: "#1e293b", background: "#080f1a" }}
    >
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Logo size="sm" linkToHome />
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: "#475569" }}>
              AI-powered resume optimiser that helps you get past
              ATS filters and land more interviews.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#334155" }}>
                Product
              </p>
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/sign-in">Sign in</FooterLink>
              <FooterLink href="/sign-up">Get started</FooterLink>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#334155" }}>
                Legal
              </p>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#334155" }}>
                Support
              </p>
              <FooterLink href="mailto:hello@resufit.co">Contact</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-6 text-xs"
          style={{ borderTop: "1px solid #1e293b", color: "#334155" }}
        >
          <p>© {year} ResuFit. All rights reserved.</p>
          <p>
            Registered in England &amp; Wales ·{" "}
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("mailto:");
  const cls = "text-xs transition-colors text-slate-500 hover:text-slate-400";
  return isExternal ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
