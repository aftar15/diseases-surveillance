"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip during initial loading
    if (isLoading) return;

    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      // Store the current URL to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.push("/login");
      return;
    }

    // If roles are specified and user's role is not included, redirect to unauthorized
    if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, isLoading, router, pathname, allowedRoles]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated and role check passes, render children
  if (isAuthenticated && (!allowedRoles || (user && allowedRoles.includes(user.role)))) {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
} 