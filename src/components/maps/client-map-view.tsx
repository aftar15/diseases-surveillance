"use client";

import dynamic from "next/dynamic";

// Dynamically load the map component with no SSR to avoid Leaflet window reference issues
const MapView = dynamic(
  () => import("./map-view").then(mod => mod.MapView),
  { ssr: false, loading: () => <div className="w-full h-[500px] bg-muted animate-pulse rounded-md" /> }
);

export { MapView }; 