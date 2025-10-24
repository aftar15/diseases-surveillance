import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3Icon, TrendingUpIcon, MapPinIcon, CalendarIcon, Activity } from "lucide-react";
import { TrendChart } from "@/components/charts/client-trend-chart";
import { SymptomChart } from "@/components/charts/client-symptom-chart";
import { CaseGrowthChart } from "@/components/charts/client-case-growth-chart";
import { DiseaseCountsCard } from "@/components/analytics/disease-counts-card";
import { db } from "@/lib/db"; // Import the shared instance
import { subWeeks, format } from 'date-fns';

// Define the type to match the RegionData interface
interface RegionData {
  name: string;
  cases: number;
  activeCases: number;
  recovered: number;
  deaths: number;
  weeklyChange?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
  fatalityRate?: number;
}

// Type for the result of the Prisma groupBy query
interface ReportGroupByResult {
  barangayId: string | null;
  _count: {
    _all: number;
  };
}

// Type for the weekly growth data
interface GrowthDataPoint {
  week: string; // Format like "YYYY-MM-DD" (start of the week)
  growthRate: number; // Percentage
}

// Type for the symptom distribution data
interface SymptomDataPoint {
  name: string;
  count: number;
}

async function getRegionalStats(): Promise<RegionData[]> {
  // --- Database Fetching Logic ---
  // NOTE: This is a basic example. You'll need to adapt the Prisma query
  // and calculations based on your actual schema and business logic
  // for active cases, recovered, deaths, weekly change, and risk level.

  try {
    // Group reports by barangayId instead of region
    const reportCountsByRegion = await db.report.groupBy({
      by: ['barangayId'], // Use the correct field name
      _count: { 
        _all: true 
      }, 
      // Add 'where' clauses if needed (e.g., filter by date range, status)
    });

    // Map the raw counts to the RegionData structure, using barangayId
    const regionalData = reportCountsByRegion.map((item): RegionData => ({
      name: item.barangayId || "Unknown Barangay", // Use the correct field name and fallback
      cases: item._count._all,
      activeCases: Math.floor(item._count._all * 0.2),
      recovered: Math.floor(item._count._all * 0.7),
      deaths: Math.floor(item._count._all * 0.02),
      fatalityRate: 0.02,
      weeklyChange: Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 10),
      riskLevel: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as RegionData['riskLevel'],
    }));

    // TODO: Implement more accurate calculations for:
    // - activeCases (e.g., based on report status and date)
    // - recovered (e.g., based on report status)
    // - deaths (e.g., based on a specific report status or field)
    // - weeklyChange (comparing counts from this week vs. last week)
    // - riskLevel (based on defined criteria like case density, growth rate)

    return regionalData;

  } catch (error) {
    console.error("Error fetching regional stats:", error);
    throw new Error("Could not fetch regional statistics.");
  } finally {
    // Disconnect Prisma client when done in serverless environments - Not needed for singleton
    // await db.$disconnect();
  }
}

// --- New function to get weekly growth data --- 
async function getWeeklyGrowthData(): Promise<GrowthDataPoint[]> {
  // NOTE: This is placeholder data generation. 
  // Real implementation requires grouping reports by week and calculating percentage change.
  try {
    const numberOfWeeks = 8;
    const data: GrowthDataPoint[] = [];
    const today = new Date();

    for (let i = numberOfWeeks - 1; i >= 0; i--) {
      const weekStartDate = subWeeks(today, i);
      // Simulate growth rate fluctuations
      const growthRate = (Math.random() - 0.3) * 15 + Math.sin(i) * 5; 
      data.push({
        week: format(weekStartDate, 'yyyy-MM-dd'), // Use date-fns for formatting
        growthRate: parseFloat(growthRate.toFixed(1))
      });
    }
    return data;

    // TODO: Replace placeholder logic with actual Prisma query:
    // 1. Query reports, potentially filtering by date range (last N weeks).
    // 2. Group reports by week (using database functions if possible, or process in code).
    // 3. Calculate the count for each week.
    // 4. Calculate the percentage change from the previous week.
    // 5. Format the data as GrowthDataPoint[].

  } catch (error) {
    console.error("Error fetching weekly growth data:", error);
    throw new Error("Could not fetch weekly growth data.");
  }
}

// --- New function to get symptom distribution data --- 
async function getSymptomDistributionData(): Promise<SymptomDataPoint[]> {
  // NOTE: This is placeholder data generation.
  // Real implementation requires fetching reports, parsing the JSON 'symptoms' field,
  // and aggregating counts for each unique symptom.
  try {
    // Placeholder data - replace with actual aggregation
    const data: SymptomDataPoint[] = [
      { name: "High Fever", count: Math.floor(Math.random() * 200) + 50 },
      { name: "Severe Headache", count: Math.floor(Math.random() * 150) + 40 },
      { name: "Pain Behind Eyes", count: Math.floor(Math.random() * 100) + 30 },
      { name: "Joint/Muscle Pain", count: Math.floor(Math.random() * 180) + 60 },
      { name: "Skin Rash", count: Math.floor(Math.random() * 90) + 25 },
      { name: "Mild Bleeding", count: Math.floor(Math.random() * 50) + 10 },
      { name: "Nausea/Vomiting", count: Math.floor(Math.random() * 70) + 20 },
    ].sort((a, b) => b.count - a.count); // Sort descending by count
    
    return data.slice(0, 5); // Return top 5 for simplicity

    // TODO: Replace placeholder logic with actual Prisma query & processing:
    // 1. Fetch all (or relevant recent) reports: `await db.report.findMany({ select: { symptoms: true } });`
    // 2. Initialize an empty map or object to store symptom counts.
    // 3. Iterate through reports:
    //    - Parse the `symptoms` JSON array for each report.
    //    - For each symptom string in the array, increment its count in the map.
    // 4. Convert the map into an array of { name: string, count: number } objects.
    // 5. Sort the array by count (descending).
    // 6. Return the formatted data.

  } catch (error) {
    console.error("Error fetching symptom distribution data:", error);
    throw new Error("Could not fetch symptom distribution data.");
  }
}

export const metadata = {
  title: "Analytics | DSMS",
  description: "Disease outbreak analytics and statistics",
};

// Make the page component async to fetch data
export default async function AnalyticsPage() {
  // Fetch all data, even if not all is displayed immediately
  const regionalStats = await getRegionalStats(); // Still fetched but not used in JSX below
  const weeklyGrowthData = await getWeeklyGrowthData();
  const symptomData = await getSymptomDistributionData();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze disease trends, hotspots, and statistics
        </p>
      </div>

      {/* Tabs: Trends and Disease Reports */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="diseases">
            <Activity className="h-4 w-4 mr-2" />
            Disease Reports
          </TabsTrigger>
          {/* Remove Regions, Reports, Historical Triggers */}
          {/* <TabsTrigger value="regions"> ... </TabsTrigger> */}
          {/* <TabsTrigger value="reports"> ... </TabsTrigger> */}
          {/* <TabsTrigger value="historical"> ... </TabsTrigger> */}
        </TabsList>

        {/* Keep only Trends Content */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disease Case Trends</CardTitle>
              <CardDescription>
                Case trends over the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse rounded-md" />}>
                <TrendChart />
              </Suspense>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Case Growth Rate</CardTitle>
                <CardDescription>
                  Weekly growth percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse rounded-md" />}>
                  <CaseGrowthChart data={weeklyGrowthData} />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Symptom Distribution</CardTitle>
                <CardDescription>
                  Common symptoms reported
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse rounded-md" />}>
                  <SymptomChart data={symptomData} /> 
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Disease Reports Content */}
        <TabsContent value="diseases" className="space-y-4">
          <DiseaseCountsCard />
        </TabsContent>

        {/* Remove Regions Content */}
        {/* <TabsContent value="regions" className="space-y-4"> ... </TabsContent> */}

        {/* Remove Reports Content */}
        {/* <TabsContent value="reports" className="space-y-4"> ... </TabsContent> */}

        {/* Remove Historical Content */}
        {/* <TabsContent value="historical" className="space-y-4"> ... </TabsContent> */}

      </Tabs>
    </div>
  );
} 