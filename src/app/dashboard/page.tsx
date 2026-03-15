import type { Metadata } from "next";
import { getAllStartups } from "@/lib/db";
import { DashboardClient } from "@/components/DashboardClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "SaaS Ecosystem Dashboard — Stats & Insights",
  description:
    "Explore the SaaS Stars ecosystem — category breakdowns, funding stages, top locations, and trending startups.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com"}/dashboard`,
  },
};

export default async function DashboardPage() {
  const startups = await getAllStartups();
  return <DashboardClient initialStartups={startups} />;
}
