"use client";

import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

const MapClient = dynamic(
  () => import("@/components/MapClient").then((m) => m.MapClient),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Startup Map</h1>
        <div className="h-[480px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
          Loading map…
        </div>
      </div>
    ),
  }
);

export function MapWrapper() {
  return <MapClient />;
}
