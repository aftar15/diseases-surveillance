import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { subDays } from 'date-fns';
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardDetailsSheet } from "@/components/dashboard/dashboard-details-sheet";
import { DiseaseCountsCard } from "@/components/analytics/disease-counts-card";
import { 
  UsersIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ActivityIcon,
  InfoIcon
} from "lucide-react";

// Define the structure for the statistics data
interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  weeklyReports: number;
}

// Function to fetch dashboard statistics
async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const totalCases = await db.report.count();
    const activeCases = await db.report.count({
      where: { status: 'validated' }, // Assuming 'validated' means active
    });
    const pendingCases = await db.report.count({
      where: { status: 'pending' },
    });
    
    // Calculate the date 7 days ago
    const sevenDaysAgo = subDays(new Date(), 7);

    const weeklyReports = await db.report.count({
       where: {
         reportDate: {
           gte: sevenDaysAgo, // Greater than or equal to seven days ago
         },
       },
    });

    return { totalCases, activeCases, pendingCases, weeklyReports };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return zero values in case of error
    return { totalCases: 0, activeCases: 0, pendingCases: 0, weeklyReports: 0 };
  }
}

export const metadata = {
  title: "Dashboard | Disease Monitoring System",
  description: "Monitor and analyze disease statistics", // Updated description
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-4 sm:space-y-6 bg-gradient-to-br from-emerald-50/50 to-white rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
            <h1 className="font-bold tracking-tight text-emerald-900">Disease Monitoring Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
            Monitor disease statistics and trends
            </p>
        </div>
        <DashboardDetailsSheet stats={stats} />
      </div>

      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-emerald-800">Disease Statistics</h2>

      {/* Use the new StatsCards client component */}
      <StatsCards stats={stats} />

      {/* Disease Counts Section */}
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-emerald-800 mb-4">
          Disease Report Breakdown
        </h2>
        <DiseaseCountsCard />
      </div>

      {/* Remove the direct rendering of cards */}
      {/* 
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card> ... </Card>
        <Card> ... </Card>
        <Card> ... </Card>
        <Card> ... </Card>
      </div>
      */}

      {/* Placeholder for more dashboard sections */}
      {/* 
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>Recent Reports</CardHeader>
          <CardContent>...</CardContent>
        </Card>
        <Card>
          <CardHeader>Alerts Overview</CardHeader>
          <CardContent>...</CardContent>
        </Card>
      </div>
      */}
    </div>
  );
} 