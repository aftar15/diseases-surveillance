"use client";

import dynamic from "next/dynamic";

// Dynamically load the ReportForm component
const ReportForm = dynamic(
  () => import("@/components/forms/report-form"),
  { ssr: false, loading: () => <div className="w-full h-[500px] bg-muted animate-pulse rounded-md" /> }
);

export { ReportForm }; 