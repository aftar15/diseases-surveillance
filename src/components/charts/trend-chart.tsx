"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useToast } from "@/components/ui/toast";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Chart options
const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Dengue Case Trends (Last 30 Days)",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Number of Cases",
      },
    },
    x: {
      title: {
        display: true,
        text: "Date",
      },
    },
  },
};

// Format data from API for chart
function formatChartData(reportData: any) {
  // Extract dates and convert to readable format
  const labels = reportData.dates.map((date: string) => 
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  
  return {
    labels,
    datasets: [
      {
        label: "Reported Cases",
        data: reportData.reportedCounts,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Confirmed Cases",
        data: reportData.confirmedCounts,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
}

export default function TrendChart() {
  const [chartData, setChartData] = useState<ChartData<"line">>({ datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTrendData() {
      try {
        setLoading(true);
        setError(null);
        // Fetch real data from API
        const response = await fetch('/api/analytics/trends');
        
        if (!response.ok) {
          throw new Error("Failed to fetch trend data");
        }
        
        const data = await response.json();
        
        // Check if data is valid
        if (!data.dates || !data.reportedCounts || !data.confirmedCounts) {
          throw new Error("Invalid data format received");
        }
        
        setChartData(formatChartData(data));
      } catch (error) {
        console.error("Error fetching trend data:", error);
        setError(error instanceof Error ? error.message : "Failed to load trend data");
        toast({
          title: "Error",
          description: "Failed to load trend data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchTrendData();
  }, [toast]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-md">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading trend data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-md">
        <div className="text-center space-y-2 p-4">
          <p className="text-sm text-muted-foreground">Failed to load chart data</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData.datasets || chartData.datasets.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-md">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Line options={options} data={chartData} />
    </div>
  );
} 