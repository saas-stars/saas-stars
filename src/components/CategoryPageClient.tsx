"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Startup } from "@/lib/types";
import { StartupCard } from "./StartupCard";
import { ArrowLeft, Layers, ArrowUpDown } from "lucide-react";

type SortOption = "newest" | "alpha" | "stage" | "employees";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  alpha: "A → Z",
  stage: "Funding Stage",
  employees: "Employees",
};

const STAGE_ORDER = [
  "Bootstrapped", "Pre-Seed", "Seed", "Series A",
  "Series B", "Series C", "Series D+", "Public",
];

function parseEmployeeCount(e?: string): number {
  if (!e) return 0;
  const match = e.replace(/,/g, "").match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function sortStartups(list: Startup[], sort: SortOption): Startup[] {
  const sorted = [...list];
  switch (sort) {
    case "newest": return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "alpha": return sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
    case "stage": return sorted.sort((a, b) => STAGE_ORDER.indexOf(b.fundraisingStage) - STAGE_ORDER.indexOf(a.fundraisingStage));
    case "employees": return sorted.sort((a, b) => parseEmployeeCount(b.employees) - parseEmployeeCount(a.employees));
    default: return sorted;
  }
}

export function CategoryPageClient({ category, initialStartups }: { category: string; initialStartups: Startup[] }) {
  const [sort, setSort] = useState<SortOption>("newest");
  const startups = useMemo(() => sortStartups(initialStartups, sort), [initialStartups, sort]);

  return (
    <div>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-1">
            <Layers className="w-5 h-5 text-emerald-500" />
            {category}
          </h1>
          <p className="text-gray-500 text-sm">
            {startups.length} startup{startups.length !== 1 ? "s" : ""} in this category
          </p>
        </div>

        {startups.length > 1 && (
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {startups.length === 0 ? (
        <p className="text-sm text-gray-400">No startups listed in {category} yet. Be the first!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {startups.map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      )}
    </div>
  );
}
