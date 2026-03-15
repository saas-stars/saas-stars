import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStartups, getStartupBySlug } from "@/lib/db";
import { StartupJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { StartupProfileClient } from "@/components/StartupProfileClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com";

/** Allow pages for slugs not generated at build time (new startups) */
export const dynamicParams = true;

/** Revalidate pages every 60 seconds so new data appears quickly */
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

/** Generate static pages for all startups at build time */
export async function generateStaticParams() {
  const startups = await getAllStartups();
  return startups.map((s) => ({ slug: s.slug }));
}

/** Dynamic metadata per startup for SEO */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);
  if (!startup) return { title: "Startup Not Found" };

  const title = `${startup.companyName} — ${startup.category} SaaS Startup`;
  const description =
    startup.shortDescription ||
    `${startup.companyName} is a ${startup.category} SaaS startup based in ${startup.hqLocation}. Founded in ${startup.yearFounded}, currently at ${startup.fundraisingStage} stage.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/startups/${startup.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/startups/${startup.slug}`,
    },
  };
}

export default async function StartupPage({ params }: Props) {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);
  if (!startup) notFound();

  return (
    <>
      <StartupJsonLd startup={startup} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: startup.category, url: `${SITE_URL}/category/${startup.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
          { name: startup.companyName, url: `${SITE_URL}/startups/${startup.slug}` },
        ]}
      />

      {/* Server-rendered HTML that Google can crawl */}
      <article className="max-w-3xl mx-auto">
        <StartupProfileClient startup={startup} />
      </article>
    </>
  );
}
