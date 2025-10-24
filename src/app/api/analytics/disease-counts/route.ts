import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    // Get all reports with their disease information
    const reports = await db.report.groupBy({
      by: ['diseaseId'],
      _count: {
        _all: true
      },
      where: search ? {
        disease: {
          name: {
            contains: search
          }
        }
      } : undefined
    });

    // Fetch disease details for each grouped result
    const diseaseCountsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const disease = await db.disease.findUnique({
          where: { id: report.diseaseId },
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        });

        const countAll = report._count && typeof report._count === 'object' && '_all' in report._count 
          ? report._count._all 
          : 0;

        return {
          diseaseId: report.diseaseId,
          diseaseName: disease?.name || 'Unknown',
          category: disease?.category || 'unknown',
          description: disease?.description || '',
          totalReports: countAll,
          // Get status breakdown
          pendingCount: await db.report.count({
            where: {
              diseaseId: report.diseaseId,
              status: 'pending'
            }
          }),
          validatedCount: await db.report.count({
            where: {
              diseaseId: report.diseaseId,
              status: 'validated'
            }
          }),
          rejectedCount: await db.report.count({
            where: {
              diseaseId: report.diseaseId,
              status: 'rejected'
            }
          })
        };
      })
    );

    // Sort by total reports descending
    diseaseCountsWithDetails.sort((a, b) => b.totalReports - a.totalReports);

    return NextResponse.json(diseaseCountsWithDetails);
  } catch (error) {
    console.error("Error fetching disease counts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve disease statistics" },
      { status: 500 }
    );
  }
}
