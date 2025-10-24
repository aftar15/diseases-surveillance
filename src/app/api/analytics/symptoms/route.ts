import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get all reports using 'db'
    const reports = await db.report.findMany();
    // Infer type from the findMany result
    type ReportType = typeof reports[number];
    
    // Define the set of symptoms we want to track
    const symptomsSet = [
      "High Fever", 
      "Severe Headache", 
      "Pain Behind Eyes", 
      "Joint/Muscle Pain", 
      "Skin Rash", 
      "Mild Bleeding", 
      "Nausea/Vomiting"
    ];
    
    // Initialize counts for each symptom
    const symptomCounts = Object.fromEntries(
      symptomsSet.map(symptom => [symptom, 0])
    );
    
    // Count occurrences of each symptom
    reports.forEach((report: ReportType) => {
      // Parse symptoms from JSON string if needed
      // Ensure symptoms field exists and is handled correctly
      const reportSymptoms = typeof report.symptoms === 'string'
        ? JSON.parse(report.symptoms as string)
        : Array.isArray(report.symptoms) ? report.symptoms : []; // Handle non-array cases
      
      // Increment count for each symptom in this report
      reportSymptoms.forEach((symptom: string) => {
        if (symptomCounts.hasOwnProperty(symptom)) {
          symptomCounts[symptom]++;
        }
      });
    });
    
    // Format data for chart
    return NextResponse.json({
      symptoms: Object.keys(symptomCounts),
      counts: Object.values(symptomCounts)
    });
  } catch (error) {
    console.error("Error fetching symptom analytics:", error);
    return NextResponse.json(
      { error: "Failed to retrieve symptom data" },
      { status: 500 }
    );
  }
} 