import type { Metadata } from "next";
import { MapWrapper } from "@/components/MapWrapper";

export const metadata: Metadata = {
  title: "SaaS Startup Map — Browse by Location",
  description:
    "Explore SaaS startups on an interactive map. Find startups by city, filter by category and funding stage.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com"}/map`,
  },
};

export default function MapPage() {
  return <MapWrapper />;
}
