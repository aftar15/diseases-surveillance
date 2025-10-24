import { Metadata } from "next";
import { DashboardWrapper } from "@/components/auth/dashboard-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendChart } from "@/components/charts/client-trend-chart";
import { SymptomChart } from "@/components/charts/client-symptom-chart";
import { CaseGrowthChart } from "@/components/charts/client-case-growth-chart";
import { MapView } from "@/components/maps/client-map-view";
import { ReportAnalyticsCards } from "@/components/analytics/report-analytics-cards";
import { RiskAssessmentCard } from "@/components/analytics/risk-assessment-card";
import { ValidationTrendsChart } from "@/components/analytics/validation-trends-chart";
import { DiseaseCountsCard } from "@/components/analytics/disease-counts-card";
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  MapPinIcon, 
  RotateCcwIcon,
  RefreshCcwIcon,
  Activity
} from "lucide-react";
import { Suspense } from "react";
import { UserRole } from "@/types";
import { subWeeks, format } from 'date-fns';

export const metadata: Metadata = {
  title: "Analytics Dashboard | DSMS",
  description: "Advanced analytics and insights for disease outbreak monitoring",
};

// Function to fetch symptom data
async function getSymptomData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/symptoms`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch symptom data');
    }
    
    const data = await response.json();
    
    // Convert to expected format
    return data.symptoms.map((symptom: string, index: number) => ({
      name: symptom,
      count: data.counts[index]
    }));
  } catch (error) {
    console.error('Error fetching symptom data:', error);
    // Return placeholder data on error
    return [
      { name: "High Fever", count: 0 },
      { name: "Severe Headache", count: 0 },
      { name: "Pain Behind Eyes", count: 0 },
      { name: "Joint/Muscle Pain", count: 0 },
      { name: "Skin Rash", count: 0 },
    ];
  }
}

// Function to get weekly growth data
async function getWeeklyGrowthData() {
  const numberOfWeeks = 8;
  const data = [];
  const today = new Date();

  for (let i = numberOfWeeks - 1; i >= 0; i--) {
    const weekStartDate = subWeeks(today, i);
    // Simulate growth rate fluctuations
    const growthRate = (Math.random() - 0.3) * 15 + Math.sin(i) * 5;
    data.push({
      week: format(weekStartDate, 'MMM d'),
      growthRate: parseFloat(growthRate.toFixed(1))
    });
  }
  return data;
}

export default async function DashboardAnalyticsPage() {
  // Fetch the symptom data and growth data
  const symptomData = await getSymptomData();
  const weeklyGrowthData = await getWeeklyGrowthData();
  
  return (
    <DashboardWrapper allowedRoles={[UserRole.Admin, UserRole.HealthWorker, UserRole.Researcher]}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div>
            <h1 className="font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitor disease trends and generate insights
            </p>
          </div>
        </div>

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
            <TabsTrigger value="trends" className="flex items-center gap-1 text-xs sm:text-sm">
              <TrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Trends</span>
              <span className="sm:hidden">Trend</span>
            </TabsTrigger>
            <TabsTrigger value="regions" className="flex items-center gap-1 text-xs sm:text-sm">
              <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Regions</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 text-xs sm:text-sm">
              <BarChart3Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="diseases" className="flex items-center gap-1 text-xs sm:text-sm">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Diseases</span>
              <span className="sm:hidden">Dis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">Disease Case Trends</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Case trends over the past 30 days
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" title="Refresh data" className="h-8 w-8 sm:h-9 sm:w-9">
                  <RefreshCcwIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[200px] sm:h-[250px] lg:h-[300px]">
                <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse rounded-md" />}>
                  <TrendChart />
                </Suspense>
              </CardContent>
            </Card>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Case Growth Rate</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Weekly growth percentage
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" title="Refresh data" className="h-8 w-8 sm:h-9 sm:w-9">
                    <RefreshCcwIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[180px] sm:h-[200px]">
                  <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse rounded-md" />}>
                    <CaseGrowthChart data={weeklyGrowthData} />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Symptom Distribution</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Common symptoms reported
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" title="Refresh data" className="h-8 w-8 sm:h-9 sm:w-9">
                    <RefreshCcwIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[180px] sm:h-[200px]">
                  <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse rounded-md" />}>
                    <SymptomChart data={symptomData} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">Disease Hotspot Analysis</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Geographic distribution of disease cases with clustering
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 sm:h-9 text-xs sm:text-sm">
                    <RotateCcwIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Run Analysis</span>
                    <span className="sm:hidden">Analyze</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <MapView className="w-full" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Regional Risk Assessment</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Automated risk analysis by geographic region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskAssessmentCard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Report Analytics</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Analysis of report submissions and validation rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ReportAnalyticsCards />
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-4">Validation Trends Over Time</h3>
                    <ValidationTrendsChart />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diseases" className="space-y-4">
            <DiseaseCountsCard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardWrapper>
  );
}