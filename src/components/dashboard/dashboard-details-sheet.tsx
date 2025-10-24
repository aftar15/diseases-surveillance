"use client";

import { InfoIcon } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  weeklyReports: number;
}

interface DashboardDetailsSheetProps {
  stats: DashboardStats;
}

export function DashboardDetailsSheet({ stats }: DashboardDetailsSheetProps) {
  const percentageActive = stats.totalCases > 0 
    ? ((stats.activeCases / stats.totalCases) * 100).toFixed(1) 
    : "0";
  const percentagePending = stats.totalCases > 0 
    ? ((stats.pendingCases / stats.totalCases) * 100).toFixed(1) 
    : "0";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-emerald-200 hover:bg-emerald-100 w-fit h-10">
          <InfoIcon className="mr-2 h-4 w-4 text-emerald-600" /> 
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">Details</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dashboard Statistics Details</SheetTitle>
          <SheetDescription>
            Comprehensive overview of disease monitoring statistics
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Cases</span>
                  <span className="text-2xl font-bold text-primary">{stats.totalCases.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active (Validated) Cases</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">{stats.activeCases.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-2">({percentageActive}%)</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentageActive}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Validation</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-yellow-600">{stats.pendingCases.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-2">({percentagePending}%)</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${percentagePending}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Reports Last 7 Days</span>
                  <span className="text-xl font-bold text-blue-600">{stats.weeklyReports.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Average per Day</span>
                  <span className="text-xl font-bold text-purple-600">
                    {(stats.weeklyReports / 7).toFixed(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Updated</span>
                <span className="font-medium">Real-time</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-600">● Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monitoring Region</span>
                <span className="font-medium">San Jose, Dinagat Islands</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button className="w-full">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

