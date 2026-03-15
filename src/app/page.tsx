import { Suspense } from "react";
import { getAllStartups } from "@/lib/db";
import { HomePageClient } from "@/components/HomePageClient";

export default async function Home() {
  // Server-side fetch: Google sees real HTML content
  const startups = await getAllStartups();

  return (
    <Suspense>
      <HomePageClient initialStartups={startups} />
    </Suspense>
  );
}
