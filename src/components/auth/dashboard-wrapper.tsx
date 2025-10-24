"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserRole } from "@/types";

interface DashboardWrapperProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function DashboardWrapper({ 
  children, 
  allowedRoles = [UserRole.Admin, UserRole.HealthWorker, UserRole.Researcher]
}: DashboardWrapperProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="w-full max-w-full">
        {children}
      </div>
    </ProtectedRoute>
  );
} 