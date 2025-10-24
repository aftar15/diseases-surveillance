"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAppStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Leaf, MapPin } from "lucide-react";
import { Hotspot, DiseaseReport } from "@/types";
import { useSocket } from "@/hooks/use-socket";
import { Badge } from "@/components/ui/badge";

// Fix for Leaflet default icon in Next.js
import L from "leaflet";

// Handle Leaflet SSR issues by ensuring window is defined
const MapController = ({ hotspots }: { hotspots: Hotspot[] }) => {
  const map = useMap();
  const { mapCenter, mapZoom, setMapCenter, setMapZoom } = useAppStore();
  const isProgrammaticMove = useRef(false);
  
  // Update map position when store values change (from search)
  useEffect(() => {
    if (mapCenter.length === 2 && mapZoom) {
      const [lng, lat] = mapCenter;
      const currentCenter = map.getCenter();
      
      // Only move if position actually changed (avoid unnecessary moves)
      const hasChanged = 
        Math.abs(currentCenter.lat - lat) > 0.0001 || 
        Math.abs(currentCenter.lng - lng) > 0.0001 ||
        map.getZoom() !== mapZoom;
      
      if (hasChanged) {
        isProgrammaticMove.current = true;
        // Fly to new position with animation
        map.flyTo([lat, lng], mapZoom, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    }
  }, [mapCenter, mapZoom, map]);
  
  // Save map position when user manually moves the map
  useEffect(() => {
    const handleMoveEnd = () => {
      // Skip if this was a programmatic move (from store update)
      if (isProgrammaticMove.current) {
        isProgrammaticMove.current = false;
        return;
      }
      
      const center = map.getCenter();
      const currentZoom = map.getZoom();
      setMapCenter([center.lng, center.lat]);
      setMapZoom(currentZoom);
    };
    
    map.on('moveend', handleMoveEnd);
    
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, setMapCenter, setMapZoom]);
  
  return null;
};

interface MapViewProps {
  className?: string;
}

export function MapView({ className }: MapViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validatedReports, setValidatedReports] = useState<DiseaseReport[]>([]);
  const [reportIcon, setReportIcon] = useState<L.Icon | null>(null);
  const { toast } = useToast();
  
  const { hotspots, mapCenter, mapZoom, setHotspots, reports } = useAppStore();
  const { socket, isConnected } = useSocket();

  // Fix Leaflet default icon issue in Next.js and create custom icon for reports
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Fix Leaflet icon - delete default icon reference and set new ones
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
      
      // Create custom icon for individual reports
      const icon = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      setReportIcon(icon);
    }
  }, []);

  // Load hotspots and validated reports data from the API
  useEffect(() => {
    async function fetchMapData() {
      try {
        // Fetch hotspots
        const hotspotsResponse = await fetch("/api/hotspots");
        
        if (!hotspotsResponse.ok) {
          throw new Error("Failed to fetch hotspots");
        }
        
        const hotspotsData = await hotspotsResponse.json();
        
        // Process GeoJSON features to hotspots
        const fetchedHotspots = hotspotsData.features.map((feature: any) => ({
          id: feature.properties.id,
          location: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
          },
          intensity: feature.properties.intensity,
          reportCount: feature.properties.reportCount,
          lastReportDate: feature.properties.lastReportDate,
        }));
        
        setHotspots(fetchedHotspots);
        
        // Fetch validated reports
        const reportsResponse = await fetch("/api/reports?status=validated");
        
        if (!reportsResponse.ok) {
          throw new Error("Failed to fetch validated reports");
        }
        
        const reportsData = await reportsResponse.json();
        setValidatedReports(reportsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching map data:", error);
        setError("Failed to load map data");
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load map data",
          variant: "destructive",
        });
      }
    }
    
    fetchMapData();
  }, [setHotspots, toast]);
  
  // Listen for real-time updates from WebSocket
  useEffect(() => {
    if (!socket) return;
    
    const handleNewValidatedReport = (report: DiseaseReport) => {
      console.log("New validated report received on map:", report);
      setValidatedReports(prev => [...prev, report]);
    };
    
    socket.on('new-validated-report', handleNewValidatedReport);
    
    return () => {
      socket.off('new-validated-report', handleNewValidatedReport);
    };
  }, [socket]);
  
  // Update validated reports when store reports change
  useEffect(() => {
    const validated = reports.filter(r => r.status === 'validated');
    if (validated.length > 0) {
      setValidatedReports(validated);
    }
  }, [reports]);

  // Default center coordinates - San Jose, Dinagat Islands
  const defaultCenter = mapCenter.length === 2 
    ? [mapCenter[1], mapCenter[0]] as [number, number]
    : [10.0095, 125.5708] as [number, number]; // San Jose, Dinagat Islands, Philippines
  
  const defaultZoom = mapZoom || 13;

  // Get color based on intensity with a green-to-red gradient
  const getHotspotColor = (intensity: number): string => {
    if (intensity > 0.7) return '#F44336'; // Red for high intensity
    if (intensity > 0.4) return '#FFB74D'; // Amber for medium intensity
    return '#4CAF50'; // Green for low intensity (safe areas)
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-0 overflow-hidden">
          <div className="w-full h-[500px] bg-muted animate-pulse rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 overflow-hidden">
        <div className="w-full h-[500px]" suppressHydrationWarning>
          <MapContainer 
            center={defaultCenter} 
            zoom={defaultZoom} 
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles"
            />
            
            {/* Render hotspot circles (clustered reports) */}
            {hotspots.map((hotspot) => (
              <CircleMarker 
                key={`hotspot-${hotspot.id}`}
                center={[hotspot.location.lat, hotspot.location.lng] as [number, number]}
                radius={Math.min(20, 5 + (hotspot.intensity * 15))}
                pathOptions={{
                  color: getHotspotColor(hotspot.intensity),
                  fillColor: getHotspotColor(hotspot.intensity),
                  fillOpacity: 0.7,
                  weight: 2
                }}
              >
                <Popup className="dengue-popup">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Leaf className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-sm text-primary">Disease Hotspot</h3>
                    </div>
                    <p className="text-xs">Intensity: {hotspot.intensity.toFixed(2)}</p>
                    <p className="text-xs">Report Count: {hotspot.reportCount}</p>
                    <p className="text-xs">Last Report: {new Date(hotspot.lastReportDate).toLocaleDateString()}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            
            {/* Render individual validated report markers */}
            {reportIcon && validatedReports.map((report) => (
              <Marker 
                key={`report-${report.id}`}
                position={[report.location.lat, report.location.lng] as [number, number]}
                icon={reportIcon}
              >
                <Popup className="report-popup">
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <h3 className="font-medium text-sm text-blue-600">Disease Report</h3>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                        Validated
                      </Badge>
                    </div>
                    
                    {report.diseaseName && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Disease:</p>
                        <p className="text-xs font-medium">{report.diseaseName}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Symptoms:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {report.symptoms.slice(0, 3).map((symptom, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                        {report.symptoms.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{report.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Report Date:</p>
                      <p className="text-xs">{new Date(report.reportDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Location:</p>
                      <p className="text-xs">
                        {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            <MapController hotspots={hotspots} />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
} 