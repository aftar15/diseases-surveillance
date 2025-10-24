"use client";

import {
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GrowthDataPoint {
  week: string;
  growthRate: number;
}

interface CaseGrowthChartProps {
  data: GrowthDataPoint[];
}

export function CaseGrowthChart({ data }: CaseGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="week" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          // tickFormatter={(value) => `Week ${value}`}
        />
        <YAxis 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}%`}
        />
        <Tooltip 
           contentStyle={{ 
             backgroundColor: "hsl(var(--background))", 
             borderColor: "hsl(var(--border))",
             borderRadius: "var(--radius)" 
           }}
           labelFormatter={(label: string) => `Week Starting: ${label}`}
           formatter={(value: number) => [`${value.toFixed(1)}%`, "Growth Rate"]}
        />
        <Line 
          type="monotone" 
          dataKey="growthRate" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 