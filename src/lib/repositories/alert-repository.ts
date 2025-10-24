// Import only prisma from the db module
import { db } from '@/lib/db';
import type { Alert, Coordinates } from '@/types';
import { Prisma } from '@prisma/client'; // Import Prisma namespace

// Type aliases to match Prisma schema enums
type AlertSeverityType = 'info' | 'warning' | 'critical';
type AreaTypeEnum = 'point' | 'polygon';

// Define a type for the Prisma where clause used in getActiveAlerts
interface ActiveAlertsWhereClause {
  isActive: boolean;
  OR: (
    | { expiresAt: null }
    | { expiresAt: { gt: Date } }
  )[];
  severity?: AlertSeverityType; // CORRECTED: Use AlertSeverityType
}

// Define a type for the object returned by Prisma for an alert
interface DbAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverityType;
  areaType: AreaTypeEnum;
  coordinates: Prisma.JsonValue | null;
  createdAt: Date;
  createdBy: string | null;
  expiresAt: Date | null;
  isActive: boolean;
}

// Get all alerts
export async function getAllAlerts(): Promise<Alert[]> {
  try {
    const result = await db.alert.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return result.map(mapDbAlertToAlert);
  } catch (error) {
    console.error('Failed to get all alerts:', error);
    throw error;
  }
}

// Get active alerts (not expired)
export async function getActiveAlerts(severityFilter?: AlertSeverityType): Promise<Alert[]> { // Parameter type updated
  try {
    const now = new Date();
    
    const where: ActiveAlertsWhereClause = {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    };
    
    if (severityFilter) {
      where.severity = severityFilter;
    }
    
    const result = await db.alert.findMany({
      where, // Use the typed where clause
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return result.map(mapDbAlertToAlert);
  } catch (error) {
    console.error('Failed to get active alerts:', error);
    throw error;
  }
}

// Get alert by ID
export async function getAlertById(id: string): Promise<Alert | null> {
  try {
    const result = await db.alert.findUnique({
      where: { id }
    });
    
    if (!result) {
      return null;
    }
    
    return mapDbAlertToAlert(result);
  } catch (error) {
    console.error(`Failed to get alert by ID ${id}:`, error);
    throw error;
  }
}

// Create a new alert
export async function createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
  try {
    let inputCoordinates: Prisma.InputJsonValue | null = null;
    if (alert.area?.coordinates) { // Ensure coordinates exist before casting
      inputCoordinates = alert.area.coordinates as unknown as Prisma.InputJsonValue;
    }
    
    const valueToAssign = inputCoordinates === null ? Prisma.JsonNull : inputCoordinates;

    const newAlert = await db.alert.create({
      data: {
        title: alert.title,
        message: alert.message,
        severity: alert.severity as AlertSeverityType,
        areaType: alert.area?.type as AreaTypeEnum,
        coordinates: valueToAssign, // Pass Prisma.JsonNull or the value
        createdBy: alert.createdBy,
        expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : null
      }
    });
    
    return mapDbAlertToAlert(newAlert);
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
}

// Update an alert
export async function updateAlert(id: string, alert: Partial<Omit<Alert, 'id' | 'createdAt' | 'createdBy'>>): Promise<Alert | null> {
  try {
    let inputCoordinates: Prisma.InputJsonValue | null | undefined = undefined;
    
    if (alert.area?.coordinates !== undefined) { 
      inputCoordinates = alert.area.coordinates === null 
        ? null
        : alert.area.coordinates as unknown as Prisma.InputJsonValue;
    }
    
    const valueToAssign = inputCoordinates === null ? Prisma.JsonNull : inputCoordinates;

    const updatedAlert = await db.alert.update({
      where: { id },
      data: {
        title: alert.title,
        message: alert.message,
        severity: alert.severity as AlertSeverityType,
        areaType: alert.area?.type as AreaTypeEnum,
        ...(inputCoordinates !== undefined && { coordinates: valueToAssign }), 
        expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : undefined
      }
    });

    return mapDbAlertToAlert(updatedAlert);

  } catch (error) {
    console.error('Error updating alert:', error);
    return null;
  }
}

// Soft delete an alert (mark as inactive)
export async function deactivateAlert(id: string): Promise<boolean> {
  try {
    await db.alert.update({
      where: { id },
      data: {
        isActive: false,
        expiresAt: new Date()
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to deactivate alert ${id}:`, error);
    throw error;
  }
}

// Hard delete an alert
export async function deleteAlert(id: string): Promise<boolean> {
  try {
    await db.alert.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete alert ${id}:`, error);
    throw error;
  }
}

// Helper function to map database alert to Alert type using DbAlert type
function mapDbAlertToAlert(dbAlert: DbAlert): Alert {
  let coordinates: Coordinates | Coordinates[] = [];
  
  // Check against null from the database
  if (dbAlert.coordinates !== null) { 
    // Attempt to parse/cast. Runtime checks would be safer.
    try {
       coordinates = dbAlert.coordinates as unknown as Coordinates | Coordinates[];
    } catch (e) {
       console.error('Error processing coordinates from DB:', e, dbAlert.coordinates);
    }    
  }
  
  return {
    id: dbAlert.id,
    title: dbAlert.title,
    message: dbAlert.message,
    severity: dbAlert.severity,
    area: {
      type: dbAlert.areaType,
      coordinates
    },
    createdAt: dbAlert.createdAt.toISOString(),
    // CORRECTED: Map null createdBy to empty string (check Alert type definition later)
    createdBy: dbAlert.createdBy ?? '', 
    expiresAt: dbAlert.expiresAt ? dbAlert.expiresAt.toISOString() : undefined
  };
} 