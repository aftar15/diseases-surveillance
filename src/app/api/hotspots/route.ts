import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { generateAndUpdateHotspots } from "@/lib/hotspot-utils"; // Import the refactored function

// Define the type for the report payload - REMOVED faulty definition
// type Report = Prisma.ReportGetPayload<{}>

// Define interface for database hotspot
interface DbHotspot {
  id: string;
  latitude: number;
  longitude: number;
  intensity: number;
  reportCount: number;
  lastReportDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// GET handler to retrieve hotspots
export async function GET(request: NextRequest) {
  // --- Restore Original Logic ---
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const minIntensity = parseFloat(searchParams.get('minIntensity') || '0');
    const maxResults = parseInt(searchParams.get('maxResults') || '100');
    
    // Fetch hotspots from the database
    const hotspots = await db.hotspot.findMany({
      where: {
        intensity: {
          gte: minIntensity
        }
      },
      orderBy: {
        intensity: 'desc'
      },
      take: maxResults
    });
    
    // Transform to GeoJSON format for map visualization
    const geoJsonFeatures = hotspots.map((hotspot: DbHotspot) => ({
      type: "Feature",
      properties: {
        id: hotspot.id,
        intensity: hotspot.intensity,
        reportCount: hotspot.reportCount,
        lastReportDate: hotspot.lastReportDate.toISOString()
      },
      geometry: {
        type: "Point",
        coordinates: [hotspot.longitude, hotspot.latitude]
      }
    }));
    
    const geoJson = {
      type: "FeatureCollection",
      features: geoJsonFeatures
    };
    
    return NextResponse.json(geoJson);
  } catch (error) {
    console.error("Error fetching hotspots:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotspots" },
      { status: 500 }
    );
  }
}

// POST handler now calls the refactored function
export async function POST() {
  console.log("POST /api/hotspots called - Triggering hotspot generation...");
  const result = await generateAndUpdateHotspots();

  if (result.success) {
    return NextResponse.json({ 
      success: true, 
      message: result.message,
      hotspotCount: result.hotspotCount
    });
  } else {
    console.error("Error generating hotspots via POST:", result.error);
    return NextResponse.json(
      { error: result.message || "Failed to generate hotspots" },
      { status: 500 }
    );
  }
}

// Remove the helper function from here (moved to hotspot-utils)
/*
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Simple Euclidean distance - a real system would use Haversine formula for accurate geo-distance
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
}
*/ 