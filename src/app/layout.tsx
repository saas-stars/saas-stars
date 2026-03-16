import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WebsiteJsonLd } from "@/components/JsonLd";
import "./globals.css";

const GA_ID = "G-K0CNDVKXFZ";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SaaS Stars — The GTM Platform for Bootstrapped SaaS",
    template: "%s | SaaS Stars",
  },
  description:
    "The GTM platform for bootstrapped SaaS. Get discovered, generate leads, and build SEO authority — without VC money or a marketing budget.",
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
    title: "SaaS Stars — The GTM Platform for Bootstrapped SaaS",
    description:
      "Get discovered, generate leads, and build SEO authority — without VC money or a marketing budget.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@SaaS_Stars",
    title: "SaaS Stars — The GTM Platform for Bootstrapped SaaS",
    description:
      "Get discovered, generate leads, and build SEO authority — without VC money or a marketing budget.",
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
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
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
