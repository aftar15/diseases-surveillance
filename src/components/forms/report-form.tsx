"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, LoaderIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store";
import { useToast } from "@/components/ui/toast";

// San Jose Municipality and Barangays with accurate GPS coordinates from PhilAtlas
const sanJoseLocations = [
  { id: "san-jose-municipality", name: "Municipality of San Jose", latitude: 10.0095, longitude: 125.5708 },
  { id: "san-jose-san-juan", name: "San Juan", latitude: 10.0132, longitude: 125.5686 },
  { id: "san-jose-poblacion", name: "Poblacion (San Jose)", latitude: 10.0080, longitude: 125.5718 },
  { id: "san-jose-sta-cruz", name: "Santa Cruz", latitude: 10.0193, longitude: 125.5707 },
  { id: "san-jose-don-ruben", name: "Don Ruben Ecleo", latitude: 10.0147, longitude: 125.5757 },
  { id: "san-jose-justiniana", name: "Justiniana Edera", latitude: 10.0100, longitude: 125.5750 },
  { id: "san-jose-aurelio", name: "Aurelio", latitude: 10.0093, longitude: 125.5747 },
  { id: "san-jose-mahayahay", name: "Mahayahay", latitude: 10.0065, longitude: 125.5852 },
  { id: "san-jose-cuarenta", name: "Cuarinta", latitude: 10.0213, longitude: 125.6038 },
  { id: "san-jose-wilson", name: "Wilson", latitude: 10.0257, longitude: 125.5871 },
  { id: "san-jose-matingbe", name: "Matingbe", latitude: 10.0053, longitude: 125.5738 },
  { id: "san-jose-jaquez", name: "Jacquez", latitude: 10.0071, longitude: 125.5724 },
  { id: "san-jose-luna", name: "Luna", latitude: 10.0020, longitude: 125.5680 },
];

interface Disease {
  id: string;
  name: string;
  category: string;
  description?: string;
  symptoms: {
    id: string;
    name: string;
    severity: string;
    isCommon: boolean;
  }[];
}

const reportFormSchema = z.object({
  reporterName: z.string().min(1, { message: "Reporter name is required" }),
  reporterNumber: z.string().min(10, { message: "Valid phone number is required" })
    .regex(/^\+?[0-9\s-()]+$/, { message: "Please enter a valid phone number" }),
  locationId: z.string().min(1, {
    message: "Please select a location",
  }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  diseaseId: z.string().min(1, {
    message: "Please select a disease",
  }),
  symptoms: z.array(z.string()).min(1, {
    message: "Please select at least one symptom",
  }),
  notes: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [availableSymptoms, setAvailableSymptoms] = useState<Disease['symptoms']>([]);
  const router = useRouter();
  const { addReport } = useAppStore();
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reporterName: "",
      reporterNumber: "",
      locationId: "",
      latitude: 0,
      longitude: 0,
      diseaseId: "",
      symptoms: [],
      notes: "",
    },
  });

  // Fetch diseases on component mount
  useEffect(() => {
    fetch('/api/diseases')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setDiseases(data);
        } else {
          console.error('Invalid diseases data:', data);
          setDiseases([]);
        }
      })
      .catch(error => {
        console.error('Error fetching diseases:', error);
        setDiseases([]); // Set empty array to prevent filter errors
        toast({
          title: "Error",
          description: "Failed to load diseases. Please refresh the page.",
          variant: "destructive",
        });
      });
  }, [toast]);

  // Update available symptoms when disease changes
  const handleDiseaseChange = (diseaseId: string) => {
    const disease = diseases.find(d => d.id === diseaseId);
    setSelectedDisease(disease || null);
    setAvailableSymptoms(disease?.symptoms || []);
    
    // Clear selected symptoms when disease changes
    form.setValue('symptoms', []);
    form.setValue('diseaseId', diseaseId);
  };

  // Set coordinates based on selected location
  const handleLocationChange = (locationId: string) => {
    const location = sanJoseLocations.find(loc => loc.id === locationId);
    if (location) {
      form.setValue("latitude", location.latitude);
      form.setValue("longitude", location.longitude);
    }
  };

  // Get current location - simplified
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      // Show loading toast
      toast({
        title: "Getting Location",
        description: "Finding your nearest location...",
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          let nearestLocation = sanJoseLocations[0]; // Default to Municipality
          let minDistance = Number.MAX_VALUE;
          
          sanJoseLocations.forEach(location => {
            const distance = Math.sqrt(
              Math.pow(location.latitude - userLat, 2) + 
              Math.pow(location.longitude - userLng, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestLocation = location;
            }
          });
          
          // Update form values
          form.setValue("locationId", nearestLocation.id);
          form.setValue("latitude", nearestLocation.latitude);
          form.setValue("longitude", nearestLocation.longitude);
          
          // Show success message
          toast({
            title: "Location Found",
            description: `Nearest location: ${nearestLocation.name}`,
          });
        },
        (error: GeolocationPositionError) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: `Unable to get location: ${error.message}. Please select manually.`,
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn\'t support geolocation. Please select a location manually.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: ReportFormValues) => {
    setIsSubmitting(true);
    try {
      const submitData = { ...data };

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit report");
      }
      
      addReport({
        id: result.reportId,
        reporterName: data.reporterName,
        reporterNumber: data.reporterNumber,
        location: { 
          lat: data.latitude,
          lng: data.longitude 
        },
        locationId: data.locationId,
        diseaseId: data.diseaseId,
        symptoms: data.symptoms,
        reportDate: new Date().toISOString(),
        status: "pending", 
        notes: data.notes || undefined,
      });

      router.push("/report/success");
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Report Disease Symptoms</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Submit a report of disease symptoms to help monitor outbreaks. Please provide your contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reporterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reporterNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Needed for verification if required.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location in San Jose Municipality</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleLocationChange(value); 
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sanJoseLocations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the municipality or barangay where the case was observed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              className="flex items-center gap-2 h-10 text-xs sm:text-sm"
            >
              <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Find Nearest Location</span>
              <span className="sm:hidden">Use GPS</span>
            </Button>
            
            <FormField control={form.control} name="latitude" render={({ field }) => <Input type="hidden" {...field} />} />
            <FormField control={form.control} name="longitude" render={({ field }) => <Input type="hidden" {...field} />} />

            <FormField
              control={form.control}
              name="diseaseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disease Type *</FormLabel>
                  <Select onValueChange={handleDiseaseChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select disease to report" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Communicable Diseases</SelectLabel>
                        {diseases?.filter(d => d.category === 'communicable')?.map((disease) => (
                          <SelectItem key={disease.id} value={disease.id}>
                            {disease.name}
                          </SelectItem>
                        )) || []}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Non-Communicable Diseases</SelectLabel>
                        {diseases?.filter(d => d.category === 'non_communicable')?.map((disease) => (
                          <SelectItem key={disease.id} value={disease.id}>
                            {disease.name}
                          </SelectItem>
                        )) || []}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the disease you suspect or want to report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-sm sm:text-base">Symptoms</FormLabel>
                    <FormDescription className="text-xs sm:text-sm">
                      {selectedDisease 
                        ? `Select symptoms related to ${selectedDisease.name}`
                        : "Please select a disease first to see available symptoms"
                      }
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                    {availableSymptoms.map((symptom) => (
                      <FormField
                        key={symptom.id}
                        control={form.control}
                        name="symptoms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={symptom.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(symptom.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), symptom.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== symptom.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {symptom.name}
                                {symptom.isCommon && (
                                  <span className="text-primary text-xs ml-1">(Common)</span>
                                )}
                                <span className={`text-xs ml-1 ${
                                  symptom.severity === 'severe' ? 'text-red-500' :
                                  symptom.severity === 'moderate' ? 'text-orange-500' :
                                  'text-gray-500'
                                }`}>
                                  ({symptom.severity})
                                </span>
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col space-y-2">
          <Button type="submit" disabled={isSubmitting} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            {isSubmitting ? (
              <><LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 