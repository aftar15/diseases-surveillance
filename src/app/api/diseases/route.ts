import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET handler to retrieve all diseases with their symptoms
export async function GET() {
  try {
    const diseases = await db.disease.findMany({
      where: {
        isActive: true
      },
      include: {
        symptoms: {
          include: {
            symptom: true
          }
        }
      },
      orderBy: [
        {
          category: 'asc'
        },
        {
          name: 'asc'
        }
      ]
    });

    // Transform the data to a more usable format
    const transformedDiseases = diseases.map(disease => ({
      id: disease.id,
      name: disease.name,
      category: disease.category,
      description: disease.description,
      symptoms: disease.symptoms.map(ds => ({
        id: ds.symptom.id,
        name: ds.symptom.name,
        severity: ds.severity,  // From DiseaseSymptom, not Symptom
        isCommon: ds.isCommon
      }))
    }));

    return NextResponse.json(transformedDiseases);
  } catch (error) {
    console.error("Error fetching diseases:", error);
    return NextResponse.json(
      { error: "Failed to retrieve diseases" },
      { status: 500 }
    );
  }
}
