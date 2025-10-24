import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapView } from "@/components/maps/client-map-view";
import { db } from "@/lib/db";
import { 
  ActivityIcon, 
  MapPinIcon, 
  InfoIcon, 
  TrendingUpIcon
} from "lucide-react";
import { ReportStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define interfaces for barangay data
interface Barangay {
  id: string;
  name: string;
}

// Remove interfaces and data fetching function for public stats
/*
interface PublicStatsData { ... }
async function getPublicStatsData(): Promise<PublicStatsData> { ... }
*/

// Make page component async
export default async function Home() { 
  
  // Fetch active cases count
  const activeCasesCount = await db.report.count({
    where: {
      status: ReportStatus.validated
    }
  });

  // Fetch reports grouped by location/barangay
  const reportsByLocation = await db.report.groupBy({
    by: ['barangayId', 'locationId'],
    where: {
      status: ReportStatus.validated
    },
    _count: {
      _all: true
    }
  });

  // Define an empty array for barangays as a fallback
  let barangays: Barangay[] = [];
  
  try {
    // Try to fetch barangay data - this will handle the case if the table doesn't exist yet
    barangays = await db.$queryRaw<Barangay[]>`
      SELECT id, name FROM barangays
    `;
  } catch (error) {
    console.error("Error fetching barangays:", error);
    // Continue with empty array if table doesn't exist
  }

  // Create a map of barangay IDs to names
  const barangayMap = barangays.reduce((acc: Record<string, string>, barangay: Barangay) => {
    acc[barangay.id] = barangay.name;
    return acc;
  }, {});

  // Process the data to create a display-friendly array
  const locationsData = reportsByLocation.map(item => {
    // Format the location name: if it's a barangay use its name, otherwise use locationId
    const locationName = item.barangayId 
      ? barangayMap[item.barangayId] || 'Unknown Barangay' 
      : (item.locationId || 'Unknown Location');
    
    return {
      name: locationName,
      count: item._count._all
    };
  })
  .sort((a, b) => b.count - a.count) // Sort by count in descending order
  .slice(0, 5); // Take top 5 locations

  return (
    <TooltipProvider>
      <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <h1 className="font-bold tracking-tight">Disease Surveillance Overview</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time visualization and statistics of disease cases and outbreaks
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {/* Enhanced Active Disease Cases Card */}
          <Card className="overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary font-semibold text-sm sm:text-base flex items-center">
                  <ActivityIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Active Disease Cases</span>
                  <span className="sm:hidden">Active Cases</span>
                </CardTitle>
                <Badge variant="outline" className="bg-primary/5 text-xs">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-end mb-2">
                <span className="text-3xl sm:text-4xl font-bold">{activeCasesCount}</span>
                {/* Only show trend if we know there's a change */}
                {activeCasesCount > 0 && (
                  <Badge className="ml-2 bg-green-100 text-green-700 mb-1 text-xs">
                    <TrendingUpIcon className="h-3 w-3 mr-1" />+2
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <p className="text-muted-foreground text-xs sm:text-sm">Currently validated cases</p>
                <p className="text-xs bg-primary/10 px-2 py-1 rounded-full w-fit">Updated just now</p>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Cases by Location Card */}
          <Card className="overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary font-semibold text-sm sm:text-base flex items-center">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Cases by Location</span>
                  <span className="sm:hidden">By Location</span>
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                      <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Locations with confirmed disease cases
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {locationsData.length > 0 ? (
                  locationsData.map((location, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-2 rounded-lg bg-background hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white text-xs mr-3 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">{location.name.replace(/-/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground">Last case: Today</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">
                          {location.count}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No location data available</p>
                )}
              </div>
              {locationsData.length > 0 && (
                <div className="flex justify-between items-center mt-4 pt-3 border-t text-xs text-muted-foreground">
                  <p className="flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1" /> 
                    Top reported locations
                  </p>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">View all</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MapView Card */}
        <Card className="overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="pb-2 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg">Disease Outbreak Map</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View active hotspots and validated reported disease cases
                </CardDescription>
              </div>
              <Badge className="text-xs sm:text-sm px-2 py-1 w-fit">
                {activeCasesCount} Active Cases
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[300px] sm:h-[400px] lg:h-[500px]">
            <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse" />}>
              <MapView className="w-full h-full" />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
