"use client";

import dynamic from "next/dynamic";

// Dynamically load the chart component with no SSR
const TrendChart = dynamic(
  () => import("@/components/charts/trend-chart"),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-muted animate-pulse rounded-md" /> }
);

export { TrendChart }; 