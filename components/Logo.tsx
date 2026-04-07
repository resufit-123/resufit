import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  linkToHome?: boolean;
}

export default function Logo({ size = "md", linkToHome = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-lg", gap: "gap-2" },
    md: { icon: 36, text: "text-xl", gap: "gap-2.5" },
    lg: { icon: 44, text: "text-2xl", gap: "gap-3" },
  };

  const s = sizes[size];

  const mark = (
    <div className={`flex items-center ${s.gap}`}>
      {/* Icon mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background pill */}
        <rect width="36" height="36" rx="10" fill="url(#logo-grad)" />

        {/* Document lines */}
        <rect x="10" y="10" width="10" height="1.8" rx="0.9" fill="white" fillOpacity="0.55" />
        <rect x="10" y="14" width="16" height="1.8" rx="0.9" fill="white" fillOpacity="0.4" />
        <rect x="10" y="18" width="13" height="1.8" rx="0.9" fill="white" fillOpacity="0.4" />

        {/* Spark / checkmark accent */}
        <circle cx="23" cy="24" r="6" fill="white" fillOpacity="0.12" />
        <polyline
          points="19.5,24 22,26.5 27,21"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      <span className={`${s.text} font-semibold tracking-tight`}>
        <span className="text-white">Resu</span>
        <span style={{ color: "#a78bfa" }}>Fit</span>
      </span>
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg">
        {mark}
      </Link>
    );
  }

  return mark;
}
