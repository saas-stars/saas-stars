"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

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
    // Get updated startup from store to reflect new news
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

function EditField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input text-sm" placeholder={placeholder} />
    </div>
  );
}

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
    freeTrialUrl: startup.freeTrialUrl || "",
    demoUrl: startup.demoUrl || "",
    linkedinUrl: startup.linkedinUrl || "",
    xUrl: startup.xUrl || "",
    youtubeUrl: startup.youtubeUrl || "",
    newsletterUrl: startup.newsletterUrl || "",
  });
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
      freeTrialUrl: form.freeTrialUrl || undefined,
      demoUrl: form.demoUrl || undefined,
      linkedinUrl: form.linkedinUrl || undefined,
      xUrl: form.xUrl || undefined,
      youtubeUrl: form.youtubeUrl || undefined,
      newsletterUrl: form.newsletterUrl || undefined,
    };
    await store.update(startup.id, updates);
    setSaving(false);
    onSaved({ ...startup, ...updates });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900">Edit Profile</h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
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
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Short Description</label>
        <textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="input text-sm min-h-[60px] resize-none" maxLength={200} />
      </div>
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

export function StartupProfileClient({ startup: initialStartup }: { startup: Startup }) {
  const [startup, setStartup] = useState(initialStartup);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const isOwner = user !== null && user.id === startup.ownerId;

  return (
    <>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{startup.companyName}</h1>
            {startup.shortDescription && (
              <p className="text-gray-500 text-base leading-relaxed mt-2">{startup.shortDescription}</p>
            )}
          </div>
          {isOwner && !editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors shrink-0">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
      </header>

      {editing && (
        <EditProfileForm
          startup={startup}
          onSaved={(updated) => { setStartup(updated); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* Key details */}
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

      {/* Links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {startup.freeTrialUrl && <LinkPill href={startup.freeTrialUrl} label="Free Trial" icon={<Play className="w-3.5 h-3.5" />} />}
        {startup.demoUrl && <LinkPill href={startup.demoUrl} label="Demo" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
        {startup.linkedinUrl && <LinkPill href={startup.linkedinUrl} label="LinkedIn" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
        {startup.xUrl && <LinkPill href={startup.xUrl} label="X / Twitter" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
        {startup.youtubeUrl && <LinkPill href={startup.youtubeUrl} label="YouTube" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
        {startup.newsletterUrl && <LinkPill href={startup.newsletterUrl} label="Newsletter / Blog" icon={<ExternalLink className="w-3.5 h-3.5" />} />}
      </div>

      {/* News Feed */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">News</h2>
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
              <div key={item.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <Newspaper className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-blue-600 hover:underline">
                      {item.title}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-800">{item.title}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
