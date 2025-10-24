"use server"; // Mark this module for server-side execution if needed

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Helper function to calculate distance between two points (moved here)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Simple Euclidean distance - a real system would use Haversine formula
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
}

/**
 * Generates or updates hotspot data based on validated reports.
 * Fetches validated reports, clusters them, calculates intensity, 
 * and updates the `hotspot` table in the database.
 */
export async function generateAndUpdateHotspots(): Promise<{ success: boolean; message: string; hotspotCount?: number; error?: unknown }> {
  try {
    // Get all reports that are validated
    const validatedReports = await db.report.findMany({
      where: {
        status: 'validated'
      },
      select: { // Select only necessary fields
          id: true, 
          latitude: true, 
          longitude: true, 
          reportDate: true 
      } 
    });

    // Check if there are any validated reports
    if (!validatedReports || validatedReports.length === 0) {
      console.log("No validated reports found to generate hotspots.");
      // Optionally clear existing hotspots if needed, or just return success
      // await db.hotspot.deleteMany({}); // Example: Clear old hotspots if no validated reports exist
      return { success: true, message: "No validated reports found, hotspot generation skipped.", hotspotCount: 0 };
    }

    // Infer the type for selected fields
    type ValidatedReportType = {
        id: string;
        latitude: number;
        longitude: number;
        reportDate: Date;
    };

    // Group reports by proximity
    const clusters: { centerLat: number; centerLng: number; reports: ValidatedReportType[] }[] = [];
    const DISTANCE_THRESHOLD = 0.01; // Approx 1km threshold

    validatedReports.forEach((report: ValidatedReportType) => {
      let addedToCluster = false;
      for (const cluster of clusters) {
        const distance = calculateDistance(
          report.latitude, 
          report.longitude, 
          cluster.centerLat, 
          cluster.centerLng
        );
        
        if (distance <= DISTANCE_THRESHOLD) {
          cluster.reports.push(report);
          const totalReports = cluster.reports.length;
          cluster.centerLat = ((cluster.centerLat * (totalReports - 1)) + report.latitude) / totalReports;
          cluster.centerLng = ((cluster.centerLng * (totalReports - 1)) + report.longitude) / totalReports;
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.push({
          centerLat: report.latitude,
          centerLng: report.longitude,
          reports: [report]
        });
      }
    });
    
    // Create or update hotspots based on clusters
    const hotspotOperations: Prisma.PrismaPromise<any>[] = [];
    const validClusters = clusters.filter(c => c.reports.length > 1); // Filter clusters that meet threshold

    // --- Strategy: Delete existing hotspots and recreate ---
    // This simplifies logic compared to finding and updating existing ones,
    // especially if cluster centers shift significantly.
    
    // 1. Delete all existing hotspots (consider if this is appropriate for your use case)
    // If you need to preserve hotspot IDs or historical data, update logic is needed instead.
    await db.hotspot.deleteMany({}); 

    // 2. Create new hotspots for valid clusters
    validClusters.forEach(cluster => {
      const intensity = Math.min(1, (cluster.reports.length / 10)); // Scale up to max of 1.0
      const reportDates = cluster.reports.map(r => new Date(r.reportDate));
      const lastReportDate = new Date(Math.max(...reportDates.map(date => date.getTime())));
      
      hotspotOperations.push(db.hotspot.create({
        data: {
          latitude: cluster.centerLat,
          longitude: cluster.centerLng,
          intensity,
          reportCount: cluster.reports.length,
          lastReportDate
        }
      }));
    });

    // Execute all create operations
    await Promise.all(hotspotOperations);
    
    console.log(`Hotspot generation complete. ${validClusters.length} hotspots created/updated.`);
    return { 
      success: true, 
      message: "Hotspot analysis completed successfully",
      hotspotCount: validClusters.length 
    };

  } catch (error) {
    console.error("Error generating hotspots:", error);
    return { 
      success: false, 
      message: "Failed to generate hotspots",
      error: error 
    };
  }
} 