"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Activity, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DiseaseCount {
  diseaseId: string;
  diseaseName: string;
  category: string;
  description: string;
  totalReports: number;
  pendingCount: number;
  validatedCount: number;
  rejectedCount: number;
}

export function DiseaseCountsCard() {
  const [diseaseData, setDiseaseData] = useState<DiseaseCount[]>([]);
  const [filteredData, setFilteredData] = useState<DiseaseCount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiseaseData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = diseaseData.filter(disease =>
        disease.diseaseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(diseaseData);
    }
  }, [searchQuery, diseaseData]);

  const fetchDiseaseData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/disease-counts');
      if (response.ok) {
        const data = await response.json();
        setDiseaseData(data);
        setFilteredData(data);
      }
    } catch (error) {
      console.error('Error fetching disease data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    return category === 'communicable' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getTotalReports = () => {
    return filteredData.reduce((sum, disease) => sum + disease.totalReports, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Disease Report Statistics</CardTitle>
          <CardDescription>Loading disease data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Disease Report Statistics
        </CardTitle>
        <CardDescription>
          Total diseases tracked: {filteredData.length} | Total reports: {getTotalReports()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search diseases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Disease List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No diseases found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredData.map((disease) => (
              <div
                key={disease.diseaseId}
                className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                {/* Disease Name and Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{disease.diseaseName}</h3>
                    {disease.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {disease.description}
                      </p>
                    )}
                  </div>
                  <Badge className={getCategoryColor(disease.category)}>
                    {disease.category === 'communicable' ? 'Communicable' : 'Non-Communicable'}
                  </Badge>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {disease.totalReports}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {disease.pendingCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {disease.validatedCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Validated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {disease.rejectedCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Rejected</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
