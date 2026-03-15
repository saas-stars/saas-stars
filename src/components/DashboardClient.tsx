"use client";

import Link from "next/link";
import type { Startup } from "@/lib/types";
import { ArrowLeft, BarChart3, Building2, Newspaper, Globe, Layers, TrendingUp, Users } from "lucide-react";

function Stat({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <Icon className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

export function DashboardClient({ initialStartups: all }: { initialStartups: Startup[] }) {
  const totalStartups = all.length;
  const totalNews = all.reduce((sum, s) => sum + s.news.length, 0);
  const categories = new Set(all.map((s) => s.category));
  const locations = new Set(all.map((s) => s.hqLocation));

  const catCounts = new Map<string, number>();
  for (const s of all) catCounts.set(s.category, (catCounts.get(s.category) || 0) + 1);
  const catSorted = Array.from(catCounts.entries()).sort((a, b) => b[1] - a[1]);
  const maxCatCount = catSorted[0]?.[1] || 1;

  const stageCounts = new Map<string, number>();
  for (const s of all) stageCounts.set(s.fundraisingStage, (stageCounts.get(s.fundraisingStage) || 0) + 1);
  const stageOrder = ["Bootstrapped", "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Series D+", "Public"];
  const stageSorted = stageOrder.filter((s) => stageCounts.has(s)).map((s) => [s, stageCounts.get(s)!] as const);
  const maxStageCount = Math.max(...stageSorted.map((s) => s[1]), 1);

  const locCounts = new Map<string, number>();
  for (const s of all) locCounts.set(s.hqLocation, (locCounts.get(s.hqLocation) || 0) + 1);
  const locSorted = Array.from(locCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxLocCount = locSorted[0]?.[1] || 1;

  const mostActive = [...all].sort((a, b) => b.news.length - a.news.length).slice(0, 5);
  const newest = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-5 h-5 text-emerald-500" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">A snapshot of the SaaS Stars ecosystem.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <Stat icon={Building2} label="Startups" value={totalStartups} />
        <Stat icon={Newspaper} label="News Posts" value={totalNews} />
        <Stat icon={Layers} label="Categories" value={categories.size} />
        <Stat icon={Globe} label="Locations" value={locations.size} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">By Category</h2>
          <div className="space-y-2.5">
            {catSorted.map(([cat, count]) => (
              <div key={cat}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-700">{cat}</span>
                  <span className="text-gray-400 font-medium">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(count / maxCatCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">By Fundraising Stage</h2>
          <div className="space-y-2.5">
            {stageSorted.map(([stage, count]) => (
              <div key={stage}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-700">{stage}</span>
                  <span className="text-gray-400 font-medium">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${(count / maxStageCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Locations</h2>
          <div className="space-y-2.5">
            {locSorted.map(([loc, count]) => (
              <div key={loc}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-700 truncate mr-2">{loc}</span>
                  <span className="text-gray-400 font-medium shrink-0">{count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(count / maxLocCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />Most Active
          </h2>
          <div className="space-y-3">
            {mostActive.map((s, i) => (
              <Link key={s.id} href={`/startups/${s.slug}`} className="flex items-center gap-3 w-full text-left group">
                <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors truncate">{s.companyName}</p>
                  <p className="text-xs text-gray-400">{s.news.length} news post{s.news.length !== 1 ? "s" : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-4">
            <Users className="w-3.5 h-3.5 text-gray-400" />Newest Startups
          </h2>
          <div className="space-y-3">
            {newest.map((s) => (
              <Link key={s.id} href={`/startups/${s.slug}`} className="flex items-center gap-3 w-full text-left group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors truncate">{s.companyName}</p>
                  <p className="text-xs text-gray-400">{s.category} · {s.createdAt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
