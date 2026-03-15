import { Suspense } from "react";
import { getAllStartups } from "@/lib/db";
import { HomePageClient } from "@/components/HomePageClient";

/** Revalidate every 60 seconds so new startups appear quickly */
export const revalidate = 60;

export default async function Home() {
  // Server-side fetch: Google sees real HTML content
  const startups = await getAllStartups();

  return (
    <Suspense>
      <HomePageClient initialStartups={startups} />
    </Suspense>
  );
}
