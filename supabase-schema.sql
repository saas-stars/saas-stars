-- SaaS Stars — Supabase schema (Next.js version with slug for SEO URLs)
-- Run this in your Supabase SQL Editor

create table if not exists startups (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  slug text not null unique,
  category text not null,
  hq_location text not null,
  website text not null,
  year_founded integer not null,
  fundraising_stage text not null,
  employees text,
  revenue text,
  newsletter_url text,
  linkedin_url text,
  x_url text,
  youtube_url text,
  short_description text,
  free_trial_url text,
  demo_url text,
  news jsonb not null default '[]'::jsonb,
  owner_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table startups enable row level security;

-- Anyone can read
create policy "Public read" on startups for select using (true);

-- Authenticated users can insert (owner_id must match their auth.uid)
create policy "Auth insert" on startups for insert
  with check (auth.uid() = owner_id);

-- Owners can update their own listings
create policy "Owner update" on startups for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Indexes for common queries
create index if not exists idx_startups_slug on startups(slug);
create index if not exists idx_startups_category on startups(category);
create index if not exists idx_startups_created_at on startups(created_at desc);
create index if not exists idx_startups_owner_id on startups(owner_id);
