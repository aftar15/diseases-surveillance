"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";
import { useAppStore } from "@/store";
import { Alert as AlertType, Coordinates } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertCircleIcon, 
  BadgeAlertIcon, 
  InfoIcon, 
  MapPinIcon,
  TrendingUpIcon,
  FileEditIcon, 
  TrashIcon,
  XIcon,
  WifiIcon,
  WifiOffIcon,
  PlusIcon,
  MinusIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/use-socket";
import { Label } from "@/components/ui/label";

// Alert form schema - for point coordinates (string input)
const coordinateSchemaString = z.object({
  lat: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90, {
    message: "Latitude must be between -90 and 90"
  }),
  lng: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180, {
    message: "Longitude must be between -180 and 180"
  }),
});

// For polygon coordinates (number values)
const coordinateSchemaNumber = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const baseAlertSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  severity: z.enum(["info", "warning", "critical"]),
  expiresInDays: z.string().refine(val => val === "" || (!isNaN(parseInt(val)) && parseInt(val) > 0), {
    message: "Expiration days must be a positive number"
  }).optional(),
});

// Discriminated union for areaType
const alertFormSchema = z.discriminatedUnion("areaType", [
  z.object({
    areaType: z.literal("point"),
    latitude: coordinateSchemaString.shape.lat,
    longitude: coordinateSchemaString.shape.lng,
  }).merge(baseAlertSchema),
  z.object({
    areaType: z.literal("polygon"),
    polygonPoints: z.array(coordinateSchemaNumber).min(3, "Polygon must have at least 3 points"),
  }).merge(baseAlertSchema),
]);

type AlertFormValues = z.infer<typeof alertFormSchema>;

export function AlertsManagement() {
  const { toast } = useToast();
  const { alerts, setAlerts, addAlert, dismissAlert } = useAppStore();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const { isConnected } = useSocket();
  
  // State for managing polygon points UI input
  const [polygonPoints, setPolygonPoints] = useState<Coordinates[]>([]);
  const [newPointLat, setNewPointLat] = useState<string>("");
  const [newPointLng, setNewPointLng] = useState<string>("");

  // Initialize form
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      areaType: "point",
      title: "",
      message: "",
      severity: "warning",
      latitude: "", 
      longitude: "",
      expiresInDays: "7",
      // polygonPoints: undefined, // Initialize if needed by schema/RHF strictness
    },
     mode: "onChange", // Add mode to potentially see validation errors sooner
  });

  // Register the polygonPoints field conceptually for validation tracking
  useEffect(() => {
    form.register("polygonPoints" as any); // Register conceptually
  }, [form.register]);

  // Watch the areaType field
  const watchedAreaType = form.watch("areaType");

  // Sync polygonPoints state with react-hook-form state for validation
  useEffect(() => {
    if (watchedAreaType === 'polygon') {
      // Set the value in react-hook-form and trigger validation
      form.setValue("polygonPoints" as any, polygonPoints, { shouldValidate: true });
    } else {
      // Clear the value and errors if switching away from polygon
      form.setValue("polygonPoints" as any, undefined, { shouldValidate: false });
      form.clearErrors("polygonPoints" as any);
    }
  }, [polygonPoints, watchedAreaType, form]);

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/alerts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        
        const data = await response.json();
        setAlerts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load alerts", 
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [setAlerts, toast]);

  // Filter alerts based on selected filter
  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") return true;
    return alert.severity === filter;
  });

  // Handle form submission
  const onSubmit = async (data: AlertFormValues) => {
    console.log("Form submitted with data:", data);
    
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to create an alert.",
        variant: "destructive",
      });
      return; 
    }
    
    let coordinates: Coordinates | Coordinates[];
    let submissionData: any;

    if (data.areaType === "point") {
      if (!data.latitude || !data.longitude) {
        toast({
          title: "Error",
          description: "Latitude and Longitude are required for Single Location.",
          variant: "destructive",
        });
        return;
      }
      coordinates = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
      submissionData = data; // Use data directly as it matches
    } else { // Polygon
      // Access polygonPoints directly from data (typed correctly now)
      const polygonData = data as Extract<AlertFormValues, { areaType: "polygon" }>;
      const currentFormPolygonPoints = polygonData.polygonPoints;
      
      console.log("Polygon points from form:", currentFormPolygonPoints);
      
      if (!currentFormPolygonPoints || currentFormPolygonPoints.length < 3) {
        toast({
          title: "Error",
          description: `Polygon must have at least 3 points. Currently has ${currentFormPolygonPoints?.length || 0}.`,
          variant: "destructive",
        });
        form.setError("polygonPoints" as any, { type: "manual", message: "Polygon must have at least 3 points." });
        return;
      }
      coordinates = currentFormPolygonPoints;
      submissionData = data; 
    }

    try {
      const alertData = {
        title: submissionData.title,
        message: submissionData.message,
        severity: submissionData.severity,
        area: {
          type: submissionData.areaType,
          coordinates: coordinates,
        },
        expiresAt: submissionData.expiresInDays && submissionData.expiresInDays !== "" 
          ? new Date(Date.now() + parseInt(submissionData.expiresInDays) * 86400000).toISOString()
          : undefined,
      };

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(alertData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create alert';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      const alertsResponse = await fetch('/api/alerts');
      if (alertsResponse.ok) {
        setAlerts(await alertsResponse.json());
      }

      form.reset();
      setPolygonPoints([]);
      setNewPointLat("");
      setNewPointLng("");
      
      toast({
        title: "Success",
        description: "Alert created successfully",
      });
    } catch (err) {
      console.error('Error creating alert:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create alert", 
        variant: "destructive"
      });
    }
  };

  // Handle alert deletion
  const handleDeleteAlert = async (id: string) => {
    // Add Authorization check - ensure user is logged in
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to delete an alert.",
        variant: "destructive",
      });
      return; 
    }
    
    try {
      const response = await fetch(`/api/alerts?id=${id}`, {
        method: 'DELETE', // Correct HTTP method
        headers: {
          // Add Authorization header for the DELETE request
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
         // Attempt to parse error, provide fallback
        let errorMessage = 'Failed to delete alert';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse delete error response:", parseError);
        }
        throw new Error(errorMessage);
      }
      
      // No need to parse success response body if DELETE returns 200/204

      dismissAlert(id); // Remove from client state
      toast({
        title: "Success",
        description: "Alert deleted successfully"
      });
    } catch (err) {
      console.error('Error deleting alert:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete alert", 
        variant: "destructive"
      });
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <BadgeAlertIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircleIcon className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500">Warning</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-500">Info</Badge>;
    }
  };

  // Polygon Point Management
  const handleAddPoint = () => {
    // Basic validation for new point input
    const latNum = parseFloat(newPointLat);
    const lngNum = parseFloat(newPointLng);
    if (isNaN(latNum) || latNum < -90 || latNum > 90 || isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid latitude (-90 to 90) and longitude (-180 to 180).",
        variant: "destructive",
      });
      return;
    }
    // Update state - the useEffect above will sync with RHF
    setPolygonPoints(prevPoints => [...prevPoints, { lat: latNum, lng: lngNum }]);
    setNewPointLat("");
    setNewPointLng("");
  };

  const handleRemovePoint = (index: number) => {
    // Update state - the useEffect above will sync with RHF
    setPolygonPoints(prevPoints => prevPoints.filter((_, i) => i !== index));
  };

  return (
    <Tabs defaultValue="all-alerts" className="space-y-6">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="all-alerts">View Alerts</TabsTrigger>
        <TabsTrigger value="create-alert">Create New Alert</TabsTrigger>
      </TabsList>

      <TabsContent value="all-alerts" className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Active Alerts</h2>
            {isConnected ? (
              <div className="flex items-center gap-1 text-xs text-green-500 font-normal">
                <WifiIcon className="h-3 w-3" />
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-500 font-normal">
                <WifiOffIcon className="h-3 w-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="info">Information</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-card">
            <p className="text-muted-foreground">No alerts match your filter criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader className="flex flex-row items-center gap-2">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <CardDescription>
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                      {alert.expiresAt && ` • Expires ${new Date(alert.expiresAt).toLocaleDateString()}`}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{alert.message}</p>
                  <div className="mt-2 text-sm flex items-center text-muted-foreground">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>
                      {(() => {
                        // Ensure coordinates is an object, not a string
                        let coordObj = alert.area.coordinates;
                        if (typeof coordObj === 'string') {
                          try {
                            coordObj = JSON.parse(coordObj);
                          } catch (e) {
                            return "Multiple locations";
                          }
                        }
                        
                        // Now check if it's a proper point format
                        if (alert.area.type === "point" && !Array.isArray(coordObj) && coordObj && typeof coordObj === 'object' && 'lat' in coordObj && 'lng' in coordObj) {
                          return `${coordObj.lat.toFixed(4)}, ${coordObj.lng.toFixed(4)}`;
                        }
                        return "Multiple locations";
                      })()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="create-alert">
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
            <CardDescription>
              Create a new public health alert for dengue prevention or response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(
                  onSubmit,
                  (errors) => {
                    console.log("Form validation errors:", errors);
                    toast({
                      title: "Validation Error",
                      description: "Please check all required fields and fix any errors.",
                      variant: "destructive",
                    });
                  }
                )} 
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Dengue outbreak in Central District" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide detailed information about the alert..." 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include important details like prevention measures and what people should do.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="areaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area Type</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setPolygonPoints([]);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select area type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="point">Single Location</SelectItem>
                            <SelectItem value="polygon">Multiple Locations (Polygon)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchedAreaType === "point" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. 14.5896" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. 120.9842" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {watchedAreaType === "polygon" && (
                  <div className="space-y-4 border-t pt-4">
                    <FormLabel>Polygon Points ({polygonPoints.length} added)</FormLabel>
                    
                    {polygonPoints.length === 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                        <div className="flex items-start gap-2">
                          <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium mb-1">How to create a polygon area:</p>
                            <ol className="list-decimal ml-4 space-y-1 text-xs">
                              <li>Enter latitude and longitude coordinates in the fields below</li>
                              <li>Click the <PlusIcon className="h-3 w-3 inline" /> button to add each point</li>
                              <li>Add at least 3 points to define the alert area</li>
                              <li>Points will automatically connect to form a polygon</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {polygonPoints.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                        {polygonPoints.map((point, index) => (
                          <div key={index} className="flex items-center justify-between text-sm p-1 bg-muted/50 rounded">
                            <span>{`Point ${index + 1}: (${point.lat}, ${point.lng})`}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemovePoint(index)}>
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                      <Label className="text-sm font-medium">Add New Point</Label>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label htmlFor="newLat" className="text-xs mb-1 block text-muted-foreground">Latitude</Label>
                          <Input 
                            id="newLat" 
                            placeholder="e.g., 10.0095" 
                            value={newPointLat} 
                            onChange={(e) => setNewPointLat(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddPoint();
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="newLng" className="text-xs mb-1 block text-muted-foreground">Longitude</Label>
                          <Input 
                            id="newLng" 
                            placeholder="e.g., 125.5708" 
                            value={newPointLng} 
                            onChange={(e) => setNewPointLng(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddPoint();
                              }
                            }}
                          />
                        </div>
                        <Button type="button" variant="default" size="icon" onClick={handleAddPoint} title="Add Point">
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <FormDescription>
                      {polygonPoints.length < 3 ? (
                        <span className="text-amber-600 font-medium">
                          Add at least {3 - polygonPoints.length} more point(s) to define the polygon area.
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          ✓ Polygon area defined with {polygonPoints.length} points. You can add more points or proceed.
                        </span>
                      )}
                    </FormDescription>
                    {polygonPoints.length < 3 && (
                      <p className="text-sm text-destructive mt-2">
                        Please define at least 3 points to create a polygon area.
                      </p>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="expiresInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires In (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of days until this alert expires. Leave empty for no expiration.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creating..." : "Create Alert"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 