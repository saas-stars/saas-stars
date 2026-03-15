"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Startup } from "@/lib/types";
import { CATEGORIES, FUNDRAISING_STAGES } from "@/lib/types";
import { store } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Bookmark,
  ExternalLink,
  Newspaper,
  Play,
  Plus,
  Pencil,
  X,
  Trash2,
  Tag,
  Puzzle,
  CreditCard,
  User,
  Rocket,
  ImageIcon,
} from "lucide-react";

/* ─── Helpers ─── */

function LinkPill({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-3 py-1.5 transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

function Detail({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400 flex items-center gap-1">{icon}{label}</span>
      <span className="text-sm text-gray-800">{children}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{children}</h2>;
}

/* ─── Add News Form ─── */

function AddNewsForm({ startupId, onAdded }: { startupId: string; onAdded: (news: Startup["news"]) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await store.addNews(startupId, {
      title: title.trim(),
      date: new Date().toISOString().split("T")[0],
      url: url.trim() || undefined,
    });
    setTitle("");
    setUrl("");
    const updated = store.getById(startupId);
    onAdded(updated?.news || []);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">News headline *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Launched v2.0 with AI features" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="input" placeholder="https://..." />
      </div>
      <button type="submit" disabled={!title.trim()} className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Post News
      </button>
    </form>
  );
}

/* ─── Edit helpers ─── */

function EditField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input text-sm" placeholder={placeholder} />
    </div>
  );
}

function TagInput({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function add() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {t}
            <button type="button" onClick={() => onChange(value.filter((v) => v !== t))} className="text-gray-400 hover:text-gray-600">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} className="input text-sm flex-1" placeholder={placeholder} />
        <button type="button" onClick={add} className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2">Add</button>
      </div>
    </div>
  );
}

/* ─── Edit Profile Form ─── */

function EditProfileForm({ startup, onSaved, onCancel }: { startup: Startup; onSaved: (s: Startup) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    companyName: startup.companyName,
    category: startup.category,
    hqLocation: startup.hqLocation,
    website: startup.website,
    yearFounded: String(startup.yearFounded),
    fundraisingStage: startup.fundraisingStage,
    employees: startup.employees || "",
    revenue: startup.revenue || "",
    shortDescription: startup.shortDescription || "",
    longDescription: startup.longDescription || "",
    freeTrialUrl: startup.freeTrialUrl || "",
    demoUrl: startup.demoUrl || "",
    linkedinUrl: startup.linkedinUrl || "",
    xUrl: startup.xUrl || "",
    youtubeUrl: startup.youtubeUrl || "",
    newsletterUrl: startup.newsletterUrl || "",
    logoUrl: startup.logoUrl || "",
    screenshotUrl: startup.screenshotUrl || "",
    pricingSummary: startup.pricingSummary || "",
    pricingUrl: startup.pricingUrl || "",
    founderName: startup.founderName || "",
    founderTitle: startup.founderTitle || "",
    founderLinkedinUrl: startup.founderLinkedinUrl || "",
    ctaLabel: startup.ctaLabel || "",
    ctaUrl: startup.ctaUrl || "",
  });
  const [tags, setTags] = useState<string[]>(startup.tags || []);
  const [integrations, setIntegrations] = useState<string[]>(startup.integrations || []);
  const [saving, setSaving] = useState(false);

  function set(key: string, value: string) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const updates: Partial<Startup> = {
      companyName: form.companyName,
      category: form.category,
      hqLocation: form.hqLocation,
      website: form.website.startsWith("http") ? form.website : "https://" + form.website,
      yearFounded: parseInt(form.yearFounded),
      fundraisingStage: form.fundraisingStage,
      employees: form.employees || undefined,
      revenue: form.revenue || undefined,
      shortDescription: form.shortDescription || undefined,
      longDescription: form.longDescription || undefined,
      freeTrialUrl: form.freeTrialUrl || undefined,
      demoUrl: form.demoUrl || undefined,
      linkedinUrl: form.linkedinUrl || undefined,
      xUrl: form.xUrl || undefined,
      youtubeUrl: form.youtubeUrl || undefined,
      newsletterUrl: form.newsletterUrl || undefined,
      logoUrl: form.logoUrl || undefined,
      screenshotUrl: form.screenshotUrl || undefined,
      pricingSummary: form.pricingSummary || undefined,
      pricingUrl: form.pricingUrl || undefined,
      founderName: form.founderName || undefined,
      founderTitle: form.founderTitle || undefined,
      founderLinkedinUrl: form.founderLinkedinUrl || undefined,
      ctaLabel: form.ctaLabel || undefined,
      ctaUrl: form.ctaUrl || undefined,
      tags: tags.length > 0 ? tags : undefined,
      integrations: integrations.length > 0 ? integrations : undefined,
    };
    await store.update(startup.id, updates);
    setSaving(false);
    onSaved({ ...startup, ...updates, tags, integrations });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900">Edit Profile</h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>

      {/* Basic Info */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Basic Info</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EditField label="Company Name" value={form.companyName} onChange={(v) => set("companyName", v)} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <EditField label="HQ Location" value={form.hqLocation} onChange={(v) => set("hqLocation", v)} placeholder="City, State" />
        <EditField label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="https://..." />
        <EditField label="Year Founded" value={form.yearFounded} onChange={(v) => set("yearFounded", v)} type="number" />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fundraising Stage</label>
          <select value={form.fundraisingStage} onChange={(e) => set("fundraisingStage", e.target.value)} className="input text-sm">
            {FUNDRAISING_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <EditField label="Employees" value={form.employees} onChange={(v) => set("employees", v)} placeholder="1-10" />
        <EditField label="Revenue" value={form.revenue} onChange={(v) => set("revenue", v)} placeholder="$1M ARR" />
      </div>

      {/* Descriptions */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Description</p>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Short Description (shown in cards)</label>
        <textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="input text-sm min-h-[60px] resize-none" maxLength={200} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">About / Long Description</label>
        <textarea value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} className="input text-sm min-h-[120px] resize-y" placeholder="Tell the story of your product — what it does, who it's for, why it's different." />
      </div>

      {/* Branding */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Branding &amp; Media</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EditField label="Logo URL" value={form.logoUrl} onChange={(v) => set("logoUrl", v)} placeholder="https://yoursite.com/logo.png" />
        <EditField label="Product Screenshot URL" value={form.screenshotUrl} onChange={(v) => set("screenshotUrl", v)} placeholder="https://yoursite.com/screenshot.png" />
      </div>

      {/* CTA */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Call to Action</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EditField label="CTA Button Label" value={form.ctaLabel} onChange={(v) => set("ctaLabel", v)} placeholder="Start Free Trial" />
        <EditField label="CTA Button URL" value={form.ctaUrl} onChange={(v) => set("ctaUrl", v)} placeholder="https://yoursite.com/signup" />
      </div>

      {/* Tags & Integrations */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Tags &amp; Integrations</p>
      <TagInput label="Tags / Keywords" value={tags} onChange={setTags} placeholder="e.g. AI, automation, no-code" />
      <TagInput label="Integrations" value={integrations} onChange={setIntegrations} placeholder="e.g. Slack, Zapier, Salesforce" />

      {/* Pricing */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Pricing</p>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Pricing Summary</label>
        <textarea value={form.pricingSummary} onChange={(e) => set("pricingSummary", e.target.value)} className="input text-sm min-h-[60px] resize-none" placeholder="e.g. Free plan available. Pro starts at $29/mo." />
      </div>
      <EditField label="Pricing Page URL" value={form.pricingUrl} onChange={(v) => set("pricingUrl", v)} placeholder="https://yoursite.com/pricing" />

      {/* Founder */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Founder</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <EditField label="Name" value={form.founderName} onChange={(v) => set("founderName", v)} placeholder="Jane Smith" />
        <EditField label="Title" value={form.founderTitle} onChange={(v) => set("founderTitle", v)} placeholder="CEO & Co-Founder" />
        <EditField label="LinkedIn" value={form.founderLinkedinUrl} onChange={(v) => set("founderLinkedinUrl", v)} placeholder="https://linkedin.com/in/..." />
      </div>

      {/* Links */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Links</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EditField label="Free Trial URL" value={form.freeTrialUrl} onChange={(v) => set("freeTrialUrl", v)} placeholder="https://..." />
        <EditField label="Demo URL" value={form.demoUrl} onChange={(v) => set("demoUrl", v)} placeholder="https://..." />
        <EditField label="LinkedIn URL" value={form.linkedinUrl} onChange={(v) => set("linkedinUrl", v)} placeholder="https://linkedin.com/..." />
        <EditField label="X / Twitter URL" value={form.xUrl} onChange={(v) => set("xUrl", v)} placeholder="https://x.com/..." />
        <EditField label="YouTube URL" value={form.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} placeholder="https://youtube.com/..." />
        <EditField label="Newsletter / Blog URL" value={form.newsletterUrl} onChange={(v) => set("newsletterUrl", v)} placeholder="https://..." />
      </div>

      <button type="submit" disabled={saving} className="text-sm font-medium bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}

/* ─── News Item Row ─── */

function NewsItemRow({ item, isOwner, onUpdate, onDelete }: {
  item: Startup["news"][number];
  isOwner: boolean;
  onUpdate: (updates: { title?: string; url?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.url || "");
  const [confirming, setConfirming] = useState(false);

  if (editing) {
    return (
      <div className="py-3 border-b border-gray-100 last:border-0 space-y-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input text-sm" placeholder="Headline" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="input text-sm" placeholder="URL (optional)" />
        <div className="flex gap-2">
          <button onClick={async () => { await onUpdate({ title, url: url || undefined }); setEditing(false); }} className="text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800">Save</button>
          <button onClick={() => { setTitle(item.title); setUrl(item.url || ""); setEditing(false); }} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 group">
      <Newspaper className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        {item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-blue-600 hover:underline">
            {item.title}
          </a>
        ) : (
          <p className="text-sm text-gray-800">{item.title}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
      </div>
      {isOwner && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-gray-600" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {confirming ? (
            <button onClick={async () => { await onDelete(); }} className="text-xs text-red-600 font-medium px-1">Confirm?</button>
          ) : (
            <button onClick={() => setConfirming(true)} className="p-1 text-gray-400 hover:text-red-500" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Profile Component ─── */

export function StartupProfileClient({ startup: initialStartup }: { startup: Startup }) {
  const [startup, setStartup] = useState(initialStartup);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const isOwner = user !== null && user.id === startup.ownerId;

  const ctaLabel = startup.ctaLabel || (startup.freeTrialUrl ? "Start Free Trial" : startup.demoUrl ? "Request Demo" : null);
  const ctaUrl = startup.ctaUrl || startup.freeTrialUrl || startup.demoUrl || null;

  return (
    <>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* ── Header with Logo ── */}
      <header className="mb-8">
        <div className="flex items-start gap-4">
          {startup.logoUrl ? (
            <img src={startup.logoUrl} alt={`${startup.companyName} logo`} className="w-14 h-14 rounded-xl object-contain border border-gray-200 bg-white shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-emerald-600">{startup.companyName.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{startup.companyName}</h1>
                {startup.shortDescription && (
                  <p className="text-gray-500 text-base leading-relaxed mt-1">{startup.shortDescription}</p>
                )}
              </div>
              {isOwner && !editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>

            {/* Prominent CTA */}
            {ctaUrl && (
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Rocket className="w-4 h-4" />
                {ctaLabel}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Edit Form ── */}
      {editing && (
        <EditProfileForm
          startup={startup}
          onSaved={(updated) => { setStartup(updated); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* ── Product Screenshot ── */}
      {startup.screenshotUrl && (
        <section className="mb-8">
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            <img src={startup.screenshotUrl} alt={`${startup.companyName} product screenshot`} className="w-full object-cover max-h-[400px]" />
          </div>
        </section>
      )}

      {/* ── Key Details Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Detail icon={<Globe className="w-4 h-4" />} label="Website">
          <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {(() => { try { return new URL(startup.website).hostname.replace("www.", ""); } catch { return startup.website; } })()}
          </a>
        </Detail>
        <Detail icon={<MapPin className="w-4 h-4" />} label="HQ Location">{startup.hqLocation}</Detail>
        <Detail icon={<Calendar className="w-4 h-4" />} label="Founded">{startup.yearFounded}</Detail>
        <Detail icon={<Bookmark className="w-4 h-4" />} label="Category">{startup.category}</Detail>
        <Detail icon={<DollarSign className="w-4 h-4" />} label="Stage">{startup.fundraisingStage}</Detail>
        {startup.employees && <Detail icon={<Users className="w-4 h-4" />} label="Employees">{startup.employees}</Detail>}
        {startup.revenue && <Detail icon={<DollarSign className="w-4 h-4" />} label="Revenue">{startup.revenue}</Detail>}
      </div>

      {/* ── About / Long Description ── */}
      {startup.longDescription && (
        <section className="mb-8">
          <SectionHeading>About</SectionHeading>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{startup.longDescription}</div>
        </section>
      )}

      {/* ── Tags ── */}
      {startup.tags && startup.tags.length > 0 && (
        <section className="mb-8">
          <SectionHeading>Tags</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {startup.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Integrations ── */}
      {startup.integrations && startup.integrations.length > 0 && (
        <section className="mb-8">
          <SectionHeading>Integrations</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {startup.integrations.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                <Puzzle className="w-3 h-3" />
                {name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Pricing ── */}
      {(startup.pricingSummary || startup.pricingUrl) && (
        <section className="mb-8">
          <SectionHeading>Pricing</SectionHeading>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            {startup.pricingSummary && (
              <p className="text-sm text-gray-700 leading-relaxed">{startup.pricingSummary}</p>
            )}
            {startup.pricingUrl && (
              <a href={startup.pricingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2">
                <CreditCard className="w-3.5 h-3.5" />
                View pricing page
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Founder ── */}
      {startup.founderName && (
        <section className="mb-8">
          <SectionHeading>Founder</SectionHeading>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{startup.founderName}</p>
              {startup.founderTitle && <p className="text-xs text-gray-500">{startup.founderTitle}</p>}
            </div>
            {startup.founderLinkedinUrl && (
              <a href={startup.founderLinkedinUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Social Links ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {startup.freeTrialUrl && <LinkPill href={startup.freeTrialUrl} label="Free Trial" icon={<Play className="w-3.5 h-3.5" />} />}
        {startup.demoUrl && <LinkPill href={startup.demoUrl} label="Demo" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
        {startup.linkedinUrl && <LinkPill href={startup.linkedinUrl} label="LinkedIn" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
        {startup.xUrl && <LinkPill href={startup.xUrl} label="X / Twitter" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
        {startup.youtubeUrl && <LinkPill href={startup.youtubeUrl} label="YouTube" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
        {startup.newsletterUrl && <LinkPill href={startup.newsletterUrl} label="Newsletter / Blog" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
      </div>

      {/* ── News Feed ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionHeading>News</SectionHeading>
          {isOwner && (
            <button onClick={() => setShowNewsForm(!showNewsForm)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add News
            </button>
          )}
        </div>

        {showNewsForm && (
          <div className="mb-4">
            <AddNewsForm startupId={startup.id} onAdded={(newNews) => {
              setStartup((prev) => ({ ...prev, news: newNews }));
              setShowNewsForm(false);
            }} />
          </div>
        )}

        {startup.news.length === 0 ? (
          <p className="text-sm text-gray-400">No news posted yet.</p>
        ) : (
          <div className="space-y-3">
            {startup.news.map((item) => (
              <NewsItemRow
                key={item.id}
                item={item}
                isOwner={isOwner}
                onUpdate={async (updates) => {
                  await store.updateNews(startup.id, item.id, updates);
                  setStartup((prev) => ({ ...prev, news: prev.news.map((n) => n.id === item.id ? { ...n, ...updates } : n) }));
                }}
                onDelete={async () => {
                  await store.deleteNews(startup.id, item.id);
                  setStartup((prev) => ({ ...prev, news: prev.news.filter((n) => n.id !== item.id) }));
                }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
