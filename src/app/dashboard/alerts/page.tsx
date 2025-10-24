import { Metadata } from "next";
import { DashboardWrapper } from "@/components/auth/dashboard-wrapper";
import { UserRole } from "@/types";
import { AlertsManagement } from "@/components/alerts/client-alerts-management";

export const metadata: Metadata = {
  title: "Alerts Management | DSMS",
  description: "Manage and create alerts for disease outbreaks and prevention measures",
};

export default function AlertsPage() {
  return (
    <DashboardWrapper allowedRoles={[UserRole.Admin, UserRole.HealthWorker]}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold tracking-tight">Alerts Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage public health alerts for disease prevention
          </p>
        </div>

        <AlertsManagement />
      </div>
    </DashboardWrapper>
  );
} 