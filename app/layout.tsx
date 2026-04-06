import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ResuFit — Get Your Tailored, ATS-Ready Resume in Seconds",
    template: "%s | ResuFit",
  },
  description:
    "Upload your resume, paste a job description, and get a fully optimized, ATS-compatible resume in under 10 seconds. Built to get past hiring software filters.",
  keywords: [
    "ATS resume optimizer",
    "resume builder",
    "job application",
    "applicant tracking system",
    "resume optimization",
    "CV builder",
    "job search",
  ],
  authors: [{ name: "ResuFit" }],
  creator: "ResuFit",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://resufit.co"),
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "ResuFit",
    title: "ResuFit — Get Your Tailored, ATS-Ready Resume in Seconds",
    description:
      "Hiring software filters out most applicants before a human reads their resume. ResuFit makes sure yours gets through.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResuFit — ATS Resume Optimizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResuFit — ATS Resume Optimizer",
    description: "Get your focused, 100% tailored resume in seconds.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Schema.org JSON-LD — SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ResuFit",
              applicationCategory: "BusinessApplication",
              offers: [
                {
                  "@type": "Offer",
                  name: "One-time Resume Optimization",
                  price: "5.00",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "ResuFit Pro",
                  price: "15.00",
                  priceCurrency: "USD",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "15.00",
                    priceCurrency: "USD",
                    billingDuration: "P1M",
                  },
                },
              ],
              description:
                "AI-powered ATS resume optimizer. Upload your resume and a job description, get a fully tailored resume in seconds.",
              url: "https://resufit.co",
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
