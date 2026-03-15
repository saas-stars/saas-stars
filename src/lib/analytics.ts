/** Client-side analytics event logger */
import { supabase } from "./supabase";

export type AnalyticsEvent = "profile_view" | "outbound_click";

export async function logEvent(
  startupId: string,
  eventType: AnalyticsEvent,
  linkType?: string,
) {
  try {
    await supabase.from("analytics").insert({
      startup_id: startupId,
      event_type: eventType,
      link_type: linkType || null,
      referrer: typeof window !== "undefined" ? document.referrer || null : null,
    });
  } catch {
    // Silently fail — analytics should never break the app
  }
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  clicksByType: Record<string, number>;
  viewsByDay: { date: string; count: number }[];
}

/** Fetch analytics summary for a startup (owner only — RLS enforced) */
export async function getAnalyticsSummary(startupId: string): Promise<AnalyticsSummary | null> {
  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: false });

  if (error || !data) return null;

  const totalViews = data.filter((r) => r.event_type === "profile_view").length;
  const clicks = data.filter((r) => r.event_type === "outbound_click");
  const totalClicks = clicks.length;

  const clicksByType: Record<string, number> = {};
  for (const c of clicks) {
    const t = c.link_type || "unknown";
    clicksByType[t] = (clicksByType[t] || 0) + 1;
  }

  // Group views by day (last 30 days)
  const viewsByDayMap: Record<string, number> = {};
  const views = data.filter((r) => r.event_type === "profile_view");
  for (const v of views) {
    const day = new Date(v.created_at).toISOString().slice(0, 10);
    viewsByDayMap[day] = (viewsByDayMap[day] || 0) + 1;
  }
  const viewsByDay = Object.entries(viewsByDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  return { totalViews, totalClicks, clicksByType, viewsByDay };
}
