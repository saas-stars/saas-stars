"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Startup } from "@/lib/types";
import { StartupCard } from "./StartupCard";
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

  const recentNews = [...filtered]
    .filter((s) => s.news.length > 0)
    .sort((a, b) => (b.news[0]?.date || "").localeCompare(a.news[0]?.date || ""))
    .slice(0, 12);

  return (
    <div>
      {/* Hero */}
      <section className="text-center pt-6 pb-10 mb-8 border-b border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          The GTM platform for
          <br className="hidden sm:block" />
          <span className="text-emerald-500"> bootstrapped SaaS</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto mb-6">
          Get discovered, generate leads, and build SEO authority — without VC money or a marketing budget.
        </p>

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
            {recentNews.length === 0 ? (
              <p className="text-sm text-gray-400">No news yet{category ? ` in ${category}` : ""}.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentNews.map((s) => (
                  <StartupCard key={s.id} startup={s} />
                ))}
              </div>
            )}
          </section>

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
