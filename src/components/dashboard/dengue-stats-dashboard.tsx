"use client";

import { useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { DengueStatsOverview } from "@/components/stats/stats-overview";
import { cn } from "@/lib/utils";

// Update the interface to match data from getDashboardData
interface DengueData {
  totalCases: number;
  activeCases: number; // Interpreted as validated
  pendingCases: number; 
  rejectedCases: number;
  weeklyCases: number; 
}

interface DengueStatsDashboardProps {
  className?: string;
  data: DengueData; 
  isLoading?: boolean; 
}

export function DengueStatsDashboard({
  className,
  data, 
  isLoading = false,
}: DengueStatsDashboardProps) {
  if (isLoading) {
    return <div className={cn("space-y-6 animate-pulse", className)}>Loading...</div>;
  }

  if (!data) {
    return <div className={cn("space-y-6", className)}>No data available.</div>;
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Disease Statistics</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Info className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md md:max-w-lg">
            <SheetHeader>
              <SheetTitle>Case Statistics Summary</SheetTitle>
              <SheetDescription>
                Overview of reported disease cases by status.
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-4">
               <div>
                 <h3 className="font-medium mb-2">Case Counts by Status</h3>
                 <ul className="text-sm space-y-1">
                    <li>Total Reported: {data.totalCases.toLocaleString()}</li>
                    <li>Active (Validated): {data.activeCases.toLocaleString()}</li>
                    <li>Pending Validation: {data.pendingCases.toLocaleString()}</li>
                    <li>Rejected: {data.rejectedCases.toLocaleString()}</li>
                 </ul>
               </div>
                <div>
                 <h3 className="font-medium mb-2">Recent Reports</h3>
                 <p className="text-sm">Reports in Last 7 Days: {data.weeklyCases.toLocaleString()}</p>
               </div>
            </div>
            
            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <Button>Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      <DengueStatsOverview
        totalCases={data.totalCases}
        activeCases={data.activeCases}
        pendingCases={data.pendingCases}
        weeklyCases={data.weeklyCases}
        isLoading={isLoading}
      />
    </div>
  );
} 