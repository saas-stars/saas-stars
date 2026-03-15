export interface User {
  id: string;
  email: string;
  name: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  url?: string;
}

export interface Startup {
  id: string;
  companyName: string;
  slug: string;
  category: string;
  hqLocation: string;
  website: string;
  yearFounded: number;
  fundraisingStage: string;
  employees?: string;
  revenue?: string;
  newsletterUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  shortDescription?: string;
  freeTrialUrl?: string;
  demoUrl?: string;
  logoUrl?: string;
  screenshotUrl?: string;
  longDescription?: string;
  tags?: string[];
  integrations?: string[];
  pricingSummary?: string;
  pricingUrl?: string;
  founderName?: string;
  founderTitle?: string;
  founderLinkedinUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  news: NewsItem[];
  ownerId: string;
  createdAt: string;
}

export const CATEGORIES = [
  "Sales",
  "Marketing",
  "EdTech",
  "Project Management",
  "Communication",
  "Finance",
  "HR",
  "Developers",
  "Healthcare",
  "AI & ML",
  "Cybersecurity",
  "E-commerce",
  "Analytics",
  "Customer Support",
  "Legal Tech",
  "Real Estate",
  "Supply Chain",
  "Other",
] as const;

export const FUNDRAISING_STAGES = [
  "Bootstrapped",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
  "Public",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Generate a URL-friendly slug from a company name */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
