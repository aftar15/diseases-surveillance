"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  validated: number;
  pending: number;
  rejected: number;
}

export function ValidationTrendsChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        if (!response.ok) throw new Error('Failed to fetch reports');
        
        const reports = await response.json();
        
        // Group by date and status
        const dateGroups: Record<string, { validated: number; pending: number; rejected: number }> = {};
        
        reports.forEach((report: any) => {
          const date = new Date(report.reportDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          if (!dateGroups[date]) {
            dateGroups[date] = { validated: 0, pending: 0, rejected: 0 };
          }
          
          if (report.status === 'validated') dateGroups[date].validated++;
          else if (report.status === 'pending') dateGroups[date].pending++;
          else if (report.status === 'rejected') dateGroups[date].rejected++;
        });

        // Convert to array and sort by date
        const trendsData = Object.entries(dateGroups)
          .map(([date, counts]) => ({
            date,
            ...counts
          }))
          .slice(-14); // Last 14 data points

        setData(trendsData);
      } catch (error) {
        console.error('Error fetching validation trends:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="h-[250px] lg:h-[300px] bg-muted animate-pulse rounded-md flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading validation trends...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[250px] lg:h-[300px] bg-muted/50 rounded-md flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No validation data available</p>
      </div>
    );
  }

  return (
    <div className="h-[250px] lg:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#888888"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#888888"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey="validated" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Validated"
            dot={{ fill: '#10b981', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="pending" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Pending"
            dot={{ fill: '#f59e0b', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="rejected" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Rejected"
            dot={{ fill: '#ef4444', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

