"use client";

import { useState } from "react";
import Link from "next/link";
import type { Startup } from "@/lib/types";
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

export function StartupProfileClient({ startup: initialStartup }: { startup: Startup }) {
  const [startup, setStartup] = useState(initialStartup);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const { user } = useAuth();
  const isOwner = user !== null && user.id === startup.ownerId;

  return (
    <>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Header - this is real server-rendered HTML */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{startup.companyName}</h1>
        {startup.shortDescription && (
          <p className="text-gray-500 text-base leading-relaxed mt-2">{startup.shortDescription}</p>
        )}
      </header>

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
