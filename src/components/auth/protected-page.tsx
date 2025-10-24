"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/types";

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedPage({ 
  children, 
  requiredRole, 
  redirectTo = "/unauthorized" 
}: ProtectedPageProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If no user is authenticated, redirect to login
      if (!user) {
        router.push("/login");
        return;
      }

      // If a specific role is required and user doesn't have it, redirect
      if (requiredRole && user.role !== requiredRole) {
        router.push(redirectTo);
        return;
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if user is not authenticated or doesn't have required role
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
