"use client";

import { useEffect, useState } from "react";
import { AlertTriangleIcon, CheckCircleIcon, AlertCircleIcon, ShieldAlertIcon } from "lucide-react";

interface RiskData {
  barangay: string;
  cases: number;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export function RiskAssessmentCard() {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRiskData() {
      try {
        setLoading(true);
        const response = await fetch('/api/reports?status=validated');
        if (!response.ok) throw new Error('Failed to fetch reports');
        
        const reports = await response.json();
        
        // Group by locationId and count cases
        const locationCounts: Record<string, number> = {};
        reports.forEach((report: any) => {
          const location = report.locationId || "Unknown";
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        });

        // Calculate risk levels based on case count
        const risk: RiskData[] = Object.entries(locationCounts).map(([barangay, cases]) => ({
          barangay,
          cases,
          riskLevel: cases >= 10 ? "critical" : cases >= 5 ? "high" : cases >= 2 ? "medium" : "low"
        }));

        // Sort by cases descending
        risk.sort((a, b) => b.cases - a.cases);
        
        setRiskData(risk.slice(0, 5)); // Top 5 areas
      } catch (error) {
        console.error('Error fetching risk data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRiskData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "text-red-600 bg-red-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical": return <ShieldAlertIcon className="h-5 w-5" />;
      case "high": return <AlertCircleIcon className="h-5 w-5" />;
      case "medium": return <AlertTriangleIcon className="h-5 w-5" />;
      case "low": return <CheckCircleIcon className="h-5 w-5" />;
      default: return <AlertTriangleIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="h-[200px] bg-muted animate-pulse rounded-md flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading risk assessment...</p>
      </div>
    );
  }

  if (riskData.length === 0) {
    return (
      <div className="h-[200px] bg-muted/50 rounded-md flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available for risk assessment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Top Risk Areas (by active cases)
      </div>
      {riskData.map((area, index) => (
        <div key={area.barangay} className="flex items-center justify-between p-3 bg-card border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getRiskColor(area.riskLevel)}`}>
              {getRiskIcon(area.riskLevel)}
            </div>
            <div>
              <p className="font-medium text-sm">{area.barangay}</p>
              <p className="text-xs text-muted-foreground">{area.cases} active cases</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(area.riskLevel)}`}>
            {area.riskLevel.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
}

