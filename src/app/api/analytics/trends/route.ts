import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get the date range (last 30 days by default)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    // Calculate the start date
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Format dates for SQL query
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    
    // Generate array of all dates in the period
    const dateArray: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Get reports grouped by date
    const reportsByDate = await db.report.groupBy({
      by: ['reportDate'],
      _count: { _all: true },
      where: {
        reportDate: {
          gte: formattedStartDate,
          lte: formattedEndDate
        }
      },
      orderBy: {
        reportDate: 'asc'
      }
    });
    // Infer type for group results
    type ReportGroupType = typeof reportsByDate[number];
    
    // Get confirmed cases (validated reports) grouped by date
    const confirmedByDate = await db.report.groupBy({
      by: ['reportDate'],
      _count: { _all: true },
      where: {
        reportDate: {
          gte: formattedStartDate,
          lte: formattedEndDate
        },
        status: 'validated'
      },
      orderBy: {
        reportDate: 'asc'
      }
    });
    
    // Initialize arrays for chart data
    const reportedCounts = new Array(dateArray.length).fill(0);
    const confirmedCounts = new Array(dateArray.length).fill(0);
    
    // Fill in the reported cases
    reportsByDate.forEach((report: ReportGroupType) => {
      const dateStr = new Date(report.reportDate).toISOString().split('T')[0];
      const index = dateArray.indexOf(dateStr);
      if (index !== -1) {
        reportedCounts[index] = report._count._all;
      }
    });
    
    // Fill in the confirmed cases
    confirmedByDate.forEach((report: ReportGroupType) => {
      const dateStr = new Date(report.reportDate).toISOString().split('T')[0];
      const index = dateArray.indexOf(dateStr);
      if (index !== -1) {
        confirmedCounts[index] = report._count._all;
      }
    });
    
    return NextResponse.json({
      dates: dateArray,
      reportedCounts,
      confirmedCounts
    });
  } catch (error) {
    console.error("Error fetching trend data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve trend data" },
      { status: 500 }
    );
  }
} 