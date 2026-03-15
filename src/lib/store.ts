import type { Startup, NewsItem } from "./types";
import { supabase } from "./supabase";
import { SEED_DATA } from "./data";
import { slugify } from "./types";

let startups: Startup[] = [];
let loaded = false;
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((fn) => fn());
}

function mapRow(r: Record<string, unknown>): Startup {
  const companyName = r.company_name as string;
  return {
    id: r.id as string,
    companyName,
    slug: (r.slug as string) || slugify(companyName),
    category: r.category as string,
    hqLocation: r.hq_location as string,
    website: r.website as string,
    yearFounded: r.year_founded as number,
    fundraisingStage: r.fundraising_stage as string,
    employees: (r.employees as string) || undefined,
    revenue: (r.revenue as string) || undefined,
    newsletterUrl: (r.newsletter_url as string) || undefined,
    linkedinUrl: (r.linkedin_url as string) || undefined,
    xUrl: (r.x_url as string) || undefined,
    youtubeUrl: (r.youtube_url as string) || undefined,
    shortDescription: (r.short_description as string) || undefined,
    freeTrialUrl: (r.free_trial_url as string) || undefined,
    demoUrl: (r.demo_url as string) || undefined,
    news: (r.news as NewsItem[]) || [],
    ownerId: r.owner_id as string,
    createdAt: r.created_at as string,
  };
}

function toRow(s: Partial<Startup>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (s.companyName !== undefined) {
    row.company_name = s.companyName;
    row.slug = slugify(s.companyName);
  }
  if (s.category !== undefined) row.category = s.category;
  if (s.hqLocation !== undefined) row.hq_location = s.hqLocation;
  if (s.website !== undefined) row.website = s.website;
  if (s.yearFounded !== undefined) row.year_founded = s.yearFounded;
  if (s.fundraisingStage !== undefined) row.fundraising_stage = s.fundraisingStage;
  if (s.employees !== undefined) row.employees = s.employees;
  if (s.revenue !== undefined) row.revenue = s.revenue;
  if (s.newsletterUrl !== undefined) row.newsletter_url = s.newsletterUrl;
  if (s.linkedinUrl !== undefined) row.linkedin_url = s.linkedinUrl;
  if (s.xUrl !== undefined) row.x_url = s.xUrl;
  if (s.youtubeUrl !== undefined) row.youtube_url = s.youtubeUrl;
  if (s.shortDescription !== undefined) row.short_description = s.shortDescription;
  if (s.freeTrialUrl !== undefined) row.free_trial_url = s.freeTrialUrl;
  if (s.demoUrl !== undefined) row.demo_url = s.demoUrl;
  if (s.news !== undefined) row.news = s.news;
  if (s.ownerId !== undefined) row.owner_id = s.ownerId;
  return row;
}

async function loadFromDB() {
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    startups = [];
  } else {
    startups = data.map(mapRow);
  }
  loaded = true;
  notify();
}

loadFromDB();

export const store = {
  subscribe(fn: () => void) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },

  isLoaded: () => loaded,
  getAll: () => startups,
  getById: (id: string) => startups.find((s) => s.id === id),
  getBySlug: (slug: string) => startups.find((s) => s.slug === slug),

  async add(
    startup: Omit<Startup, "id" | "createdAt" | "news" | "slug"> & { news?: NewsItem[] }
  ): Promise<Startup> {
    const slug = slugify(startup.companyName);
    const row = { ...toRow(startup), news: startup.news || [], slug };

    const { data, error } = await supabase
      .from("startups")
      .insert(row)
      .select()
      .single();

    if (error || !data) {
      const newStartup: Startup = {
        ...startup,
        id: crypto.randomUUID(),
        slug,
        news: startup.news || [],
        createdAt: new Date().toISOString().split("T")[0],
      };
      startups = [newStartup, ...startups];
      notify();
      return newStartup;
    }

    const newStartup = mapRow(data);
    startups = [newStartup, ...startups];
    notify();
    return newStartup;
  },

  async update(id: string, updates: Partial<Startup>) {
    const row = toRow(updates);
    if (updates.news !== undefined) row.news = updates.news;
    await supabase.from("startups").update(row).eq("id", id);
    startups = startups.map((s) => (s.id === id ? { ...s, ...updates } : s));
    notify();
  },

  async addNews(startupId: string, news: Omit<NewsItem, "id">) {
    const existing = startups.find((s) => s.id === startupId);
    if (!existing) return;
    const newNews = [{ ...news, id: crypto.randomUUID() }, ...existing.news];
    await supabase.from("startups").update({ news: newNews }).eq("id", startupId);
    startups = startups.map((s) =>
      s.id === startupId ? { ...s, news: newNews } : s
    );
    notify();
  },

  async updateNews(startupId: string, newsId: string, updates: Partial<Omit<NewsItem, "id">>) {
    const existing = startups.find((s) => s.id === startupId);
    if (!existing) return;
    const newNews = existing.news.map((n) => n.id === newsId ? { ...n, ...updates } : n);
    await supabase.from("startups").update({ news: newNews }).eq("id", startupId);
    startups = startups.map((s) => s.id === startupId ? { ...s, news: newNews } : s);
    notify();
  },

  async deleteNews(startupId: string, newsId: string) {
    const existing = startups.find((s) => s.id === startupId);
    if (!existing) return;
    const newNews = existing.news.filter((n) => n.id !== newsId);
    await supabase.from("startups").update({ news: newNews }).eq("id", startupId);
    startups = startups.map((s) => s.id === startupId ? { ...s, news: newNews } : s);
    notify();
  },

  getRecentlyAdded: (limit = 12) =>
    [...startups].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit),

  getWithRecentNews: (limit = 12) =>
    [...startups]
      .filter((s) => s.news.length > 0)
      .sort((a, b) => (b.news[0]?.date || "").localeCompare(a.news[0]?.date || ""))
      .slice(0, limit),

  getByCategory: (category: string) => startups.filter((s) => s.category === category),

  getCategoryCounts: () => {
    const counts: Record<string, number> = {};
    for (const s of startups) counts[s.category] = (counts[s.category] || 0) + 1;
    return counts;
  },

  search: (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return startups.filter(
      (s) =>
        s.companyName.toLowerCase().includes(q) ||
        s.shortDescription?.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.hqLocation.toLowerCase().includes(q)
    );
  },

  getRecentlyAddedByCategory: (category: string, limit = 12) =>
    [...startups]
      .filter((s) => s.category === category)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit),

  getWithRecentNewsByCategory: (category: string, limit = 12) =>
    [...startups]
      .filter((s) => s.category === category && s.news.length > 0)
      .sort((a, b) => (b.news[0]?.date || "").localeCompare(a.news[0]?.date || ""))
      .slice(0, limit),
};
