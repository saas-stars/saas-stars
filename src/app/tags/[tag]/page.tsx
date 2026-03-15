import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStartupsByTag, getAllTags } from "@/lib/db";
import { StartupCard } from "@/components/StartupCard";
import { ArrowLeft, Tag } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com";

export const revalidate = 60;
export const dynamicParams = true;

function tagSlug(tag: string) {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: tagSlug(t) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const displayTag = tag.replace(/-/g, " ");

  const title = `${displayTag} SaaS Tools — SaaS Stars`;
  const description = `Discover bootstrapped SaaS startups tagged with "${displayTag}". Compare tools, read founder news, and find your next favorite ${displayTag} product.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/tags/${tag}` },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `${SITE_URL}/tags/${tag}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag: tagParam } = await params;

  // Find the original tag label by matching slugs
  const allTags = await getAllTags();
  const matchedTag = allTags.find((t) => tagSlug(t) === tagParam);

  if (!matchedTag) {
    // Still try to find startups even without exact match
    const startups = await getStartupsByTag(tagParam.replace(/-/g, " "));
    if (startups.length === 0) notFound();

    return <TagPageContent tag={tagParam.replace(/-/g, " ")} startups={startups} allTags={allTags} />;
  }

  const startups = await getStartupsByTag(matchedTag);

  return <TagPageContent tag={matchedTag} startups={startups} allTags={allTags} />;
}

function TagPageContent({ tag, startups, allTags }: { tag: string; startups: Awaited<ReturnType<typeof getStartupsByTag>>; allTags: string[] }) {
  return (
    <div>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900">{tag}</h1>
        </div>
        <p className="text-gray-500 text-base">
          {startups.length} startup{startups.length !== 1 ? "s" : ""} tagged with &ldquo;{tag}&rdquo;
        </p>
      </header>

      {startups.length === 0 ? (
        <p className="text-sm text-gray-400">No startups found with this tag.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {startups.map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      )}

      {/* Related tags */}
      {allTags.length > 1 && (
        <section className="border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Other Tags</h2>
          <div className="flex flex-wrap gap-2">
            {allTags
              .filter((t) => t.toLowerCase() !== tag.toLowerCase())
              .slice(0, 20)
              .map((t) => (
                <Link
                  key={t}
                  href={`/tags/${tagSlug(t)}`}
                  className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1 transition-colors"
                >
                  {t}
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
