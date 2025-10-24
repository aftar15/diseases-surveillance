"use client";

import { ReportForm } from "@/components/forms/client-report-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportCasePage() {
  return (
    <div className="container py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Report Suspected Disease Case</CardTitle>
          <CardDescription>
            Help us track disease outbreaks by reporting suspected cases. 
            Your report is anonymous and helps with surveillance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm />
        </CardContent>
      </Card>
    </div>
  );
} 