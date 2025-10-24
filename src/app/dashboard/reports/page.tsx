import { Metadata } from "next";
import { DashboardWrapper } from "@/components/auth/dashboard-wrapper";
import { UserRole } from "@/types";
import { ClientReportsView } from "@/components/reports/client-reports-view";

export const metadata: Metadata = {
  title: "Reports | DSMS",
  description: "Manage and review disease case reports"
};

export default function ReportsPage() {
  return (
    <DashboardWrapper allowedRoles={[UserRole.Admin, UserRole.HealthWorker]}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold tracking-tight">Case Reports</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage disease case reports submitted by the public
          </p>
        </div>
        
        <ClientReportsView />
      </div>
    </DashboardWrapper>
  );
} 