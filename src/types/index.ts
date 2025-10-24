// User roles
export enum UserRole {
  Admin = 'admin',
  HealthWorker = 'health_worker',
  Researcher = 'researcher',
  Public = 'public'
}

// Coordinates interface
export interface Coordinates {
  lat: number;
  lng: number;
}

// Symptom interface
export interface Symptom {
  id: string;
  name: string;
  description: string;
}

// Report interface
export interface DiseaseReport {
  id: string;
  reporterName: string;
  reporterNumber: string;
  location: Coordinates;
  locationId?: string;
  barangayId?: string;
  diseaseId: string;
  diseaseName?: string;
  symptoms: string[];
  reportDate: string;
  status: "pending" | "validated" | "rejected";
  validatedBy?: string;
  validatedAt?: string;
  notes?: string;
}

// Hotspot interface
export interface Hotspot {
  id: string;
  location: Coordinates;
  intensity: number;
  reportCount: number;
  lastReportDate: string;
}

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  password?: string;
}

// Alert interface
export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  area: {
    type: "point" | "polygon";
    coordinates: Coordinates | Coordinates[];
  };
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
} 