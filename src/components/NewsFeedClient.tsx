"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Newspaper } from "lucide-react";

interface NewsItemData {
  id: string;
  title: string;
  date: string;
  url?: string;
  startupSlug: string;
  companyName: string;
  category: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function NewsFeedClient({ news }: { news: NewsItemData[] }) {
  const grouped = new Map<string, NewsItemData[]>();
  for (const item of news) {
    if (!grouped.has(item.date)) grouped.set(item.date, []);
    grouped.get(item.date)!.push(item);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Newspaper className="w-5 h-5 text-emerald-500" />
        <h1 className="text-2xl font-bold text-gray-900">News Feed</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        The latest updates from SaaS startups — product launches, funding, events, and more.
      </p>

      {news.length === 0 ? (
        <p className="text-sm text-gray-400">No news yet.</p>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 sticky top-14 bg-gray-50 py-1 z-10">
                {formatDate(date)}
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-snug">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Link href={`/startups/${item.startupSlug}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                            {item.companyName}
                          </Link>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{item.category}</span>
                        </div>
                      </div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
