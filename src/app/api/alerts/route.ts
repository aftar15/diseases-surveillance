import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Alert, Coordinates } from "@/types";
import { emitNewAlert, emitUpdateAlert, emitDeleteAlert } from "@/lib/socket-server";
import {
  getAllAlerts,
  getActiveAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deactivateAlert,
  deleteAlert
} from "@/lib/repositories/alert-repository";
import { verifyToken, TokenPayload } from "@/lib/auth";

// Validation schema for area coordinates
const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Validation schema for alert creation (removing createdBy)
const alertSchema = z.object({
  title: z.string().min(3).max(100),
  message: z.string().min(10),
  severity: z.enum(["info", "warning", "critical"]),
  area: z.object({
    type: z.enum(["point", "polygon"]),
    coordinates: z.union([
      coordinatesSchema,
      z.array(coordinatesSchema).min(3) // For polygon, require at least 3 points
    ]),
  }),
  // createdBy is now determined server-side, removed from client schema
  // createdBy: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Get filter parameters from URL
    const { searchParams } = new URL(request.url);
    const severityParam = searchParams.get('severity');
    const active = searchParams.get('active') === 'true';
    
    // Validate severity parameter
    const validSeverities = ['info', 'warning', 'critical'] as const;
    const severity = severityParam && validSeverities.includes(severityParam as any) 
      ? (severityParam as 'info' | 'warning' | 'critical')
      : undefined;
    
    // Get alerts from database
    let alerts: Alert[];
    
    if (active) {
      // Get active alerts, with optional severity filter
      alerts = await getActiveAlerts(severity);
    } else if (severity) {
      // Get all alerts and filter by severity
      alerts = await getAllAlerts();
      alerts = alerts.filter(alert => alert.severity === severity);
    } else {
      // Get all alerts
      alerts = await getAllAlerts();
    }
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error retrieving alerts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // --- Verify Authentication using verifyToken --- 
  let userId: string | null = null;
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token); // Use your verifyToken function

    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized: Invalid token payload" }, { status: 401 });
    }
    userId = payload.id; // Get user ID from verified token payload
  } catch (error) {
     console.error("Authentication error in POST /api/alerts:", error);
     return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
  // --- End Authentication Check ---

  // Ensure userId was set
  if (!userId) {
     return NextResponse.json({ error: "Unauthorized: Could not verify user" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = alertSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid alert data", details: result.error.issues },
        { status: 400 }
      );
    }
    
    // Prepare alert data using validated data and the authenticated user ID
    const newAlertData: Omit<Alert, 'id'> = {
      title: result.data.title,
      message: result.data.message,
      severity: result.data.severity,
      area: result.data.area,
      createdAt: new Date().toISOString(),
      createdBy: userId, // Use the ID from the verified token payload
      expiresAt: result.data.expiresAt
    };
    
    const createdAlert = await createAlert(newAlertData);
    emitNewAlert(createdAlert);
    
    return NextResponse.json({ 
      success: true, 
      alertId: createdAlert.id 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error handling alert creation:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process alert";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Additional endpoint to mark an alert as inactive
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }
    
    // Get the alert from database
    const alert = await getAlertById(id);
    
    if (!alert) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }
    
    // Update the alert to set expiry to now
    const updatedAlert = await updateAlert(id, {
      expiresAt: new Date().toISOString()
    });
    
    if (!updatedAlert) {
      return NextResponse.json(
        { error: "Failed to update alert" },
        { status: 500 }
      );
    }
    
    // Emit Socket.io event for the updated alert
    emitUpdateAlert(updatedAlert);
    
    return NextResponse.json({ 
      success: true, 
      alert: updatedAlert
    });
    
  } catch (error) {
    console.error("Error handling alert update:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to completely remove an alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }
    
    // Get the alert from database
    const alert = await getAlertById(id);
    
    if (!alert) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }
    
    // Delete the alert from database
    const success = await deleteAlert(id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete alert" },
        { status: 500 }
      );
    }
    
    // Emit Socket.io event for alert deletion
    emitDeleteAlert(id);
    
    return NextResponse.json({ 
      success: true, 
      message: "Alert deleted successfully"
    });
    
  } catch (error) {
    console.error("Error handling alert deletion:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
