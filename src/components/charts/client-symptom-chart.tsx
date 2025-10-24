"use client";

import dynamic from "next/dynamic";

// Dynamically load the chart component with no SSR
const SymptomChart = dynamic(
  () => import("@/components/charts/symptom-chart"),
  { ssr: false, loading: () => <div className="w-full h-[200px] bg-muted animate-pulse rounded-md" /> }
);

export { SymptomChart }; 