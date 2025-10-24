"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileTextIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

interface ReportStats {
  totalReports: number;
  validatedReports: number;
  pendingReports: number;
  validationRate: number;
}

export function ReportAnalyticsCards() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        if (!response.ok) throw new Error('Failed to fetch reports');
        
        const reports = await response.json();
        
        const totalReports = reports.length;
        const validatedReports = reports.filter((r: any) => r.status === 'validated').length;
        const pendingReports = reports.filter((r: any) => r.status === 'pending').length;
        const validationRate = totalReports > 0 
          ? ((validatedReports / totalReports) * 100)
          : 0;

        setStats({
          totalReports,
          validatedReports,
          pendingReports,
          validationRate
        });
      } catch (error) {
        console.error('Error fetching report stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4">
              <div className="h-[80px] sm:h-[100px] bg-muted animate-pulse rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load report statistics
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileTextIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Reports</p>
              <p className="text-2xl font-bold">{stats.totalReports}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Validated</p>
              <p className="text-2xl font-bold">{stats.validatedReports}</p>
              <p className="text-xs text-green-600">{stats.validationRate.toFixed(1)}% rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingReports}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

