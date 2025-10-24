"use client";

import { create } from "zustand";
import { DiseaseReport, Hotspot, User, Alert } from "@/types";

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Reports state
  reports: DiseaseReport[];
  setReports: (reports: DiseaseReport[]) => void;
  addReport: (report: DiseaseReport) => void;
  updateReport: (id: string, report: Partial<DiseaseReport>) => void;
  
  // Hotspots state
  hotspots: Hotspot[];
  setHotspots: (hotspots: Hotspot[]) => void;
  
  // Alerts state
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  dismissAlert: (id: string) => void;
  
  // Map state
  mapCenter: [number, number];
  mapZoom: number;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial user state
  user: null,
  setUser: (user) => set({ user }),
  
  // Initial reports state
  reports: [],
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [...state.reports, report] })),
  updateReport: (id, updatedReport) => set((state) => ({
    reports: state.reports.map((report) => 
      report.id === id ? { ...report, ...updatedReport } : report
    )
  })),
  
  // Initial hotspots state
  hotspots: [],
  setHotspots: (hotspots) => set({ hotspots }),
  
  // Initial alerts state
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((alert) => alert.id !== id)
  })),
  
  // Initial map state
  mapCenter: [0, 0],
  mapZoom: 2,
  setMapCenter: (mapCenter) => set({ mapCenter }),
  setMapZoom: (mapZoom) => set({ mapZoom }),
})); 