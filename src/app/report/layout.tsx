import React from 'react';

// Define metadata in the layout (Server Component)
export const metadata = {
  title: "Report Disease Case | DiseaseTrack",
  description: "Submit an anonymous report of disease symptoms to help monitor outbreaks",
};

interface ReportLayoutProps {
  children: React.ReactNode;
}

// Layout component must render children
export default function ReportLayout({ children }: ReportLayoutProps) {
  return <>{children}</>;
} 