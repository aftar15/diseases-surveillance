"use client";

import { useState } from "react";
import { 
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, MapPin, BarChart2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/stats/stat-card";

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

interface RegionalStatsProps {
  regions: RegionData[];
  className?: string;
  isLoading?: boolean;
  withSheet?: boolean;
}

export function RegionalStats({
  regions,
  className,
  isLoading = false,
  withSheet = true,
}: RegionalStatsProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  const getRiskColorClass = (risk?: string) => {
    switch (risk) {
      case "low": return "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400";
      case "medium": return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400";
      case "high": return "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400";
      case "critical": return "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400";
      default: return "bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400";
    }
  };

  const StatsContent = () => (
    <>
      <div>
        <h3 className="font-medium mb-2">Region Overview</h3>
        <div className="rounded-md border">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-2 px-4 py-3 font-medium text-sm">
            <div>Region</div>
            <div className="text-right">Cases</div>
            <div className="text-right">Active</div>
            <div className="hidden md:block text-right">Recovered</div>
            <div className="hidden md:block text-right">Deaths</div>
            <div className="hidden md:block text-right">Risk Level</div>
          </div>
          <div className="divide-y">
            {regions.map((region) => (
              <div 
                key={region.name}
                className={cn(
                  "grid grid-cols-3 md:grid-cols-6 gap-x-2 px-4 py-3 text-sm hover:bg-muted/50 cursor-pointer",
                  selectedRegion?.name === region.name && "bg-muted/70"
                )}
                onClick={() => setSelectedRegion(region)}
              >
                <div className="font-medium">{region.name}</div>
                <div className="text-right">{region.cases.toLocaleString()}</div>
                <div className="text-right">{region.activeCases.toLocaleString()}</div>
                <div className="hidden md:block text-right">{region.recovered.toLocaleString()}</div>
                <div className="hidden md:block text-right">{region.deaths.toLocaleString()}</div>
                <div className="hidden md:block text-right">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getRiskColorClass(region.riskLevel)
                  )}>
                    {region.riskLevel ? region.riskLevel.charAt(0).toUpperCase() + region.riskLevel.slice(1) : "Unknown"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedRegion && (
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-3">Details for {selectedRegion.name}</h3>
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="risk">
                <BarChart2 className="h-4 w-4 mr-2" />
                Risk Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  title="Total Cases"
                  value={selectedRegion.cases.toLocaleString()}
                  trend={selectedRegion.weeklyChange === undefined ? undefined : selectedRegion.weeklyChange > 0 ? "up" : "down"}
                  trendValue={selectedRegion.weeklyChange ? `${Math.abs(selectedRegion.weeklyChange)}%` : undefined}
                  trendLabel="vs last week"
                />
                <StatCard
                  title="Active Cases"
                  value={selectedRegion.activeCases.toLocaleString()}
                />
                <StatCard
                  title="Recovered"
                  value={selectedRegion.recovered.toLocaleString()}
                />
                <StatCard
                  title="Fatality Rate"
                  value={selectedRegion.fatalityRate !== undefined ? `${(selectedRegion.fatalityRate * 100).toFixed(1)}%` : "N/A"}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="trends">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Weekly Case Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[150px] border rounded-md flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Trend chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="risk">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Risk Level:</span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getRiskColorClass(selectedRegion.riskLevel)
                      )}>
                        {selectedRegion.riskLevel ? selectedRegion.riskLevel.charAt(0).toUpperCase() + selectedRegion.riskLevel.slice(1) : "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );

  // If withSheet is false, just render the content directly
  if (!withSheet) {
    return (
      <div className={cn("space-y-6", className)}>
        <StatsContent />
      </div>
    );
  }

  // Otherwise wrap with Sheet component
  return (
    <div className={cn("space-y-4", className)}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <MapPin className="mr-2 h-4 w-4" />
            View Regional Stats
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
          <SheetHeader>
            <SheetTitle>Regional Disease Statistics</SheetTitle>
            <SheetDescription>
              Detailed breakdown of disease cases by region
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <StatsContent />
          </div>
          
          <SheetFooter className="pt-4 mt-6">
            <SheetClose asChild>
              <Button>Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
} 