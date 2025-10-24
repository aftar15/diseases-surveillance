"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Define the expected data structure from props
interface SymptomDataPoint {
  name: string;
  count: number;
}

// Define props for the component
interface SymptomChartProps {
  data: SymptomDataPoint[];
}

// Chart options (can remain the same or be adjusted)
const options: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right", // Adjust legend position if needed
      labels: {
        boxWidth: 12,
        padding: 15, // Add padding for better spacing
      }
    },
    title: {
      display: false, // Title is already in the CardHeader
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed !== null) {
            label += context.parsed.toLocaleString();
          }
          return label;
        }
      }
    }
  },
  // Adjust layout padding if needed
  layout: {
    padding: {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5
    }
  }
};

// Main component, now accepting props
export default function SymptomChart({ data }: SymptomChartProps) {
  // Process the passed data directly
  const chartData: ChartData<"doughnut"> = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: "# of Reports", // Updated label
        data: data.map(item => item.count),
        backgroundColor: [
          // Keep or update colors as needed
          "rgba(239, 68, 68, 0.6)",  // Red (High Fever)
          "rgba(59, 130, 246, 0.6)", // Blue (Severe Headache)
          "rgba(245, 158, 11, 0.6)", // Amber (Pain Behind Eyes)
          "rgba(34, 197, 94, 0.6)",  // Green (Joint/Muscle Pain)
          "rgba(139, 92, 246, 0.6)", // Violet (Skin Rash)
          "rgba(249, 115, 22, 0.6)", // Orange (Mild Bleeding)
          "rgba(107, 114, 128, 0.6)" // Gray (Nausea/Vomiting)
          // Add more colors if expecting more than 7 symptoms
        ],
        borderColor: [
          "rgb(239, 68, 68)",
          "rgb(59, 130, 246)",
          "rgb(245, 158, 11)",
          "rgb(34, 197, 94)",
          "rgb(139, 92, 246)",
          "rgb(249, 115, 22)",
          "rgb(107, 114, 128)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Removed useEffect and loading state
  // Removed useToast as error handling should happen in the parent or data fetching function

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Ensure data exists before rendering Doughnut */}
      {data && data.length > 0 ? (
         <Doughnut options={options} data={chartData} />
      ) : (
        <p className="text-sm text-muted-foreground">No symptom data available.</p>
      )}
    </div>
  );
} 