"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Startup } from "@/lib/types";
import { StartupCard, getActivityScore } from "./StartupCard";
import { CategoryFilter } from "./CategoryFilter";
import { useAuth } from "@/hooks/useAuth";
import { useStartups } from "@/hooks/useStore";
import {
  Clock,
  Newspaper,
  Link as LinkIcon,
  TrendingUp,
  Search,
  Shield,
  Star,
  Zap,
  X,
  Flame,
  Tag,
} from "lucide-react";

const BENEFITS = [
  { icon: Search, title: "Get Discovered", desc: "Put your startup in front of founders, buyers, investors, and partners actively browsing the directory." },
  { icon: TrendingUp, title: "Drive Free Trials & Demos", desc: "Link directly to your free trial or demo page. Every profile view is a potential conversion." },
  { icon: LinkIcon, title: "SEO Backlink", desc: "Your website link on SaaS Stars is a permanent dofollow backlink that boosts your domain authority." },
  { icon: Newspaper, title: "Post News & Updates", desc: "Share product launches, webinars, blog posts, events, or anything else — and stay top of mind." },
  { icon: Shield, title: "Build Credibility", desc: "Being listed in a curated directory adds social proof and legitimacy, especially for early-stage startups." },
];

interface Props {
  initialStartups: Startup[];
}

/** Collect all unique tags across startups */
function collectTags(startups: Startup[]): { tag: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const s of startups) {
    if (s.tags) {
      for (const t of s.tags) {
        map[t] = (map[t] || 0) + 1;
      }
    }
  }
  return Object.entries(map)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

function tagSlug(tag: string) {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function HomePageClient({ initialStartups }: Props) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [category, setCategory] = useState<string | null>(null);
  const [mobileSearch, setMobileSearch] = useState("");
  const { user } = useAuth();
  const storeApi = useStartups();
  const myListing = user ? storeApi.getAll().find((s) => s.ownerId === user.id) : null;

  const activeQuery = queryParam || mobileSearch;

  // Local filtering on initial data
  const searchResults = activeQuery.trim()
    ? initialStartups.filter(
        (s) =>
          s.companyName.toLowerCase().includes(activeQuery.toLowerCase()) ||
          s.shortDescription?.toLowerCase().includes(activeQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(activeQuery.toLowerCase()) ||
          s.hqLocation.toLowerCase().includes(activeQuery.toLowerCase())
      )
    : null;

  const counts: Record<string, number> = {};
  for (const s of initialStartups) counts[s.category] = (counts[s.category] || 0) + 1;

  const filtered = category
    ? initialStartups.filter((s) => s.category === category)
    : initialStartups;

  const recentlyAdded = [...filtered]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 12);

  // Most active startups — sorted by activity score
  const mostActive = [...filtered]
    .map((s) => ({ startup: s, score: getActivityScore(s) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.startup);

  // Flatten all news items with their parent startup info
  const allNews = filtered
    .flatMap((s) => s.news.map((n) => ({ ...n, companyName: s.companyName, slug: s.slug, category: s.category })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);

  // Collect tags for the tag cloud
  const allTags = collectTags(filtered);

  // Live stats
  const totalStartups = initialStartups.length;
  const categoriesUsed = Object.keys(counts).length;
  const totalNews = initialStartups.reduce((sum, s) => sum + s.news.length, 0);

  return (
    <div>
      {/* Hero */}
      <section className="text-center pt-6 pb-10 mb-8 border-b border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          The GTM platform for
          <br className="hidden sm:block" />
          <span className="text-emerald-500"> bootstrapped SaaS</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto mb-4">
          Get discovered, generate leads, and build SEO authority — without VC money or a marketing budget.
        </p>

        {/* Live stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-6">
          <span><strong className="text-gray-700">{totalStartups}</strong> startup{totalStartups !== 1 ? "s" : ""}</span>
          <span className="text-gray-200">|</span>
          <span><strong className="text-gray-700">{categoriesUsed}</strong> categor{categoriesUsed !== 1 ? "ies" : "y"}</span>
          <span className="text-gray-200">|</span>
          <span><strong className="text-gray-700">{totalNews}</strong> news update{totalNews !== 1 ? "s" : ""}</span>
        </div>

        <div className="max-w-lg mx-auto mb-6 relative sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search startups…"
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-shadow shadow-sm"
          />
          {mobileSearch && (
            <button onClick={() => setMobileSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {myListing ? (
          <Link
            href={`/startups/${myListing.slug}`}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Star className="w-4 h-4" />
            Go to {myListing.companyName}
          </Link>
        ) : (
          <Link
            href="/add"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4" />
            List Your Startup — It&apos;s Free
          </Link>
        )}
      </section>

      {searchResults !== null ? (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider">
              <Search className="w-4 h-4 text-gray-400" />
              Search Results
              <span className="font-normal text-gray-400 normal-case tracking-normal">
                — {searchResults.length} match{searchResults.length !== 1 ? "es" : ""}
              </span>
            </h2>
          </div>
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400">No startups match &ldquo;{activeQuery}&rdquo;. Try a different search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((s) => (
                <StartupCard key={s.id} startup={s} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="mb-8">
            <CategoryFilter selected={category} onSelect={setCategory} counts={counts} />
          </div>

          {/* Most Active */}
          {mostActive.length > 0 && (
            <section className="mb-10">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                <Flame className="w-4 h-4 text-orange-500" />
                Most Active
                {category && <span className="font-normal text-gray-400 normal-case tracking-normal">in {category}</span>}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mostActive.map((s) => (
                  <StartupCard key={s.id} startup={s} />
                ))}
              </div>
            </section>
          )}

          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              <Clock className="w-4 h-4 text-gray-400" />
              Recently Added
              {category && <span className="font-normal text-gray-400 normal-case tracking-normal">in {category}</span>}
            </h2>
            {recentlyAdded.length === 0 ? (
              <p className="text-sm text-gray-400">No startups found{category ? ` in ${category}` : ""}.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentlyAdded.map((s) => (
                  <StartupCard key={s.id} startup={s} />
                ))}
              </div>
            )}
          </section>

          <section className="mb-14">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              <Newspaper className="w-4 h-4 text-gray-400" />
              Recent News
              {category && <span className="font-normal text-gray-400 normal-case tracking-normal">in {category}</span>}
            </h2>
            {allNews.length === 0 ? (
              <p className="text-sm text-gray-400">No news yet{category ? ` in ${category}` : ""}.</p>
            ) : (
              <div className="space-y-3">
                {allNews.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors">
                    <Newspaper className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-blue-600 hover:underline font-medium">
                          {item.title}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-800 font-medium">{item.title}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Link href={`/startups/${item.slug}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">{item.companyName}</Link>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{item.category}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tag Cloud */}
          {allTags.length > 0 && (
            <section className="mb-14">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                <Tag className="w-4 h-4 text-gray-400" />
                Browse by Tag
              </h2>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 30).map(({ tag, count }) => (
                  <Link
                    key={tag}
                    href={`/tags/${tagSlug(tag)}`}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1 transition-colors"
                  >
                    {tag}
                    <span className="text-xs text-gray-400">{count}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Benefits */}
          <section className="border-t border-gray-100 pt-12 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Why list your startup on SaaS Stars?
            </h2>
            <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">
              A free profile that keeps working for you — 24/7, forever.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {BENEFITS.map((b) => (
                <div key={b.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <b.icon className="w-5 h-5 text-emerald-500 mb-3" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/add"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Zap className="w-4 h-4" />
                Get Listed Now — Free Forever
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
