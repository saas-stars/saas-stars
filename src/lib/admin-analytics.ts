/** Admin-level analytics — reads ALL analytics (RLS enforced by admin email) */
import { supabase } from "./supabase";

export const ADMIN_EMAIL = "dave@saasstars.com";

export interface AdminAnalytics {
  totalViews: number;
  totalClicks: number;
  startupBreakdown: {
    startupId: string;
    companyName: string;
    views: number;
    clicks: number;
  }[];
  clicksByType: Record<string, number>;
  viewsByDay: { date: string; count: number }[];
  recentEvents: {
    id: string;
    eventType: string;
    linkType: string | null;
    referrer: string | null;
    createdAt: string;
    companyName: string;
  }[];
}

export async function getAdminAnalytics(): Promise<AdminAnalytics | null> {
  // Fetch all analytics (admin RLS policy allows this for dave@saasstars.com)
  const { data: events, error } = await supabase
    .from("analytics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !events) return null;

  // Fetch startups for name mapping
  const { data: startups } = await supabase
    .from("startups")
    .select("id, company_name");

  const nameMap: Record<string, string> = {};
  if (startups) {
    for (const s of startups) {
      nameMap[s.id] = s.company_name;
    }
  }

  const totalViews = events.filter((e) => e.event_type === "profile_view").length;
  const totalClicks = events.filter((e) => e.event_type === "outbound_click").length;

  // Breakdown per startup
  const startupMap: Record<string, { views: number; clicks: number }> = {};
  for (const e of events) {
    if (!startupMap[e.startup_id]) startupMap[e.startup_id] = { views: 0, clicks: 0 };
    if (e.event_type === "profile_view") startupMap[e.startup_id].views++;
    else startupMap[e.startup_id].clicks++;
  }
  const startupBreakdown = Object.entries(startupMap)
    .map(([startupId, stats]) => ({
      startupId,
      companyName: nameMap[startupId] || "Unknown",
      ...stats,
    }))
    .sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks));

  // Clicks by link type
  const clicksByType: Record<string, number> = {};
  for (const e of events.filter((e) => e.event_type === "outbound_click")) {
    const t = e.link_type || "unknown";
    clicksByType[t] = (clicksByType[t] || 0) + 1;
  }

  // Views by day (last 30 days)
  const viewsByDayMap: Record<string, number> = {};
  for (const e of events.filter((e) => e.event_type === "profile_view")) {
    const day = new Date(e.created_at).toISOString().slice(0, 10);
    viewsByDayMap[day] = (viewsByDayMap[day] || 0) + 1;
  }
  const viewsByDay = Object.entries(viewsByDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // Recent events (last 50)
  const recentEvents = events.slice(0, 50).map((e) => ({
    id: e.id,
    eventType: e.event_type,
    linkType: e.link_type,
    referrer: e.referrer,
    createdAt: e.created_at,
    companyName: nameMap[e.startup_id] || "Unknown",
  }));

  return { totalViews, totalClicks, startupBreakdown, clicksByType, viewsByDay, recentEvents };
}
