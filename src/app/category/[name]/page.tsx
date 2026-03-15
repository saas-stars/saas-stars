import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStartupsByCategory, categoryFromSlug } from "@/lib/db";
import { CATEGORIES } from "@/lib/types";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { CategoryPageClient } from "@/components/CategoryPageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com";

/** Revalidate every 60 seconds so new startups appear quickly */
export const revalidate = 60;

function catSlug(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    name: catSlug(cat),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const category = categoryFromSlug(name);
  if (!category) return { title: "Category Not Found" };

  const title = `${category} SaaS Startups — SaaS Stars Directory`;
  const description = `Browse the best ${category} SaaS startups. Compare tools, read news, and discover the latest ${category.toLowerCase()} software.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/category/${name}` },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `${SITE_URL}/category/${name}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const category = categoryFromSlug(name);
  if (!category) notFound();

  const startups = await getStartupsByCategory(category);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: `${category} SaaS`, url: `${SITE_URL}/category/${name}` },
        ]}
      />
      <CategoryPageClient category={category} initialStartups={startups} />
    </>
  );
}
