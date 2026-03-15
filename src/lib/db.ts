/** Server-side data fetching for SSG/SSR pages */
import { supabase } from "./supabase";
import { SEED_DATA } from "./data";
import type { Startup, NewsItem } from "./types";
import { slugify } from "./types";

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
    logoUrl: (r.logo_url as string) || undefined,
    screenshotUrl: (r.screenshot_url as string) || undefined,
    longDescription: (r.long_description as string) || undefined,
    tags: (r.tags as string[]) || undefined,
    integrations: (r.integrations as string[]) || undefined,
    pricingSummary: (r.pricing_summary as string) || undefined,
    pricingUrl: (r.pricing_url as string) || undefined,
    founderName: (r.founder_name as string) || undefined,
    founderTitle: (r.founder_title as string) || undefined,
    founderLinkedinUrl: (r.founder_linkedin_url as string) || undefined,
    ctaLabel: (r.cta_label as string) || undefined,
    ctaUrl: (r.cta_url as string) || undefined,
    news: (r.news as NewsItem[]) || [],
    ownerId: r.owner_id as string,
    createdAt: r.created_at as string,
  };
}

/** Fetch all startups from Supabase */
export async function getAllStartups(): Promise<Startup[]> {
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }
  return data.map(mapRow);
}

/** Fetch a single startup by slug */
export async function getStartupBySlug(slug: string): Promise<Startup | null> {
  // Try DB first
  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!error && data) {
    return mapRow(data);
  }

  // Fall back to seed data
  const seed = SEED_DATA.find((s) => s.slug === slug);
  return seed || null;
}

/** Fetch startups by category */
export async function getStartupsByCategory(category: string): Promise<Startup[]> {
  const all = await getAllStartups();
  return all.filter((s) => s.category === category);
}

/** Get all unique category slugs for static generation */
export function getCategorySlugs(): string[] {
  const cats = new Set(SEED_DATA.map((s) => s.category));
  return Array.from(cats).map((c) =>
    c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  );
}

/** Fetch startups that have a specific tag */
export async function getStartupsByTag(tag: string): Promise<Startup[]> {
  const all = await getAllStartups();
  return all.filter((s) => s.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()));
}

/** Get all unique tags across all startups */
export async function getAllTags(): Promise<string[]> {
  const all = await getAllStartups();
  const tagSet = new Set<string>();
  for (const s of all) {
    if (s.tags) {
      for (const t of s.tags) tagSet.add(t);
    }
  }
  return Array.from(tagSet);
}

/** Map a category slug back to its display name */
export function categoryFromSlug(slug: string): string | null {
  const categories = [
    "Sales", "Marketing", "EdTech", "Project Management", "Communication",
    "Finance", "HR", "Developers", "Healthcare", "AI & ML", "Cybersecurity",
    "E-commerce", "Analytics", "Customer Support", "Legal Tech", "Real Estate",
    "Supply Chain", "Other",
  ];
  return (
    categories.find(
      (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug
    ) || null
  );
}
