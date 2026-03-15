import type { Metadata } from "next";
import { AddStartupClient } from "@/components/AddStartupClient";

export const metadata: Metadata = {
  title: "List Your SaaS Startup — Free Forever",
  description:
    "Add your SaaS startup to the SaaS Stars directory for free. Get discovered by customers, investors, and partners. Earn a permanent SEO backlink.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com"}/add`,
  },
};

export default function AddPage() {
  return <AddStartupClient />;
}
