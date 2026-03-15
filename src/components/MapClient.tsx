"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStartups } from "@/hooks/useStore";
import { ArrowLeft, MapPin, Filter, X } from "lucide-react";
import type { Startup } from "@/lib/types";
import { CATEGORIES, FUNDRAISING_STAGES } from "@/lib/types";
import L from "leaflet";

const COORDS: Record<string, [number, number]> = {
  "Austin, TX": [30.27, -97.74], "New York, NY": [40.71, -74.01],
  "San Francisco, CA": [37.77, -122.42], "Berlin, Germany": [52.52, 13.41],
  "London, UK": [51.51, -0.13], "Chicago, IL": [41.88, -87.63],
  "Toronto, Canada": [43.65, -79.38], "Seattle, WA": [47.61, -122.33],
  "Boston, MA": [42.36, -71.06], "Tel Aviv, Israel": [32.08, 34.78],
  "Los Angeles, CA": [34.05, -118.24], "Miami, FL": [25.76, -80.19],
  "Denver, CO": [39.74, -104.99], "Atlanta, GA": [33.75, -84.39],
  "Paris, France": [48.86, 2.35], "Amsterdam, Netherlands": [52.37, 4.9],
  "Singapore": [1.35, 103.82], "Sydney, Australia": [-33.87, 151.21],
  "Tokyo, Japan": [35.68, 139.69], "Bangalore, India": [12.97, 77.59],
  "Dubai, UAE": [25.2, 55.27], "São Paulo, Brazil": [-23.55, -46.63],
  "Stockholm, Sweden": [59.33, 18.07], "Dublin, Ireland": [53.35, -6.26],
  "Boulder, CO": [40.01, -105.27], "Portland, OR": [45.52, -122.68],
  "San Diego, CA": [32.72, -117.16], "Phoenix, AZ": [33.45, -112.07],
  "Salt Lake City, UT": [40.76, -111.89], "Nashville, TN": [36.16, -86.78],
  "Raleigh, NC": [35.78, -78.64], "Minneapolis, MN": [44.98, -93.27],
  "Dallas, TX": [32.78, -96.80], "Houston, TX": [29.76, -95.37],
  "Washington, DC": [38.91, -77.04], "Philadelphia, PA": [39.95, -75.17],
  "Pittsburgh, PA": [40.44, -80.00], "Detroit, MI": [42.33, -83.05],
  "Vancouver, Canada": [49.28, -123.12], "Montreal, Canada": [45.50, -73.57],
  "Munich, Germany": [48.14, 11.58], "Lisbon, Portugal": [38.72, -9.14],
  "Barcelona, Spain": [41.39, 2.17], "Copenhagen, Denmark": [55.68, 12.57],
  "Helsinki, Finland": [60.17, 24.94], "Zurich, Switzerland": [47.37, 8.54],
  "Melbourne, Australia": [-37.81, 144.96], "Seoul, South Korea": [37.57, 126.98],
  "Shanghai, China": [31.23, 121.47], "Beijing, China": [39.90, 116.40],
  "Lagos, Nigeria": [6.52, 3.38], "Nairobi, Kenya": [-1.29, 36.82],
  "Cape Town, South Africa": [-33.93, 18.42], "Mexico City, Mexico": [19.43, -99.13],
  "Buenos Aires, Argentina": [-34.60, -58.38], "Bogota, Colombia": [4.71, -74.07],
};

const CAT_COLORS: Record<string, string> = {
  Sales: "#f59e0b", Marketing: "#3b82f6", EdTech: "#10b981",
  "Project Management": "#8b5cf6", Communication: "#6366f1", Finance: "#06b6d4",
  HR: "#f97316", Developers: "#ef4444", Healthcare: "#ec4899",
  "AI & ML": "#eab308", Cybersecurity: "#14b8a6", "E-commerce": "#a855f7",
  Analytics: "#0ea5e9", "Customer Support": "#84cc16", "Legal Tech": "#64748b",
  "Real Estate": "#d946ef", "Supply Chain": "#059669", Other: "#9ca3af",
};

function getColor(cat: string) { return CAT_COLORS[cat] || "#10b981"; }

function createCircleIcon(color: string, count: number): L.DivIcon {
  const size = count > 3 ? 32 : count > 1 ? 26 : 20;
  return L.divIcon({
    className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;cursor:pointer;">${count > 1 ? count : ""}</div>`,
  });
}

export function MapClient() {
  const store = useStartups();
  const all = store.getAll();
  const [catFilter, setCatFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const filtered = all.filter((s) => {
    if (catFilter && s.category !== catFilter) return false;
    if (stageFilter && s.fundraisingStage !== stageFilter) return false;
    return true;
  });

  const locGroups = new Map<string, Startup[]>();
  for (const s of filtered) {
    if (!locGroups.has(s.hqLocation)) locGroups.set(s.hqLocation, []);
    locGroups.get(s.hqLocation)!.push(s);
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { center: [30, 0], zoom: 2, minZoom: 2, maxZoom: 14, zoomControl: false, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; markersRef.current = null; };
  }, []);

  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;
    markersRef.current.clearLayers();
    for (const [loc, startups] of locGroups.entries()) {
      const coords = COORDS[loc];
      if (!coords) continue;
      const count = startups.length;
      const mainColor = count === 1 ? getColor(startups[0].category) : "#10b981";
      const icon = createCircleIcon(mainColor, count);
      const popupHtml = `<div style="min-width:200px;max-width:260px;"><div style="font-weight:700;font-size:14px;margin-bottom:8px;display:flex;align-items:center;gap:6px;"><span style="color:#10b981;">📍</span> ${loc}</div>${startups.map((s) => `<div data-startup-slug="${s.slug}" style="padding:6px 0;border-top:1px solid #f1f5f9;cursor:pointer;" class="popup-startup"><div style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:${getColor(s.category)};display:inline-block;flex-shrink:0;"></span><span style="font-weight:600;font-size:13px;color:#1e293b;">${s.companyName}</span></div>${s.shortDescription ? `<div style="font-size:11px;color:#64748b;margin-top:2px;line-height:1.4;">${s.shortDescription.slice(0, 80)}${s.shortDescription.length > 80 ? "…" : ""}</div>` : ""}<div style="display:flex;gap:4px;margin-top:4px;"><span style="font-size:10px;padding:1px 6px;border-radius:9999px;background:${getColor(s.category)}18;color:${getColor(s.category)};font-weight:500;">${s.category}</span><span style="font-size:10px;padding:1px 6px;border-radius:9999px;background:#f1f5f9;color:#475569;">${s.fundraisingStage}</span></div></div>`).join("")}</div>`;
      const marker = L.marker([coords[0], coords[1]], { icon }).addTo(markersRef.current!);
      marker.bindPopup(popupHtml, { maxWidth: 280, className: "startup-popup" });
      marker.on("popupopen", () => {
        setSelectedLoc(loc);
        setTimeout(() => {
          const el = marker.getPopup()?.getElement();
          if (!el) return;
          el.querySelectorAll(".popup-startup").forEach((node) => {
            node.addEventListener("click", () => {
              const slug = (node as HTMLElement).dataset.startupSlug;
              if (slug) window.location.href = `/startups/${slug}`;
            });
          });
        }, 50);
      });
      marker.on("popupclose", () => setSelectedLoc(null));
    }
  }, [filtered, catFilter, stageFilter]);

  const uniqueLocs = locGroups.size;

  return (
    <div className="max-w-5xl mx-auto">
      <style>{`.leaflet-container{font-family:inherit;}.startup-popup .leaflet-popup-content-wrapper{border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.12);padding:0;}.startup-popup .leaflet-popup-content{margin:12px 14px;}.startup-popup .leaflet-popup-tip{box-shadow:0 2px 6px rgba(0,0,0,0.08);}.popup-startup:hover{background:#f8fafc;}`}</style>

      <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back
      </Link>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900">Startup Map</h1>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${showFilters || catFilter || stageFilter ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-gray-200 text-gray-500 hover:text-gray-900"}`}>
          <Filter className="w-3.5 h-3.5" />Filters{catFilter || stageFilter ? " ·" : ""}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">{filtered.length} startup{filtered.length !== 1 ? "s" : ""} across {uniqueLocs} location{uniqueLocs !== 1 ? "s" : ""}. Click markers for details.</p>

      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
            <option value="">All Stages</option>
            {FUNDRAISING_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(catFilter || stageFilter) && <button onClick={() => { setCatFilter(""); setStageFilter(""); }} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">Clear</button>}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.entries(CAT_COLORS).filter(([cat]) => CATEGORIES.includes(cat as any)).slice(0, 12).map(([cat, color]) => (
          <button key={cat} onClick={() => setCatFilter(catFilter === cat ? "" : cat)} className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-colors ${catFilter === cat ? "border-gray-400 bg-gray-100 font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />{cat}
          </button>
        ))}
      </div>

      <div className="relative border border-gray-200 rounded-xl overflow-hidden mb-4">
        <div ref={mapContainerRef} style={{ height: 480, width: "100%" }} />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Locations ({uniqueLocs})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(locGroups.entries()).sort((a, b) => b[1].length - a[1].length).map(([loc, startups]) => (
          <div key={loc} className={`bg-white border rounded-xl p-4 transition-colors ${selectedLoc === loc ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-200 hover:border-gray-300"}`}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-900">{loc}</h3>
              <span className="text-xs text-gray-400 ml-auto">{startups.length}</span>
            </div>
            <div className="space-y-2">
              {startups.map((s) => (
                <Link key={s.id} href={`/startups/${s.slug}`} className="flex items-center gap-2 w-full text-left group">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getColor(s.category) }} />
                  <span className="text-sm text-gray-700 group-hover:text-emerald-600 transition-colors truncate">{s.companyName}</span>
                  <span className="text-xs text-gray-400 ml-auto shrink-0">{s.category}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
