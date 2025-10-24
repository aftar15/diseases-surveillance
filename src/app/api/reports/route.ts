import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DiseaseReport } from "@/types";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { generateAndUpdateHotspots } from "@/lib/hotspot-utils";
import { emitNewValidatedReport, emitHotspotsUpdate } from "@/lib/socket-server";

// Updated validation schema for report submissions
const reportSchema = z.object({
  reporterName: z.string().min(1, "Reporter name is required"),
  reporterNumber: z.string().min(10, "Valid phone number is required")
    .regex(/^\+?[0-9\s-()]+$/, "Please enter a valid phone number"),
  locationId: z.string().optional(), // Keep optional if coords are primary
  barangayId: z.string().optional(), // Keep if still relevant for some logic, otherwise remove
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  diseaseId: z.string().min(1, "Disease selection is required"),
  symptoms: z.array(z.string()).min(1, "At least one symptom must be selected"),
  notes: z.string().optional()
});

// Validation schema for report updates
const updateReportSchema = z.object({
  id: z.string(),
  symptoms: z.array(z.string()).min(1, "At least one symptom must be selected"),
  notes: z.string().optional(),
  status: z.enum(["pending", "validated", "rejected"]).optional(),
});

// Validation schema for report validation/rejection
const validationSchema = z.object({
  id: z.string(),
  action: z.enum(["validate", "reject"]),
  validatedBy: z.string()
});

// Validation schema for report deletion
const deleteReportSchema = z.object({
  id: z.string()
});

// Helper function to map database report to API response
function mapReportToResponse(report: any): DiseaseReport {
  // Parse symptoms from JSON string to array if needed
  const symptoms = typeof report.symptoms === 'string' 
    ? JSON.parse(report.symptoms) 
    : report.symptoms;
  
  return {
    id: report.id,
    location: { 
      lat: report.latitude, 
      lng: report.longitude 
    },
    locationId: report.locationId,
    barangayId: report.barangayId,
    diseaseId: report.diseaseId,
    symptoms: symptoms,
    reportDate: report.reportDate.toISOString(),
    status: report.status,
    validatedBy: report.validatedBy,
    validatedAt: report.validatedAt ? report.validatedAt.toISOString() : undefined,
    notes: report.notes || undefined,
    reporterName: report.reporterName,
    reporterNumber: report.reporterNumber
  };
}

// Helper function to map database report to API response with symptom names
function mapReportToResponseWithNames(report: any, symptomMap: Map<string, string>): DiseaseReport {
  // Parse symptoms from JSON string to array if needed
  const symptomIds = typeof report.symptoms === 'string' 
    ? JSON.parse(report.symptoms) 
    : report.symptoms;
  
  // Convert symptom IDs to names
  const symptomNames = Array.isArray(symptomIds) 
    ? symptomIds.map(id => symptomMap.get(id) || `Unknown symptom (${id})`)
    : [];
  
  return {
    id: report.id,
    location: { 
      lat: report.latitude, 
      lng: report.longitude 
    },
    locationId: report.locationId,
    barangayId: report.barangayId,
    diseaseId: report.diseaseId,
    diseaseName: report.disease?.name || 'Unknown Disease',
    symptoms: symptomNames,
    reportDate: report.reportDate.toISOString(),
    status: report.status,
    validatedBy: report.validatedBy,
    validatedAt: report.validatedAt ? report.validatedAt.toISOString() : undefined,
    notes: report.notes || undefined,
    reporterName: report.reporterName,
    reporterNumber: report.reporterNumber
  };
}

// POST handler for report submissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data using updated schema
    const result = reportSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Use validated data
    const validatedData = result.data;
    
    // Create a new report in the database, including new fields
    const dbReport = await db.report.create({
      data: {
        reporterName: validatedData.reporterName,
        reporterNumber: validatedData.reporterNumber,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        locationId: validatedData.locationId || null,
        barangayId: validatedData.barangayId || null,
        diseaseId: validatedData.diseaseId,
        symptoms: JSON.stringify(validatedData.symptoms),
        notes: validatedData.notes || null,
      }
    });
    
    // Map the database report to the API response format
    // const report = mapReportToResponse(dbReport); // Not needed for response
    
    // Revalidate the path where the map is likely displayed
    revalidatePath('/dashboard'); 
    // If the map is on a different page, adjust the path above
    
    return NextResponse.json({ success: true, reportId: dbReport.id }, { status: 201 });
  } catch (error) {
    console.error("Error processing report submission:", error);
    return NextResponse.json(
      { error: "Failed to process report submission" },
      { status: 500 }
    );
  }
}

// GET handler to retrieve reports
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    
    // Build where clause based on filters
    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    
    // Fetch reports from the database with optional filtering and include disease info
    const dbReports = await db.report.findMany({
      where: whereClause,
      include: {
        disease: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        reportDate: 'desc'
      }
    });
    
    // Get all unique symptom IDs from all reports
    const allSymptomIds = new Set<string>();
    dbReports.forEach(report => {
      const symptoms = typeof report.symptoms === 'string' 
        ? JSON.parse(report.symptoms) 
        : report.symptoms;
      if (Array.isArray(symptoms)) {
        symptoms.forEach(id => allSymptomIds.add(id));
      }
    });
    
    // Fetch symptom names for all IDs
    const symptoms = await db.symptom.findMany({
      where: {
        id: { in: Array.from(allSymptomIds) }
      },
      select: {
        id: true,
        name: true
      }
    });
    
    // Create a map for quick lookup
    const symptomMap = new Map(symptoms.map(s => [s.id, s.name]));
    
    // Map the database reports to the API response format with symptom names
    const reports = dbReports.map(report => mapReportToResponseWithNames(report, symptomMap));
    
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// PUT handler to update a report
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const result = updateReportSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Find the report to update
    const existingReport = await db.report.findUnique({
      where: { id: body.id }
    });
    
    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }
    
    // Update the report in the database
    const updateData: any = {
      symptoms: JSON.stringify(body.symptoms),
      notes: body.notes !== undefined ? body.notes : existingReport.notes
    };
    
    // If status is being changed, update it and set validation fields
    if (body.status && body.status !== existingReport.status) {
      updateData.status = body.status;
      
      // If changing to validated or rejected, set validation metadata
      if (body.status === "validated" || body.status === "rejected") {
        updateData.validatedBy = "Admin User"; // In production, use actual user
        updateData.validatedAt = new Date();
      }
    }
    
    const dbReport = await db.report.update({
      where: { id: body.id },
      data: updateData
    });
    
    // Trigger hotspot regeneration if status was changed to validated
    if (body.status === 'validated' && body.status !== existingReport.status) {
      console.log(`Report ${body.id} status changed to validated. Triggering hotspot regeneration...`);
      const hotspotResult = await generateAndUpdateHotspots();
      if (hotspotResult.success) {
        console.log("Hotspot regeneration successful after status change.");
        revalidatePath('/dashboard');
        
        // Emit socket event for new validated report
        emitNewValidatedReport(dbReport);
        emitHotspotsUpdate();
      } else {
        console.error("Hotspot regeneration failed:", hotspotResult.error);
      }
    }
    
    // Map the database report to the API response format
    const report = mapReportToResponse(dbReport);
    
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

// PATCH handler for validating/rejecting reports
export async function PATCH(request: NextRequest) {
  let hotspotGenerationResult: { success: boolean; message?: string; error?: unknown } | null = null;
  try {
    const body = await request.json();
    const result = validationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { id, action, validatedBy } = result.data;

    // Find the report to validate/reject
    const existingReport = await db.report.findUnique({
      where: { id: id }
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Determine the new status
    const status = action === "validate" ? "validated" : "rejected";

    // Update the report status in the database
    const dbReport = await db.report.update({
      where: { id: id },
      data: {
        status,
        validatedBy: validatedBy,
        validatedAt: new Date()
      }
    });

    // --- Trigger hotspot regeneration IF the report was validated ---
    if (status === 'validated') {
      console.log(`Report ${id} validated. Triggering hotspot regeneration...`);
      hotspotGenerationResult = await generateAndUpdateHotspots();
      if (hotspotGenerationResult.success) {
        console.log("Hotspot regeneration successful after validation.");
        // Revalidate dashboard path AFTER hotspots are updated
        revalidatePath('/dashboard');
        
        // Emit WebSocket event for hotspots update
        emitHotspotsUpdate();
      } else {
        // Log error but don't fail the validation request itself
        console.error("Hotspot regeneration failed after validation:", hotspotGenerationResult.message, hotspotGenerationResult.error);
      }
    }
    // ---------------------------------------------------------------

    // Map the updated database report to the API response format
    const report = mapReportToResponse(dbReport);
    
    // Emit WebSocket event for new validated report
    if (status === 'validated') {
      emitNewValidatedReport(report);
    }

    return NextResponse.json({ 
      success: true, 
      report, 
      hotspotStatus: hotspotGenerationResult // Optionally include hotspot status in response
    });

  } catch (error) {
    console.error("Error validating/rejecting report:", error);
    return NextResponse.json(
      { error: "Failed to validate/reject report" },
      { status: 500 }
    );
  }
}

// DELETE handler for removing reports
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const result = deleteReportSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Find the report to delete
    const existingReport = await db.report.findUnique({
      where: { id: body.id }
    });
    
    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }
    
    // Delete the report from the database
    await db.report.delete({
      where: { id: body.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}

// Helper function to generate a UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 