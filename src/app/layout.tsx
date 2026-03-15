import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WebsiteJsonLd } from "@/components/JsonLd";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SaaS Stars — The Free Directory for SaaS Startups",
    template: "%s | SaaS Stars",
  },
  description:
    "Discover the best SaaS startups. Get listed for free — drive trials, earn SEO backlinks, and share news with customers, investors, and partners.",
  keywords: [
    "SaaS directory",
    "SaaS startups",
    "B2B SaaS",
    "SaaS tools",
    "startup directory",
    "AI SaaS",
    "SaaS companies",
    "SaaS software",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "SaaS Stars",
    title: "SaaS Stars — The Free Directory for SaaS Startups",
    description:
      "Discover the best SaaS startups. Get listed for free — drive trials, earn SEO backlinks, and share news.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@SaaS_Stars",
    title: "SaaS Stars — The Free Directory for SaaS Startups",
    description:
      "Discover the best SaaS startups. Get listed for free — drive trials, earn SEO backlinks, and share news.",
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
  alternates: {
    canonical: SITE_URL,
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
        <WebsiteJsonLd />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
