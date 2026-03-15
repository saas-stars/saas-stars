"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, FUNDRAISING_STAGES } from "@/lib/types";
import { store } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";
import {
  ArrowLeft, CheckCircle2, Link as LinkIcon, Megaphone, Newspaper, Search, TrendingUp, Users,
} from "lucide-react";

const PERKS = [
  { icon: Search, text: "Discoverable by customers & investors" },
  { icon: LinkIcon, text: "Permanent SEO backlink to your site" },
  { icon: TrendingUp, text: "Drive free trial & demo signups" },
  { icon: Megaphone, text: "Promote your social channels & content" },
  { icon: Newspaper, text: "Post news to stay top of mind" },
  { icon: Users, text: "Attract partners & collaborators" },
];

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-0.5">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function getEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() || "";
}

function getWebsiteDomain(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : "https://" + url).hostname.replace("www.", "").toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//, "").replace("www.", "").split("/")[0].toLowerCase();
  }
}

export function AddStartupClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    companyName: "", category: "", hqLocation: "", website: "", yearFounded: "",
    fundraisingStage: "", employees: "", revenue: "", newsletterUrl: "", linkedinUrl: "",
    xUrl: "", youtubeUrl: "", shortDescription: "", freeTrialUrl: "", demoUrl: "",
  });
  const [error, setError] = useState("");

  // Check if user already has a listing
  const existingListing = user ? store.getAll().find((s) => s.ownerId === user.id) : null;

  function set(key: string, value: string) { setForm((prev) => ({ ...prev, [key]: value })); setError(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.companyName || !form.category || !form.hqLocation || !form.website || !form.yearFounded || !form.fundraisingStage) {
      setError("Please fill in all required fields.");
      return;
    }
    let website = form.website;
    if (!website.startsWith("http")) website = "https://" + website;

    // Validate domain matches email
    if (user) {
      const emailDomain = getEmailDomain(user.email);
      const siteDomain = getWebsiteDomain(website);
      if (emailDomain && siteDomain && emailDomain !== siteDomain) {
        setError(`Your website domain must match your email domain. You're signed in as ${user.email}, so your website must be on ${emailDomain}.`);
        return;
      }
    }

    const startup = await store.add({
      companyName: form.companyName, category: form.category, hqLocation: form.hqLocation,
      website, yearFounded: parseInt(form.yearFounded), fundraisingStage: form.fundraisingStage,
      ownerId: user?.id || "anon",
      employees: form.employees || undefined, revenue: form.revenue || undefined,
      newsletterUrl: form.newsletterUrl || undefined, linkedinUrl: form.linkedinUrl || undefined,
      xUrl: form.xUrl || undefined, youtubeUrl: form.youtubeUrl || undefined,
      shortDescription: form.shortDescription || undefined, freeTrialUrl: form.freeTrialUrl || undefined,
      demoUrl: form.demoUrl || undefined,
    });
    // Pre-warm the ISR page before redirecting so user doesn't hit a 404
    await fetch(`/startups/${startup.slug}`).catch(() => {});
    router.push(`/startups/${startup.slug}`);
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">Create an account to list your startup</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">It&apos;s free and takes 30 seconds.</p>
        <AuthModal
          defaultTab="signup"
          inline
          onClose={() => router.push("/")}
          onSuccess={() => {}}
        />
      </div>
    );
  }

  if (existingListing) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h1 className="text-xl font-bold text-gray-900 mb-2">You already have a listing</h1>
        <p className="text-sm text-gray-500 mb-4">Each account can list one SaaS. You can edit your existing profile instead.</p>
        <Link href={`/startups/${existingListing.slug}`} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">→ Go to {existingListing.companyName}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="lg:sticky lg:top-20 bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1">What you get — free, forever</h3>
            <p className="text-xs text-gray-500 mb-4">Your profile starts working for you the moment you hit submit.</p>
            <ul className="space-y-3">
              {PERKS.map((p) => (
                <li key={p.text} className="flex items-start gap-2.5">
                  <p.icon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-700 leading-snug">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">List your startup on SaaS Stars</h1>
          <p className="text-gray-500 text-sm mb-8">It takes 2 minutes. Fill in the basics and start getting discovered today.</p>

          {error && <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <Section title="The Basics" subtitle="Required to publish your profile.">
              <Field label="Company Name *"><input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} className="input" placeholder="Acme Inc." /></Field>
              <Field label="Category *">
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input">
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="HQ Location *"><input value={form.hqLocation} onChange={(e) => set("hqLocation", e.target.value)} className="input" placeholder="San Francisco, CA" /></Field>
                <Field label="Year Founded *"><input type="number" value={form.yearFounded} onChange={(e) => set("yearFounded", e.target.value)} className="input" placeholder="2024" min="1990" max="2030" /></Field>
              </div>
              <Field label="Website *" hint="This becomes a dofollow SEO backlink."><input value={form.website} onChange={(e) => set("website", e.target.value)} className="input" placeholder="https://example.com" /></Field>
              <Field label="Fundraising Stage *">
                <select value={form.fundraisingStage} onChange={(e) => set("fundraisingStage", e.target.value)} className="input">
                  <option value="">Select stage</option>
                  {FUNDRAISING_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </Section>

            <Section title="Growth & Visibility" subtitle="Optional, but these fields dramatically increase profile engagement.">
              <Field label="Short Description" hint="Help visitors understand what you do at a glance."><textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="input min-h-[80px] resize-none" placeholder="One or two sentences about what your SaaS does." maxLength={200} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Free Trial Link" hint="Let users try before they buy."><input value={form.freeTrialUrl} onChange={(e) => set("freeTrialUrl", e.target.value)} className="input" placeholder="https://example.com/trial" /></Field>
                <Field label="Demo Link" hint="Showcase your product in action."><input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} className="input" placeholder="https://example.com/demo" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Employees">
                  <select value={form.employees} onChange={(e) => set("employees", e.target.value)} className="input">
                    <option value="">Select range</option>
                    <option>1-10</option><option>11-50</option><option>51-200</option><option>201-500</option><option>500+</option>
                  </select>
                </Field>
                <Field label="Revenue"><input value={form.revenue} onChange={(e) => set("revenue", e.target.value)} className="input" placeholder="$1M ARR" /></Field>
              </div>
            </Section>

            <Section title="Social & Content" subtitle="Grow your audience across every channel.">
              <div className="grid grid-cols-2 gap-4">
                <Field label="LinkedIn URL"><input value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} className="input" placeholder="https://linkedin.com/company/..." /></Field>
                <Field label="X / Twitter URL"><input value={form.xUrl} onChange={(e) => set("xUrl", e.target.value)} className="input" placeholder="https://x.com/..." /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="YouTube URL"><input value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} className="input" placeholder="https://youtube.com/@..." /></Field>
                <Field label="Newsletter / Blog URL"><input value={form.newsletterUrl} onChange={(e) => set("newsletterUrl", e.target.value)} className="input" placeholder="https://example.com/blog" /></Field>
              </div>
            </Section>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                <CheckCircle2 className="w-4 h-4" />Publish My Listing
              </button>
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
