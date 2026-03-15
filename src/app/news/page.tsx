import type { Metadata } from "next";
import { getAllStartups } from "@/lib/db";
import { NewsFeedClient } from "@/components/NewsFeedClient";

export const metadata: Metadata = {
  title: "SaaS Startup News — Latest Product Launches, Funding & Updates",
  description:
    "Stay up to date with the latest SaaS startup news — product launches, funding rounds, partnerships, and more from the SaaS Stars directory.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com"}/news`,
  },
};

export default async function NewsPage() {
  const startups = await getAllStartups();

  // Pre-render news HTML for SEO
  const allNews = startups
    .flatMap((s) =>
      s.news.map((n) => ({
        ...n,
        startupSlug: s.slug,
        companyName: s.companyName,
        category: s.category,
      }))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return <NewsFeedClient news={allNews} />;
}
