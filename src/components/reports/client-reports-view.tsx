"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon, MapPinIcon, CheckIcon, XIcon, ClockIcon, AlertCircleIcon, EyeIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DiseaseReport } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ClientReportsView() {
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [diseases, setDiseases] = useState<Array<{ id: string; name: string; symptoms?: Array<{ id: string; name: string }> }>>([]);
  const [availableSymptoms, setAvailableSymptoms] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReport, setSelectedReport] = useState<DiseaseReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    reporterName: "",
    reporterNumber: "",
    diseaseId: "",
    location: { lat: 0, lng: 0 },
    symptoms: [] as string[],
    notes: "",
  });
  const { toast } = useToast();

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reports');

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again later.');
        toast({
          title: "Error", 
          description: "Failed to load reports", 
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  // Fetch diseases with their symptoms for the disease dropdown
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await fetch('/api/diseases');
        if (!response.ok) {
          throw new Error('Failed to fetch diseases');
        }
        const data = await response.json();
        setDiseases(data);
      } catch (err) {
        console.error('Error fetching diseases:', err);
        toast({
          title: "Error", 
          description: "Failed to load diseases", 
          variant: "destructive"
        });
      }
    };

    fetchDiseases();
  }, [toast]);

  // Update available symptoms when disease is selected for new report
  useEffect(() => {
    if (newReport.diseaseId && diseases.length > 0) {
      const selectedDisease = diseases.find(d => d.id === newReport.diseaseId);
      if (selectedDisease?.symptoms) {
        setAvailableSymptoms(selectedDisease.symptoms);
      }
    }
  }, [newReport.diseaseId, diseases]);

  // Update available symptoms when editing a report
  useEffect(() => {
    if (selectedReport?.diseaseId && diseases.length > 0 && isEditDialogOpen) {
      const selectedDisease = diseases.find(d => d.id === selectedReport.diseaseId);
      if (selectedDisease?.symptoms) {
        setAvailableSymptoms(selectedDisease.symptoms);
      }
    }
  }, [selectedReport?.diseaseId, diseases, isEditDialogOpen]);

  // Filter reports based on status
  const filteredReports = reports.filter(report => {
    if (activeTab === "all") return true;
    return report.status === activeTab;
  });

  // Format symptoms for display
  const formatSymptoms = (symptoms: string[]) => {
    return symptoms.join(", ");
  };

  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return <Badge className="bg-green-500">Validated</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
      default:
        return <Badge className="bg-amber-500">Pending</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format location for display - San Jose Municipality and Barangays
  const formatLocation = (report: DiseaseReport) => {
    // San Jose Municipality locations mapping - matching report-form.tsx
    const sanJoseLocations = [
      { id: "san-jose-municipality", name: "Municipality of San Jose", latitude: 10.0095, longitude: 125.5708 },
      { id: "san-jose-san-juan", name: "San Juan", latitude: 10.0132, longitude: 125.5686 },
      { id: "san-jose-poblacion", name: "Poblacion", latitude: 10.0080, longitude: 125.5718 },
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
    
    // Try to match by locationId first
    if (report.locationId) {
      const location = sanJoseLocations.find(loc => loc.id === report.locationId);
      if (location) {
        return location.name;
      }
    }
    
    // Try to match by coordinates (with tolerance for slight differences)
    if (report.location?.lat && report.location?.lng) {
      const tolerance = 0.001; // ~100 meters
      const matchedLocation = sanJoseLocations.find(loc => 
        Math.abs(loc.latitude - report.location.lat) < tolerance &&
        Math.abs(loc.longitude - report.location.lng) < tolerance
      );
      
      if (matchedLocation) {
        return matchedLocation.name;
      }
    }
    
    // Fallback to coordinates if no match found
    return `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`;
  };

  // Validate a report
  const handleValidate = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: "validate",
          validatedBy: "Admin User" // In a real app, this would be the current user
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to validate report');
      }
      
      const { report } = await response.json();
      
      // Update the reports list with the validated report
      setReports(prevReports => 
        prevReports.map(r => r.id === id ? report : r)
      );
      
      toast({
        title: "Success",
        description: "Report successfully validated",
        variant: "default",
      });
    } catch (error) {
      console.error('Error validating report:', error);
      toast({
        title: "Error",
        description: "Failed to validate report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reject a report
  const handleReject = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: "reject",
          validatedBy: "Admin User" // In a real app, this would be the current user
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject report');
      }
      
      const { report } = await response.json();
      
      // Update the reports list with the rejected report
      setReports(prevReports => 
        prevReports.map(r => r.id === id ? report : r)
      );
      
      toast({
        title: "Success",
        description: "Report successfully rejected",
        variant: "default",
      });
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast({
        title: "Error",
        description: "Failed to reject report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // View report details
  const handleViewDetails = (report: DiseaseReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  // Handle create report form submission
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Validate the form inputs
      if (!newReport.reporterName.trim()) {
        throw new Error("Please enter reporter name");
      }
      
      if (!newReport.reporterNumber.trim()) {
        throw new Error("Please enter reporter contact number");
      }
      
      if (!newReport.diseaseId) {
        throw new Error("Please select a disease type");
      }
      
      if (newReport.location.lat === 0 && newReport.location.lng === 0) {
        throw new Error("Please enter valid location coordinates");
      }
      
      if (newReport.symptoms.length === 0) {
        throw new Error("Please select at least one symptom");
      }
      
      // Convert symptom names to IDs for storage
      const symptomIds = newReport.symptoms.map(symptomName => {
        const symptom = availableSymptoms.find(s => s.name === symptomName);
        return symptom ? symptom.id : symptomName; // Fallback to name if ID not found
      });
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporterName: newReport.reporterName,
          reporterNumber: newReport.reporterNumber,
          diseaseId: newReport.diseaseId,
          latitude: newReport.location.lat,
          longitude: newReport.location.lng,
          symptoms: symptomIds,
          notes: newReport.notes,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create report');
      }
      
      // Refresh reports list
      const reportsResponse = await fetch('/api/reports');
      if (reportsResponse.ok) {
        const data = await reportsResponse.json();
        setReports(data);
      }
      
      // Reset form and close dialog
      setNewReport({
        reporterName: "",
        reporterNumber: "",
        diseaseId: "",
        location: { lat: 0, lng: 0 },
        symptoms: [],
        notes: "",
      });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Report created successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit report
  const handleEditReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    
    try {
      setIsLoading(true);
      
      // Validate the form inputs
      if (selectedReport.symptoms.length === 0) {
        throw new Error("Please select at least one symptom");
      }
      
      // Convert symptom names back to IDs for storage
      const symptomIds = selectedReport.symptoms.map(symptomName => {
        const symptom = availableSymptoms.find(s => s.name === symptomName);
        return symptom ? symptom.id : symptomName; // Fallback to name if ID not found
      });
      
      const response = await fetch('/api/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedReport.id,
          symptoms: symptomIds,
          notes: selectedReport.notes,
          status: selectedReport.status,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update report');
      }
      
      const { report } = await response.json();
      
      // Update the reports list with the edited report
      setReports(prevReports => 
        prevReports.map(r => r.id === report.id ? report : r)
      );
      
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Report updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete report
  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/reports', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedReport.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      
      // Remove the deleted report from the reports list
      setReports(prevReports => 
        prevReports.filter(r => r.id !== selectedReport.id)
      );
      
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Report deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle symptom selection for new report
  const toggleSymptomForNewReport = (symptom: string) => {
    setNewReport(prev => {
      const symptoms = prev.symptoms.includes(symptom) 
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms };
    });
  };
  
  // Toggle symptom selection for editing report
  const toggleSymptomForEditReport = (symptomName: string) => {
    if (!selectedReport) return;
    
    setSelectedReport((prev: DiseaseReport | null) => {
      if (!prev) return prev;
      
      const symptoms = prev.symptoms.includes(symptomName) 
        ? prev.symptoms.filter((s: string) => s !== symptomName)
        : [...prev.symptoms, symptomName];
      return { ...prev, symptoms };
    });
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (report: DiseaseReport) => {
    setSelectedReport(report);
    setIsEditDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (report: DiseaseReport) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">{filteredReports.length} Reports</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>
    
      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <FileTextIcon className="h-4 w-4 mr-2" />
            All Reports
          </TabsTrigger>
          <TabsTrigger value="pending">
            <ClockIcon className="h-4 w-4 mr-2" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="validated">
            <CheckIcon className="h-4 w-4 mr-2" />
            Validated
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XIcon className="h-4 w-4 mr-2" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" 
                  ? "All Case Reports" 
                  : activeTab === "pending" 
                  ? "Pending Reports" 
                  : activeTab === "validated" 
                  ? "Validated Reports" 
                  : "Rejected Reports"
                }
              </CardTitle>
              <CardDescription>
                {activeTab === "all" 
                  ? "View all reported dengue cases in the system" 
                  : activeTab === "pending" 
                  ? "Reports waiting for validation by health workers" 
                  : activeTab === "validated" 
                  ? "Reports confirmed as dengue cases" 
                  : "Reports determined not to be dengue cases"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
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
              ) : filteredReports.length === 0 ? (
                <div className="text-center p-8 border rounded-md bg-muted">
                  <p className="text-muted-foreground">No reports {activeTab !== "all" ? `with status "${activeTab}"` : ""} found.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto rounded-md border">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Location</th>
                        <th scope="col" className="px-6 py-3">Disease Type</th>
                        <th scope="col" className="px-6 py-3">Reporter Name</th>
                        <th scope="col" className="px-6 py-3">Contact Number</th>
                        <th scope="col" className="px-6 py-3">Symptoms</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isLoading ? (
                        <tr>
                          <td colSpan={9} className="text-center py-10 text-muted-foreground">Loading reports...</td>
                        </tr>
                      ) : error ? (
                         <tr>
                          <td colSpan={9} className="text-center py-10 text-destructive">{error}</td>
                        </tr>
                      ) : filteredReports.length === 0 ? (
                         <tr>
                          <td colSpan={9} className="text-center py-10 text-muted-foreground">No reports found for this status.</td>
                        </tr>
                      ) : (
                        filteredReports.map((report) => {
                          // Add check here: If report is null/undefined, skip rendering this row
                          if (!report) {
                            console.warn("Encountered null/undefined report during mapping"); 
                            return null; 
                          }
                          
                          // Return the existing row structure
                          return (
                            <tr key={report.id} className="border-b bg-card hover:bg-muted/50">
                              {/* Use optional chaining for safety, although the check above should prevent this */}
                              <td className="px-6 py-4 font-medium text-primary hover:underline cursor-pointer" onClick={() => handleViewDetails(report)}>
                                {report.id?.substring(0, 8) ?? 'N/A'} 
                              </td>
                              <td className="px-6 py-4">{report.reportDate ? formatDate(report.reportDate) : 'N/A'}</td>
                              <td className="px-6 py-4">{formatLocation(report)}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {report.diseaseName || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4">{report.reporterName}</td>
                              <td className="px-6 py-4">{report.reporterNumber}</td>
                              <td className="px-6 py-4 text-xs">{report.symptoms ? formatSymptoms(report.symptoms) : 'N/A'}</td>
                              <td className="px-6 py-4">{report.status ? getStatusBadge(report.status) : 'N/A'}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(report)} title="View Details">
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(report)} title="Edit Report">
                                    <EditIcon className="h-4 w-4" />
                                  </Button>
                                  {report.status === 'pending' && (
                                    <>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => handleValidate(report.id)} title="Validate Report">
                                        <CheckIcon className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleReject(report.id)} title="Reject Report">
                                        <XIcon className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => handleOpenDeleteDialog(report)} title="Delete Report">
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected report
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Report ID</h4>
                  <p className="font-mono text-xs">{selectedReport.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date Reported</h4>
                  <p>{formatDate(selectedReport.reportDate)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
              </div>
              
              {selectedReport.validatedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Validated By</h4>
                    <p>{selectedReport.validatedBy}</p>
                  </div>
                  {selectedReport.validatedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Validation Date</h4>
                      <p>{formatDate(selectedReport.validatedAt)}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                <div className="flex items-center mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{formatLocation(selectedReport)}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Symptoms</h4>
                <ul className="list-disc list-inside mt-1">
                  {selectedReport.symptoms.map((symptom: string, index: number) => (
                    <li key={index} className="text-sm">{symptom}</li>
                  ))}
                </ul>
              </div>
              
              {selectedReport.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Additional Notes</h4>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedReport.notes}</p>
                </div>
              )}
              
              {selectedReport.status === "pending" && (
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-green-50 hover:bg-green-100 text-green-600"
                    onClick={() => {
                      handleValidate(selectedReport.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Validate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-red-50 hover:bg-red-100 text-red-600"
                    onClick={() => {
                      handleReject(selectedReport.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Report Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Add a new dengue case report to the system
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateReport}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterName">Reporter Name</Label>
                  <Input 
                    id="reporterName" 
                    type="text" 
                    value={newReport.reporterName}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev, 
                      reporterName: e.target.value
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reporterNumber">Contact Number</Label>
                  <Input 
                    id="reporterNumber" 
                    type="tel" 
                    value={newReport.reporterNumber}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev, 
                      reporterNumber: e.target.value
                    }))}
                    placeholder="+63 912 345 6789"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="diseaseType">Disease Type</Label>
                <Select 
                  value={newReport.diseaseId}
                  onValueChange={(value) => setNewReport(prev => ({
                    ...prev, 
                    diseaseId: value
                  }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a disease" />
                  </SelectTrigger>
                  <SelectContent>
                    {diseases.map((disease) => (
                      <SelectItem key={disease.id} value={disease.id}>
                        {disease.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    step="0.000001"
                    value={newReport.location.lat}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev, 
                      location: {
                        ...prev.location,
                        lat: parseFloat(e.target.value) || 0
                      }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input 
                    id="longitude" 
                    type="number" 
                    step="0.000001"
                    value={newReport.location.lng}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev, 
                      location: {
                        ...prev.location,
                        lng: parseFloat(e.target.value) || 0
                      }
                    }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label className="block mb-2">Symptoms</Label>
                {availableSymptoms.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableSymptoms.map((symptom) => (
                      <div key={symptom.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`create-${symptom.id}`} 
                          checked={newReport.symptoms.includes(symptom.name)}
                          onCheckedChange={() => toggleSymptomForNewReport(symptom.name)}
                        />
                        <label 
                          htmlFor={`create-${symptom.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {symptom.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Please select a disease first</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Enter any additional information about the case"
                  value={newReport.notes}
                  onChange={(e) => setNewReport(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Report Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>
              Update the report information
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <form onSubmit={handleEditReport}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Report ID</Label>
                    <p className="font-mono text-xs">{selectedReport.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date Reported</Label>
                    <p>{formatDate(selectedReport.reportDate)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <div className="flex items-center mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{formatLocation(selectedReport)}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-status">Report Status</Label>
                  <Select 
                    value={selectedReport.status}
                    onValueChange={(value: "pending" | "validated" | "rejected") => 
                      setSelectedReport((prev: DiseaseReport | null) => {
                        if (!prev) return prev;
                        return { ...prev, status: value };
                      })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <span className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-amber-500" />
                          Pending
                        </span>
                      </SelectItem>
                      <SelectItem value="validated">
                        <span className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4 text-green-500" />
                          Validated
                        </span>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <span className="flex items-center gap-2">
                          <XIcon className="h-4 w-4 text-red-500" />
                          Rejected
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block mb-2">Symptoms</Label>
                  {availableSymptoms.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {availableSymptoms.map((symptom) => (
                        <div key={symptom.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-${symptom.id}`} 
                            checked={selectedReport.symptoms.includes(symptom.name)}
                            onCheckedChange={() => toggleSymptomForEditReport(symptom.name)}
                          />
                          <label 
                            htmlFor={`edit-${symptom.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {symptom.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading symptoms...</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="edit-notes">Additional Notes</Label>
                  <Textarea 
                    id="edit-notes" 
                    placeholder="Enter any additional information about the case"
                    value={selectedReport.notes || ""}
                    onChange={(e) => setSelectedReport((prev: DiseaseReport | null) => {
                      if (!prev) return prev;
                      return { ...prev, notes: e.target.value };
                    })}
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReport}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 