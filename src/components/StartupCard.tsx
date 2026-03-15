"use client";

import type { Startup } from "@/lib/types";
import Link from "next/link";
import { MapPin, Globe, Newspaper } from "lucide-react";

interface Props {
  startup: Startup;
}

const categoryColors: Record<string, string> = {
  Sales: "bg-blue-50 text-blue-700 border-blue-200",
  Marketing: "bg-orange-50 text-orange-700 border-orange-200",
  EdTech: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Project Management": "bg-violet-50 text-violet-700 border-violet-200",
  Communication: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Finance: "bg-green-50 text-green-700 border-green-200",
  HR: "bg-pink-50 text-pink-700 border-pink-200",
  Developers: "bg-slate-50 text-slate-700 border-slate-200",
  Healthcare: "bg-red-50 text-red-700 border-red-200",
  "AI & ML": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Cybersecurity: "bg-amber-50 text-amber-700 border-amber-200",
  "E-commerce": "bg-teal-50 text-teal-700 border-teal-200",
  Analytics: "bg-purple-50 text-purple-700 border-purple-200",
  "Customer Support": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Legal Tech": "bg-gray-50 text-gray-700 border-gray-200",
  "Real Estate": "bg-lime-50 text-lime-700 border-lime-200",
  "Supply Chain": "bg-sky-50 text-sky-700 border-sky-200",
  Other: "bg-neutral-50 text-neutral-700 border-neutral-200",
};

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-pink-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
  "bg-red-500", "bg-amber-500", "bg-purple-500", "bg-green-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function isNew(createdAt: string): boolean {
  const created = new Date(createdAt + "T12:00:00");
  const now = new Date();
  const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 14;
}

export function StartupCard({ startup }: Props) {
  const latestNews = startup.news[0];
  const colorClass = categoryColors[startup.category] || categoryColors.Other;
  const initial = startup.companyName.charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(startup.companyName);
  const showNew = isNew(startup.createdAt);

  return (
    <Link
      href={`/startups/${startup.slug}`}
      className="block w-full text-left bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-400 hover:shadow-sm transition-all duration-150 group relative"
    >
      {showNew && (
        <span className="absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wide bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
          New
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base group-hover:text-black leading-tight truncate">
              {startup.companyName}
            </h3>
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ${colorClass}`}>
              {startup.category}
            </span>
          </div>
        </div>
      </div>

      {startup.shortDescription && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {startup.shortDescription}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {startup.hqLocation}
        </span>
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {(() => { try { return new URL(startup.website).hostname.replace("www.", ""); } catch { return startup.website; } })()}
        </span>
      </div>

      {latestNews && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Newspaper className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">{latestNews.title}</span>
          </p>
        </div>
      )}
    </Link>
  );
}
